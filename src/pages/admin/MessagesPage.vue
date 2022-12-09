<template>
  <q-page class="relative-position">
    <q-scroll-area
      :visible="false"
      class="absolute full-width full-height q-pa-md"
    >
      <div class="q-pa-md">
        <q-toolbar class="primary">
          <div class="row absolute-center">
            <q-icon size="sm" class="makeMeLower" name="chat"></q-icon>
            <q-toolbar-title> Your chats </q-toolbar-title>
          </div>
        </q-toolbar>
      </div>
      <div class="search">
        <div class="searchForm">
          <q-icon name="search" size="md" class="searchIcon" />
          <q-input
            type="text"
            placeholder="Search for a user"
            borderless
            v-model="searchUsers"
            class="searchInput"
            :bg-color="$q.dark.isActive ? 'transparent' : 'transparent'"
            @keydown.enter="handleSearch(value)"
          />
        </div>
      </div>
      <div class="full-width">
        <q-list
          v-for="user in users"
          :key="user.id"
          bordered
          class="q-mb-sm q-mt-sm"
        >
          <q-item
            v-if="user.value.displayName"
            @click="handleRedirect(user)"
            class="q-my-md"
            clickable
          >
            <q-item-section avatar>
              <q-avatar round size="xl">
                <q-img v-bind:src="user.value.image" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label
                >{{ user.value.displayName }}
                <q-icon
                  :name="user.value.verified ? 'verified' : ''"
                  :class="
                    user.value.verified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
              /></q-item-label>
              <q-item-label v-if="user.value.displayName" caption lines="2">{{
                user.value.bio
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list v-for="chat in chats" :key="chat.id">
          <q-item
            v-if="myID === chat.senderID || myID === chat.receiverID"
            @click="handleChat(chat)"
            class="q-my-md"
            clickable
          >
            <q-item-section avatar>
              <q-avatar round size="xl">
                <q-img
                  v-bind:src="
                    chat.myUsername === myUsername
                      ? chat.theirImage
                      : chat.myImage
                  "
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label
                v-if="myID === chat.senderID || myID === chat.receiverID"
                class="text-subtitle2"
                ><strong>{{
                  chat.myUsername === myUsername ? chat.theirName : chat.myName
                }}</strong>
                <q-icon
                  :name="
                    theyVerified === chat.theyVerified &&
                    myVerified === chat.theyVerified
                      ? 'verified'
                      : ''
                  "
                  :class="
                    chat.theyVerified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
                />
                <span class="text-grey-7">
                  @{{
                    chat.myUsername === myUsername
                      ? chat.theirUsername
                      : chat.myUsername
                  }}
                  &bull;
                  <br class="lt-md" />
                </span>
                <span class="text-grey-7">
                  {{
                    formatDistance(chat.lastMessageAt, new Date(), {
                      addSuffix: true,
                    })
                  }}</span
                >
              </q-item-label>
              <q-item-label caption lines="2"
                ><strong v-if="chat.myUsername === myUsername">You: </strong
                >{{ chat.lastMessage }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { ref, toRaw, nextTick } from "vue";
import {
  collection,
  orderBy,
  query as fsQuery,
  onSnapshot,
  getDocs,
  setDoc,
  getDoc,
  where,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  onValue,
  update,
  orderByKey,
  query as dbQuery,
  equalTo,
  orderByChild,
  orderByValue,
} from "firebase/database";
import db, { auth, database } from "../../boot/firebase";
import { formatDistance } from "date-fns";

const imageRef = ref(null);
const imageUrlRef = ref("");
const searchUsersRef = ref("");

export default {
  name: "MessagesPage",

  data() {
    return {
      receiverVerified: false,
      formatDistance,
      imageUrl: imageUrlRef,
      image: imageRef,
      searchUsers: searchUsersRef,
      myName: "",
      theirName: "",
      componentKey: 0,
      myUsername: "",
      theirUsername: "",
      theyVerified: false,
      myVerified: false,
      userID: "",
      myID: auth.currentUser.uid,
      users: [],
      chats: [],
      myMessages: [],
      messageContent: "",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      theirImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
    };
  },
  watch: {
    searchUsers(value) {
      this.handleSearch(value);
    },
  },
  methods: {
    async handleSearch(value) {
      const db2 = getDatabase();

      if (this.searchUsers === "") {
        this.users = [];
        return;
      } else {
        const userQ = dbQuery(
          dbRef(db2, "users"),
          orderByChild("username"),
          equalTo(value)
        );
        get(userQ).then((snapshot) => {
          if (snapshot.exists()) {
            const key = snapshot.key;
            const data = snapshot.val();

            this.users = Object.entries(data, key).map(([id, value]) => ({
              id,
              value,
            }));

            // this.users = Object.keys(data).map(function (key) {
            //   return { [data]: data[key] };
            // });
            // console.log(toRaw(this.users));
          }
        });
      }
    },
    async handleRedirect(user) {
      const myID = auth.currentUser.uid;

      const receiverList = await getDocs(
        fsQuery(
          collection(db, "chats/"),
          where("receiverID", "in", [user.id, myID])
        )
      );

      if (!receiverList.empty) {
        receiverList.forEach(async (receiver) => {
          const receiverID = receiver.data().receiverID;
          const senderID = receiver.data().senderID;
          const id = receiver.id;
          if (receiverID === myID) {
            if (senderID === user.id) {
              this.$router.push("/messages/" + id);
            } else {
              await addDoc(collection(db, "chats"), {
                lastMessage: "",
                receiverID: user.id,
                senderID: myID,
              }).then(async (docRef) => {
                await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
                this.$router.push("/messages/" + docRef.id);
              });
            }
          } else if (receiverID === user.id) {
            if (senderID === myID) {
              this.$router.push("/messages/" + id);
            } else {
              await addDoc(collection(db, "chats"), {
                lastMessage: "",
                receiverID: user.id,
                senderID: myID,
              }).then(async (docRef) => {
                await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
                this.$router.push("/messages/" + docRef.id);
              });
            }
          } else {
            console.log("No chats with these ID's yet made.");
          }
        });
      } else {
        console.log("No data yet, creating...");
        await addDoc(collection(db, "chats"), {
          lastMessage: "",
          receiverID: user.id,
          theirImage: this.theirImage,
          myImage: this.myImage,
          lastMessageAt: Date.now(),
          senderID: myID,
        }).then(async (docRef) => {
          await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
          this.$router.push("/messages/" + docRef.id);
        });
      }
    },
    handleChat(chat) {
      this.$router.push("/messages/" + chat.id);
    },
    async getChats() {
      const myID = auth.currentUser.uid;

      const receiverQuery = await fsQuery(
        collection(db, "chats/"),
        orderBy("lastMessageAt", "asc")
      );

      const unsubscribe = onSnapshot(receiverQuery, (querySnapshot) => {
        querySnapshot.docChanges().forEach((chats) => {
          let data = chats.doc.data();
          data.id = chats.doc.id;

          if (chats.type === "added") {
            this.chats.unshift(data);
          }
          if (chats.type === "modified") {
            let index = this.chats.findIndex((chat) => chat.id === data.id);
            this.chats.splice(index, 1);
            this.chats.unshift(data);
          }
          if (chats.type === "removed") {
            let index = this.chats.findIndex((chat) => chat.id === data.id);
            this.chats.splice(index, 1);
          }
        });
      });
    },
  },
  async mounted() {
    const myID = auth.currentUser.uid;

    const receiverList = await getDocs(
      fsQuery(collection(db, "chats"), where("senderID", "==", myID))
    );
    receiverList.forEach(async (chats) => {
      const id = chats.id;
      const data = chats.data();
      this.userID = data.senderID;

      const db2 = getDatabase();

      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${data.senderID}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.theirUsername = snapshot.val().username;
            this.theirName = snapshot.val().displayName;
            this.theirImage = snapshot.val().image;
            this.theyVerified = snapshot.val().verified;
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });

      get(child(dbReff, `users/${myID}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.myUsername = snapshot.val().username;
            this.myName = snapshot.val().displayName;
            this.myImage = snapshot.val().image;
            this.myVerified = snapshot.val().verified;
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
    this.getChats();
  },
};
</script>

<style lang="scss" scoped>
.hideWhenNotVerified {
  display: none;
}
.alignMe {
  text-align: center;
}
.searchForm {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 30px;
  background-color: $grey-10;
}
.searchInput {
  width: 93%;
}
.makeMeLower {
  margin-top: 5px;
}
.showWhenVerified {
  margin-top: -3px;
  margin-right: 3px;
}
.avatar {
  object-fit: cover;
}
</style>
