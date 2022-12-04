<template>
  <q-page class="relative-position">
    <q-scroll-area
      :visible="false"
      class="absolute full-width full-height q-pa-md"
    >
      <div class="full-width">
        <q-list>
          <q-item
            v-for="message in messages"
            :key="message.id"
            :to="'/messages/' + message.receiverID"
            class="q-my-md"
            clickable
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                {{ message.avatar }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label
                >{{ message.receiverName }}
                <q-icon
                  :name="message.receiverVerified ? 'verified' : ''"
                  :class="
                    message.receiverVerified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
              /></q-item-label>
              <q-item-label caption lines="2">{{
                message.content
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { ref, nextTick } from "vue";
import {
  collection,
  orderBy,
  query,
  onSnapshot,
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
} from "firebase/database";
import db, { auth, database } from "../boot/firebase";
import { formatDistance } from "date-fns";

import MessageView from "../components/MessageView.vue";

const imageRef = ref(null);
const imageUrlRef = ref("");

export default {
  name: "MessagesPage",

  data() {
    return {
      receiverVerified: false,
      formatDistance,
      imageUrl: imageUrlRef,
      image: imageRef,
      displayName: "",
      username: "",
      receiverName: "",
      receiverUsername: "",
      receiverID: "",
      userID: "",
      messages: [],
      myMessages: [],
      messageContent: "",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
    };
  },
  watch: {
    messageWatcher: {
      handler(messages) {
        nextTick(() => {
          bottom.value?.scrollIntoView({ behavior: "smooth" });
        });
      },
      deep: true,
    },
  },
  methods: {},
  mounted() {
    this.userID = auth.currentUser.uid;

    const db2 = getDatabase();
    const userQ = dbQuery(dbRef(db2, "users"));
    get(userQ).then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val());
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${this.receiverID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.receiverUsername = snapshot.val().username;
              this.receiverName = snapshot.val().displayName;
              this.receiverImage = snapshot.val().image;
              this.receiverVerified = snapshot.val().verified;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });

    const q = query(
      collection(db, "messages"),
      orderBy("date", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        let messageChange = change.doc.data();
        messageChange.id = change.doc.id;

        if (change.type === "added") {
          this.messages.unshift(messageChange);
          this.myMessages.unshift(messageChange);

          if (messageChange.receiverID) {
            const joinedArray = this.myMessages.join(" ");
            const array = joinedArray.split(" ");
            const filteredArray = array.find(
              (item) => item === messageChange.id
            );

            const usernameRef = dbRef(
              database,
              "users/" + messageChange.receiverID
            );
            onValue(usernameRef, (snapshot) => {
              const data = snapshot.val();

              // if (messageChange.receiverID && messageChange.id) {
              //   const replaceInfo = doc(db, "messages/", filteredArray);
              //   const newInfo = {
              //     creatorUsername: data.username,
              //     creatorDisplayname: data.displayName,
              //     isUserVerified: data.verified,
              //   };
              //   updateDoc(replaceInfo, newInfo);
              // }
              // const replaceInfo = doc(db, "messages/", filteredArray);
              // const newInfo = {
              //   isUserVerified: this.userVerified,
              // };
              // updateDoc(replaceInfo, newInfo);
            });
          }
        }

        if (change.type === "modified") {
          let index = this.posts.findIndex((post) => post.id === postChange.id);
          Object.assign(this.posts[index], postChange);
        }
        if (change.type === "removed") {
          let index = this.posts.findIndex((post) => post.id === postChange.id);
          this.posts.splice(index, 1);
        }
      });
    });

    // const unsub = messagesQuery.onSnapshot((snapshot) => {
    //   messages.value = snapshot.docs
    //     .map((doc) => ({ id: doc.id, ...doc.data() }))
    //     .reverse();
    // });
  },
};
</script>

<style lang="scss" scoped>
.hideWhenNotVerified {
  display: none;
}
.showWhenVerified {
  margin-top: -3px;
  margin-right: 3px;
}
</style>
