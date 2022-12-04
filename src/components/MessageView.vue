<template>
  <q-page class="flex column">
    <q-scroll-area
      :visible="false"
      class="absolute full-width full-height spacious"
    >
      <q-btn
        style="left: 10px; position: fixed; top: 1%; z-index: 1"
        icon="arrow_back"
        color="primary"
        label="BACK"
        :to="'/messages/'"
        clickable
      />
      <div :class="!areThereMessages ? 'showIfMessages' : 'hideIfNoMessages'">
        <h5 style="width: 100%; text-align: center">
          This is the beginning of your messaging with <br />
          <strong style="margin-right: 4px">{{ displayName }}</strong>
          <q-icon
            :name="verified ? 'verified' : ''"
            :class="verified ? 'showWhenVerified' : 'hideWhenNotVerified'"
          />
          <span class="styleUsername">@{{ username }}</span>
        </h5>
        <p style="width: 100%; text-align: center">Send them a message!</p>
      </div>
      <div :class="areThereMessages ? 'showIfMessages' : 'hideIfNoMessages'">
        <div class="q-pa-md q-pt-xl column col justify-end">
          <transition-group appear>
            <q-chat-message
              v-for="message in messages"
              :key="message.id"
              :name="!sender ? message.displayName : 'You'"
              name-html
              :text="[message.content]"
              text-html
              :sent="sender ? true : false"
              :stamp="
                formatDistance(message.date, new Date(), {
                  addSuffix: true,
                })
              "
              size="5"
              text-color="white"
              bg-color="grey-9"
            />
            <!-- <q-item-section avatar top>
                  <label for="actual-btn">
                    <q-avatar size="xl">
                      <img
                        v-bind:src="message.photoUrl"
                        class="avatar"
                      /> </q-avatar
                  ></label>

                  <button id="actual-btn" hidden></button>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-subtitle1"
                    ><strong>{{ message.displayName }}</strong>
                    <q-icon
                      :name="message.verified ? 'verified' : ''"
                      :class="
                        message.verified
                          ? 'showWhenVerified'
                          : 'hideWhenNotVerified'
                      "
                    />
                    <span class="text-grey-7">
                      {{ formatDistance(message.date, new Date()) }}</span
                    >
                  </q-item-label>
                  <q-item-label class="post-content text-body1">
                    {{ message.content }}
                    <img
                      :src="messageImg"
                      :class="$q.dark.isActive ? 'postImage' : 'postImageBG'"
                    />
                  </q-item-label>
                </q-item-section> -->

            <!-- <div :class="!sender ? 'hideIfSender' : 'showIfSender'"> -->
            <!-- <q-item class="q-py-md ISentIt">
                <q-item-section>
                  <q-item-label class="text-subtitle1"
                    ><strong style="margin-right: 5px">You</strong>
                    <span class="text-grey-7">
                      {{ formatDistance(message.date, new Date()) }}</span
                    >
                  </q-item-label>
                  <q-item-label class="message-content text-body1">
                    {{ message.content }}
                    <img
                      :src="messageImg"
                      :class="$q.dark.isActive ? 'postImage' : 'postImageBG'"
                    />
                  </q-item-label>
                </q-item-section>
              </q-item> -->
            <!-- </div> -->
          </transition-group>
        </div>
      </div>
      <div
        class="sendMessage full-width q-py-lg q-px-md row items-end q-col-gutter-sm"
      >
        <div class="col">
          <q-input
            bottom-slots
            v-model="content"
            placeholder="Start a new message"
            rounded
            outlined
            autogrow
            bg-color="grey-10"
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
            class="q-mb-lg higherPlease"
            :disable="!content"
          />
        </div>
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
  addDoc,
  limit,
  where,
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

export default {
  name: "MessageView",
  data() {
    return {
      areThereMessages: false,
      formatDistance,
      displayName: "",
      username: "",
      receiverID: "",
      photoUrl: "",
      sender: false,
      message: "",
      date: 0,
      messageImg: "",
      messages: [],
      content: messageRef,
      from: "You",
      verified: false,
      theirImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
    };
  },
  methods: {
    sendMessage() {
      const myID = auth.currentUser.uid;
      const newMessageContent = {
        content: this.content,
        date: Date.now(),
        receiverUsername: this.username,
        senderID: myID,
        receiverID: this.receiverID,
        receiverVerified: this.verified,
        receiverName: this.displayName,
        image: this.theirImage,
      };

      addDoc(collection(db, `messages`), newMessageContent);
      this.content = "";
    },
    getMessages() {
      const receiverID = this.$route.params.userID;

      const getAllMessages = query(
        collection(db, "messages"),
        orderBy("date", "desc"),
        limit(100),
        where("receiverID", "in", [receiverID, this.userID])
      );

      const unsubscribe = onSnapshot(getAllMessages, (snapshot) => {
        this.messages = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .reverse();
        snapshot.docChanges().forEach(async (change) => {
          let messageChange = change.doc.data();
          messageChange.id = change.doc.id;
          if (messageChange.receiverID !== this.userID) {
            this.sender = true;
          } else {
            this.sender = false;
          }

          if (change.type === "added") {
            this.username = messageChange.receiverUsername;
            this.displayName = messageChange.receiverName;
            this.creatorImage = messageChange.image;
            this.receiverID = messageChange.receiverID;
            this.postImage = messageChange.postImg;
            this.theirImage = messageChange.image;
            this.messageID = messageChange.id;
            this.date = messageChange.date;
            this.message = messageChange.content;
            this.areThereMessages = true;

            // if (postChange.creatorId === this.creatorID) {
            //   const joinedArray = this.myPosts.join(" ");
            //   const array = joinedArray.split(" ");
            //   const filteredArray = array.find((item) => item === postChange.id);

            // const usernameRef = dbRef(database, "users/" + auth.currentUser.uid);
            // onValue(usernameRef, (snapshot) => {
            //   const data = snapshot.val();
            //   console.log(data);
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
            // });
            // }
          }

          if (change.type === "modified") {
            let index = this.posts.findIndex(
              (post) => post.id === postChange.id
            );
            Object.assign(this.posts[index], postChange);
          }
          if (change.type === "removed") {
            let index = this.posts.findIndex(
              (post) => post.id === postChange.id
            );
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
  },
  mounted() {
    this.userID = auth.currentUser.uid;

    const receiverID = this.$route.params.userID;

    const db2 = getDatabase();
    const userQ = dbQuery(dbRef(db2, "users"));
    get(userQ).then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val());
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${receiverID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.username = snapshot.val().username;
              this.displayName = snapshot.val().displayName;
              this.theirImage = snapshot.val().image;
              this.verified = snapshot.val().verified;
              this.receiverID = receiverID;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
    this.getMessages();
  },
};
</script>

<style lang="scss" scoped>
.showIfMessages {
  display: block;
}
.hideWhenNotVerified {
  display: none;
}
.showWhenVerified {
  margin-top: -3px;
  margin-right: 3px;
}
.hideIfNoMessages {
  display: none;
}
.higherPlease {
  margin-bottom: 30px;
}
.styleUsername {
  color: $grey-7;
}
.showIfSender {
  position: absolute;
  right: 0;
}
.hideIfSender {
  display: none;
}
.message-content {
  white-space: pre-line;
}
.ISentIt {
  background-color: $grey-10;
  border-radius: 10px;
  margin-right: 10px;
  padding: 15px;
}

.spacious {
  padding-bottom: 90px;
}
.sendMessage {
  position: fixed;
  bottom: 0;
  margin-bottom: -20px;
}
.getmedown {
  top: 60px;
}
</style>
