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
        label="TO MESSAGES"
        :to="'/admin/messages'"
        clickable
      />
      <div :class="!areThereMessages ? 'showIfMessages' : 'hideIfNoMessages'">
        <h5 style="width: 100%; text-align: center">
          This is the beginning of your messaging with <br />
          <strong style="margin-right: 4px">{{ theirName }}</strong>
          <q-icon
            :name="theyVerified ? 'verified' : ''"
            :class="theyVerified ? 'showWhenVerified' : 'hideWhenNotVerified'"
          />
          <span class="styleUsername">@{{ theirUsername }}</span>
        </h5>
        <p style="width: 100%; text-align: center">Send them a message!</p>
      </div>
      <div :class="areThereMessages ? 'showIfMessages' : 'hideIfNoMessages'">
        <div class="q-pa-md q-pt-xl">
          <q-chat-message
            v-for="message in messages"
            :key="message.id"
            :name="
              message.senderID !== myID
                ? message.senderName + ' @' + message.senderUsername
                : 'You'
            "
            name-html
            :text="[message.content]"
            text-html
            :sent="message.senderID === myID ? true : false"
            :bg-color="message.senderID !== myID ? 'grey-10' : 'grey-9'"
            :stamp="
              formatDistance(message.date, new Date(), {
                addSuffix: true,
              })
            "
            size="5"
            text-color="white"
          >
            <template v-if="myID === message.senderID" v-slot:avatar>
              <img
                class="q-message-avatar q-message-avatar--sent"
                :src="
                  myID !== message.senderID ? message.image : message.myImage
                "
            /></template>
            <template v-else-if="myID === message.receiverID" v-slot:avatar>
              <img
                style="cursor: pointer"
                @click="handleAvatarRedirect(message)"
                class="q-message-avatar q-message-avatar--sent"
                :src="
                  myID === message.senderID ? message.image : message.myImage
                "
            /></template>
          </q-chat-message>

          <!-- OLD MESSAGE STRUCTURE -->
          <!-- <transition-group
            appear
            enter-active-class="animated fadeIn slow"
            leave-active-class="animated fadeOut slow"
          >
            <q-item
              v-for="message in messages"
              :key="message.id"
              class="q-py-md"
            >
              <div v-if="!sender">
                <q-item class="q-py-md YouSentIt">
                  <q-item-section avatar top>
                    <label for="actual-btn">
                      <q-avatar size="xl">
                        <img
                          v-bind:src="message.image"
                          class="avatar"
                        /> </q-avatar
                    ></label>
                    <button id="actual-btn" hidden></button>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle1"
                      ><strong>{{ message.displayName }}</strong> {{ " " }}
                      <q-icon
                        :name="!message.receiverVerified ? 'verified' : ''"
                        :class="
                          !message.receiverVerified
                            ? 'showWhenVerified'
                            : 'hideWhenNotVerified'
                        "
                      />
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
                    </q-item-label> </q-item-section
                ></q-item>
              </div>
              <div v-else>
                <q-item
                  :class="sender ? 'q-py-md ISentIt' : 'q-py-md YouSentIt'"
                >
                  <q-item-section>
                    <q-item-label class="text-subtitle1"
                      ><strong style="margin-right: 5px">You</strong>
                      <span class="text-grey-7">
                        {{
                          formatDistance(message.date, new Date(), {
                            addSuffix: true,
                          })
                        }}</span
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
                </q-item>
              </div>
            </q-item>
          </transition-group> -->
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
            :bg-color="$q.dark.isActive ? 'grey-10' : 'grey-5'"
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
      <div id="scrollPage"></div>
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
  setDoc,
  getDoc,
  limit,
  doc,
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
import db, { auth, database } from "../../boot/firebase";
import { formatDistance } from "date-fns";

