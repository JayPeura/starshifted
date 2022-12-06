<template>
  <q-page class="relative-position">
    <q-scroll-area
      :visible="false"
      class="absolute full-width full-height q-pa-md"
    >
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
        <q-list v-for="user in users" :key="user.id">
          <q-item
            v-if="user.value.displayName"
            @click="handleRedirect(user)"
            class="q-my-md"
            clickable
          >
            <q-item-section avatar>
              <q-avatar size="xl">
                <img v-bind:src="user.value.image" class="avatar" />
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
            v-if="chat.data.lastMessage"
            @click="handleChat(chat)"
            class="q-my-md"
            clickable
          >
            <q-item-section avatar>
              <q-avatar size="xl">
                <img v-bind:src="chat.userImage" class="avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label
                >{{ chat.userDisplayName }}
                <q-icon
                  :name="chat.userVerified ? 'verified' : ''"
                  :class="
                    chat.userVerified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
              /></q-item-label>
              <q-item-label caption lines="2">{{
                chat.data.lastMessage
              }}</q-item-label>
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
  query,
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
import db, { auth, database } from "../boot/firebase";
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
      displayName: "",
      theirUsername: "",
      receiverID: "",
      userID: "",
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
    getChatImage() {},
    async handleSearch(value) {
      const db2 = getDatabase();

      if (this.searchUsers === "") {
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
      const querySnapshot = await getDocs(collection(db, "chats"));
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docs) => {
          const data = docs.data();
          const id = docs.id;

          // WORK ON THIS!!!!!
          const receiverList = await getDocs(
            query(
              collection(db, "chats/" + id + "/messages"),
              where("receiverID", "==", user.id)
            )
          );
          const senderList = await getDocs(
            query(
              collection(db, "chats/" + id + "/messages"),
              where("senderID", "==", user.id)
            )
          );
          if (receiverList.empty && senderList.empty) {
            console.log("No chat records found");
            // await addDoc(collection(db, "chats"), {
            //   lastMessage: "",
            //   receiverID: user.id,
            // }).then((docRef) => {
            //   this.$router.push("/messages/" + docRef.id);
            // });
          } else {
            console.log("Either list has data");
            return;
          }
        });
      } else {
        console.log("No data yet, creating...");
        await addDoc(collection(db, "chats"), {
          lastMessage: "",
          receiverID: user.id,
        }).then((docRef) => {
          this.$router.push("/messages/" + docRef.id);
        });
      }
      this.searchUsers = "";
    },
    handleChat(chat) {
      this.$router.push("/messages/" + chat.id);
    },
    async getChats() {
      const querySnapshot = await getDocs(collection(db, "chats"));
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (chats) => {
          const id = chats.id;
          const data = chats.data();

          this.chats.push({ id: id, data: data });

          // console.log(toRaw(this.chats));
          if (id) {
            const messageSnapshot = await getDocs(
              collection(db, "chats/" + id + "/messages")
            );

            if (messageSnapshot.empty) {
              console.log(
                "Empty... Populating by one (1) empty message. Ignore this."
              );
              await addDoc(collection(db, "chats/" + id + "/messages"), {
                content: "",
              });
            } else {
              // const unsub = onSnapshot(doc(db, "chats", id), (doc) => {
              //   console.log(doc.data());
              //   console.log(toRaw(this.chats));
              // });

              // const getMessages = await getDoc(doc(db, "chats/" + id));
              // getMessages.forEach((message) => {
              //   const key = message.id;
              //   const data = message.data();
              //   this.chats.push(data);

              //   // console.log(toRaw(this.chats));
              // });
              return () => {
                unsub();
              };
            }
          }
        });
      } else {
        console.log("No data");
      }
    },
  },
  mounted() {
    this.userID = auth.currentUser.uid;

    this.getChats();
  },
};
</script>

<style lang="scss" scoped>
.hideWhenNotVerified {
  display: none;
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

.showWhenVerified {
  margin-top: -3px;
  margin-right: 3px;
}
.avatar {
  object-fit: cover;
}
</style>
