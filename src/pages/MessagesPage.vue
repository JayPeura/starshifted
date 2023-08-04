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
          <q-input
            type="text"
            placeholder="Search for a user"
            borderless
            v-model="searchUsers"
            class="searchInput"
            :bg-color="$q.dark.isActive ? 'transparent' : 'transparent'"
            @keydown.enter="handleSearch(value)"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="md" /> </template
          ></q-input>
        </div>
      </div>
      <div class="full-width">
        <q-list
          v-for="user in searchedUsers"
          :key="user.id"
          :bordered="user.id !== myID"
          class="q-mb-sm q-mt-sm"
        >
          <q-item
            v-if="user.value.displayName && user.id !== myID"
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
                  :name="user.value.verified ? 'bi-moon-stars-fill' : ''"
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
          <q-item @click="handleChat(chat)" class="q-my-md" clickable>
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
              <q-item-label class="text-subtitle2"
                ><strong>{{
                  chat.myUsername === myUsername ? chat.theirName : chat.myName
                }}</strong>
                <q-icon
                  :name="checkVerifiedName(chat)"
                  :class="checkVerifiedClass(chat)"
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
  limit,
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
import db, { auth, database } from "../boot/firebase";
import { formatDistance } from "date-fns";

const imageRef = ref(null);
const imageUrlRef = ref("");
const searchUsersRef = ref("");

export default {
  name: "MessagesPage",
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.chats = [];
      vm.users = [];
      vm.getChats();
      vm.getAllUsers();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.chats = [];
    this.users = [];
    this.getChats();
    this.getAllUsers();
    next();
  },
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
      allUsers: [],
      searchedUsers: [],
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
    checkVerifiedClass(chat) {
      if (chat.theyVerified && this.theyVerified) {
        return "showWhenVerified";
      } else if (chat.myVerified && this.theyVerified) {
        return "showWhenVerified";
      } else if (chat.myVerified && chat.theyVerified) {
        return "showWhenVerified";
      } else if (!chat.myVerified) {
        return "hideWhenNotVerified";
      } else if (!chat.myVerified && !this.myVerified) {
        return "hideWhenNotVerified";
      } else if (!chat.theyVerified && !this.myVerified) {
        return "hideWhenNotVerified";
      } else if (!chat.theyVerified && !this.theyVerified) {
        return "hideWhenNotVerified";
      }
    },
    checkVerifiedName(chat) {
      if (chat.theyVerified && this.theyVerified) {
        return "bi-moon-stars-fill";
      } else if (chat.myVerified && this.theyVerified) {
        return "bi-moon-stars-fill";
      } else if (chat.myVerified && chat.theyVerified) {
        return "bi-moon-stars-fill";
      } else if (!chat.myVerified) {
        return "";
      } else if (!chat.myVerified && !this.myVerified) {
        return "";
      } else if (!chat.theyVerified && !this.myVerified) {
        return "";
      } else if (!chat.theyVerified && !this.theyVerified) {
        return "";
      }
    },
    async handleSearch(value) {
      if (this.searchUsers === "") {
        this.searchedUsers = [];
        return;
      } else {
        const results = Object.values(this.users).filter((user) => {
          return user.value.username
            .toLowerCase()
            .startsWith(this.searchUsers.toLowerCase());
        });
        this.searchedUsers = results;
      }
    },
    async handleRedirect(user) {
      const myID = auth.currentUser.uid;

      const IDs = [myID, user.id];
      const IDs2 = [user.id, myID];

      const participantList = await getDocs(
        fsQuery(collection(db, "chats"), where("participants", "==", IDs))
      );

      if (!participantList.empty) {
        participantList.forEach(async (receiver) => {
          const pList = receiver.data();
          this.$router.push("/messages/" + pList.id);
        });
      } else {
        const theirList = await getDocs(
          fsQuery(collection(db, "chats"), where("participants", "==", IDs2))
        );
        if (!theirList.empty) {
          theirList.forEach(async (theirs) => {
            const tList = theirs.data();

            this.$router.push("/messages/" + tList.id);
          });
        } else {
          await addDoc(collection(db, "chats"), {
            lastMessage: "",
            theirImage: this.theirImage,
            myImage: this.myImage,
            lastMessageAt: Date.now(),
            participants: [user.id, myID],
          }).then(async (docRef) => {
            await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
            this.$router.push("/messages/" + docRef.id);
          });
        }
      }
    },
    getAllUsers() {
      const db2 = getDatabase();

      const userQ = dbQuery(dbRef(db2, "users"), orderByChild("username"));
      get(userQ).then((snapshot) => {
        if (snapshot.exists()) {
          const key = snapshot.key;
          const data = snapshot.val();
          this.users = Object.entries(data, key).map(([id, value]) => ({
            id,
            value,
          }));
        }
      });
    },
    handleChat(chat) {
      this.$router.push("/messages/" + chat.id);
    },
    async getChats() {
      const myID = auth.currentUser.uid;

      const participantQuery = await fsQuery(
        collection(db, "chats"),
        where("participants", "array-contains", myID),
        orderBy("lastMessageAt", "asc")
      );

      const unsubscribe = onSnapshot(participantQuery, (querySnapshot) => {
        querySnapshot.docChanges().forEach((chats) => {
          let data = chats.doc.data();
          data.id = chats.doc.id;

          if (
            data.participants.includes(this.userID && myID) &&
            data.lastMessage !== ""
          ) {
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
          }
        });
      });
    },
  },
  async mounted() {
    const myID = auth.currentUser.uid;

    const receiverList = await getDocs(
      fsQuery(
        collection(db, "chats"),
        where("participants", "array-contains", myID)
      )
    );
    receiverList.forEach(async (chats) => {
      const id = chats.id;
      const data = chats.data();
      const theirID = data.participants.find((id) => id !== myID);
      this.userID = theirID;
      const db2 = getDatabase();

      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${theirID}`))
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