const messageRef = ref("");
const scrollPage = ref();

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
      myID: auth.currentUser.uid,
      theirUsername: "",
      photoUrl: "",
      sender: false,
      message: "",
      chatID: "",
      date: 0,
      messageImg: "",
      messages: [],
      content: messageRef,
      from: "You",
      theyVerified: false,
      myVerified: false,
      theirImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
    };
  },
  watch: {
    messages() {
      nextTick(() => {
        this.scrollPageTo();
      });
    },
  },
  methods: {
    handleAvatarRedirect(message) {
      console.log(message);
      this.$router.push("/admin/profile/" + toRaw(message.senderUsername));
    },
    scrollPageTo() {
      let element = document.querySelector(`#scrollPage`);
      element.scrollIntoView({
        behavior: "smooth",
      });
    },
    handleRedirect(message) {
      this.$router.push("/profile/" + message.receiverUsername);
    },
    async sendMessage() {
      const myID = auth.currentUser.uid;
      const id = this.$route.params.chatID;
      const getReceiverID = await getDoc(doc(db, "chats/" + id));
      const receiver = getReceiverID.data().receiverID;
      const sender = getReceiverID.data().senderID;

      if (receiver === myID) {
        this.receiverID = sender;
      } else {
        this.receiverID = receiver;
      }

      const newMessageContent = {
        content: this.content,
        date: Date.now(),
        senderID: myID,
        receiverID: this.receiverID,
        receiverVerified: this.theyVerified,
        receiverUsername: this.theirUsername,
        senderName: this.myName,
        image: this.theirImage,
        myImage: this.myImage,
        receiverName: this.theirName,
        senderUsername: this.username,
      };

      await addDoc(
        collection(db, `chats/${this.chatID}/messages`),
        newMessageContent
      );

      await setDoc(
        doc(db, `chats/${this.chatID}`),
        {
          lastMessage: this.content,
          lastMessageAt: Date.now(),
          myVerified: this.myVerified,
          theyVerified: this.theyVerified,
          myImage: this.myImage,
          theirImage: this.theirImage,
          theirName: this.theirName,
          theirUsername: this.theirUsername,
          myUsername: this.username,
          myName: this.myName,
        },
        { merge: true }
      );
      this.content = "";
    },
    getMessages() {
      const myID = auth.currentUser.uid;

      const getAllMessages = query(
        collection(db, "chats/" + this.chatID + "/messages"),
        orderBy("date", "desc")
      );
      const unsubscribe = onSnapshot(getAllMessages, (snapshot) => {
        this.messages = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .reverse();
        snapshot.docChanges().forEach(async (change) => {
          let messageChange = change.doc.data();
          messageChange.id = change.doc.id;

          if (change.type === "added") {
            this.areThereMessages = true;
          }
        });
      });
    },
  },
  async mounted() {
    this.chatID = this.$route.params.chatID;
    const myID = auth.currentUser.uid;

    const id = this.$route.params.chatID;
    const getReceiverID = await getDoc(doc(db, "chats/" + id));
    const receiver = getReceiverID.data().receiverID;
    const sender = getReceiverID.data().senderID;

    const dbReff = dbRef(getDatabase());

    if (receiver === myID) {
      get(child(dbReff, `users/${sender}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.theirName = snapshot.val().displayName;
            this.theirUsername = snapshot.val().username;
            this.theirImage = snapshot.val().image;
            this.theyVerified = snapshot.val().verified;
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      get(child(dbReff, `users/${receiver}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.theirName = snapshot.val().displayName;
            this.theirUsername = snapshot.val().username;
            this.theirImage = snapshot.val().image;
            this.theyVerified = snapshot.val().verified;
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    const db2 = getDatabase();
    const userQ = dbQuery(dbRef(db2, "users"));
    get(userQ).then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val());

        get(child(dbReff, `users/${myID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.username = snapshot.val().username;
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
.q-message-avatar {
  object-fit: cover;
  margin-right: 5px;
  margin-bottom: 7px;
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
.YouSentIt {
  background-color: $grey-10;
  max-width: 20em;
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
