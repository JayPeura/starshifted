<template>
  <q-page padding>
    <q-item v-for="message in messages" :key="message.id" class="q-py-md">
      <q-item-section avatar top>
        <label
          for="actual-btn"
          class="clickableLabel"
          @click="handleRedirect(post)"
        >
          <q-avatar size="xl">
            <img v-bind:src="message.creatorImage" class="avatar" /> </q-avatar
        ></label>

        <button id="actual-btn" hidden></button>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-subtitle1"
          ><strong @click="handleRedirect(post)" class="clickableLabel">{{
            message.creatorDisplayname
          }}</strong>
          <q-icon
            :name="message.isUserVerified ? 'verified' : ''"
            :class="
              message.isUserVerified
                ? 'showWhenVerified'
                : 'hideWhenNotVerified'
            "
          />
          <span class="text-grey-7">
            @{{ message.creatorUsername }}
            &bull;
            <br class="lt-md" />
          </span>
          <span class="text-grey-7">
            {{ formatDistance(message.date, new Date()) }}</span
          >
        </q-item-label>
        <q-item-label class="post-content text-body1">
          {{ message.content }}
          <img
            :src="message.postImg"
            :class="$q.dark.isActive ? 'postImage' : 'postImageBG'"
          />
        </q-item-label>
      </q-item-section>
    </q-item>

    <div class="q-py-lg q-px-md row items-end q-col-gutter-sm">
      <div class="col">
        <q-input
          bottom-slots
          v-model="newMessage"
          placeholder="Send a message"
          filled
        >
        </q-input>
      </div>

      <div class="col col-shrink">
        <!-- <q-btn
          icon="image"
          round
          dense
          flat
          class="q-mb-lg"
          type="button"
          @click="pickFile"
        />
        <q-file
          style="display: none"
          v-model="image"
          accept=".jpg, image/*"
          @update:model-value="onFilePicked(e)"
          ref="files"
        >
        </q-file> -->
        <q-btn
          round
          dense
          flat
          @click="sendMessage"
          icon="send"
          class="q-mb-lg"
          :disable="!newMessage"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, watch, nextTick, onUnmounted, computed } from "vue";
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  addDoc,
  limit,
  deleteDoc,
  doc,
  setDoc,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
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

const messageRef = ref("");
const imageRef = ref(null);
const imageUrlRef = ref("");

export default {
  name: "MessagesPage",
  data() {
    return {
      newMessage: messageRef,
      userVerified: false,
      creatorVerified: false,
      formatDistance,
      imageUrl: imageUrlRef,
      image: imageRef,
      displayName: "",
      username: "",
      userID: "",
      messages: [],
      messageContent: "",
      receiverID: "",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      theirImage:
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
  methods: {
    sendMessage() {
      const creatorID = auth.currentUser.uid;

      const newMessageContent = {
        content: this.newMessage,
        date: Date.now(),
        isUserVerified: this.userVerified,
        username: this.currUsername,
        displayName: this.currName,
        avatar: this.myImage,
        userID: creatorID,
        msgImage: this.imageUrl,
      };

      addDoc(collection(db, `messages`), newMessageContent);
      this.newMessage = "";
    },
  },
  mounted() {
    this.userID = auth.currentUser.uid;

    const db2 = getDatabase();
    const userQ = dbQuery(dbRef(db2, "users"), equalTo(this.userID));
    get(userQ).then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val());
        console.log(snapshot.val());
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${key}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.currUsername = snapshot.val().username;
              this.profileName = snapshot.val().displayName;
              this.image = snapshot.val().image;
              this.isUserVerified = snapshot.val().verified;
              this.bio = snapshot.val().bio;
              if (key === userId) {
                this.isYourProfile = true;
              }
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
        console.log(messageChange);

        if (change.type === "added") {
          this.username = messageChange.username;
          this.displayName = messageChange.displayName;
          this.myImage = messageChange.myImage;
          this.messageContent = messageChange.message;
          this.receiverID = messageChange.receiverID;
          this.areTheyVerified = messageChange.isUserVerified;
          this.messageImage = messageChange.messageImage;
          this.messageID = messageChange.id;
          this.messages.push(messageChange);

          // if (postChange.creatorId === this.creatorID) {
          //   const joinedArray = this.myPosts.join(" ");
          //   const array = joinedArray.split(" ");
          //   const filteredArray = array.find((item) => item === postChange.id);

          const usernameRef = dbRef(database, "users/" + auth.currentUser.uid);
          onValue(usernameRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            // this.userVerified = data.verified;
            // this.currUsername = data.username;
            // this.currName = data.displayName;
            // this.myImage = data.image;

            //     if (this.creatorID === auth.currentUser.uid && this.postID) {
            //       const replaceInfo = doc(db, "posts/", filteredArray);
            //       const newInfo = {
            //         creatorUsername: data.username,
            //         creatorDisplayname: data.displayName,
            //         isUserVerified: data.verified,
            //       };
            //       updateDoc(replaceInfo, newInfo);
            //     }
            //     const replaceInfo = doc(db, "posts/", filteredArray);
            //     const newInfo = {
            //       isUserVerified: this.userVerified,
            //     };
            //     updateDoc(replaceInfo, newInfo);
          });
          // }
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
