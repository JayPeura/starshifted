<template>
  <q-page ref="scrollPage" class="flex column">
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
          <strong style="margin-right: 4px">{{ theirName }}</strong>
          <q-icon
            :name="verified ? 'verified' : ''"
            :class="verified ? 'showWhenVerified' : 'hideWhenNotVerified'"
          />
          <span class="styleUsername">@{{ username }}</span>
        </h5>
        <p style="width: 100%; text-align: center">Send them a message!</p>
      </div>
      <div :class="areThereMessages ? 'showIfMessages' : 'hideIfNoMessages'">
        <div class="q-pa-md">
          <transition-group appear>
            <q-chat-message
              v-for="message in messages"
              :key="message.id"
              :name="
                message.receiverID === this.userID ? message.displayName : 'You'
              "
              :avatar="message.image"
              name-html
              :text="[message.content]"
              text-html
              :sent="message.receiverID === this.userID ? false : true"
              bg-color="grey-10"
              :stamp="
                formatDistance(message.date, new Date(), {
                  addSuffix: true,
                })
              "
              size="5"
              text-color="white"
            />
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
            bg-color="grey-10"
            @keyup.enter="sendMessage"
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
  set,
  get,
  ref as dbRef,
  getDatabase,
  child,
  push,
  onValue,
  update,
  orderByKey,
  query as dbQuery,
  equalTo,
  onChildAdded,
  orderByChild,
} from "firebase/database";
import db, { auth, database } from "../boot/firebase";
import { formatDistance } from "date-fns";

const messageRef = ref("");
const scrollPage = ref("");

export default {
  name: "MessageView",
  data() {
    return {
      areThereMessages: false,
      formatDistance,
      theirName: "",
      myName: "",
      username: "",
      receiverID: "",
      userID: "",
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
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
    };
  },
  watch: {
    messages: function (val) {
      if (Object.keys(val).length) {
        this.scrollToBottom();
      }
    },
  },
  methods: {
    scrollToBottom() {
      let scrollPage = this.$refs.scrollPage.$el;
      setTimeout(() => {
        window.scrollTo(0, scrollPage.scrollHeight);
      }, 20);
    },
    sendMessage() {
      const myID = auth.currentUser.uid;

      const newMessageContent = {
        content: this.content,
        date: Date.now(),
        senderID: myID,
        receiverID: this.receiverID,
        receiverVerified: this.verified,
        senderName: this.theirName,
        image: this.theirImage,
        displayName: this.myName,
      };
      const db2 = getDatabase();

      addDoc(collection(db, `messages/`), newMessageContent);
      this.content = "";
    },
    getMessages() {
      const myID = auth.currentUser.uid;
      const receiverID = this.$route.params.theirID;
      this.receiverID = receiverID;

      const q = query(collection(db, "messages"), orderBy("date"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const changeData = change.doc.data();
          changeData.id = change.doc.id;
          this.messageID = changeData.id;

          if (change.type === "added") {
            this.creatorID = changeData.creatorId;
            this.messages.push(changeData);
            this.areThereMessages = true;
            // Object.keys(data).forEach((key) => {
            //   this.messages.push({
            //     id: key,
            //     content: data[key].content,
            //     date: data[key].date,
            //     image: data[key].image,
            //     displayName: data[key].displayName,
            //   });
            // });
          }
        });
      });
    },
  },
  mounted() {
    const myID = auth.currentUser.uid;

    const receiverID = this.$route.params.theirID;

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
              this.theirName = snapshot.val().displayName;
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
        get(child(dbReff, `users/${myID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.myUsername = snapshot.val().username;
              this.myName = snapshot.val().displayName;
              this.myImage = snapshot.val().image;
              this.ImVerified = snapshot.val().verified;
              this.userID = myID;
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
