<template>
  <q-page class="relative-position">
    <q-scroll-area :visible="false" class="absolute full-width full-height">
      <div
        v-if="!feedbackSent && !admin"
        class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm"
      >
        <div class="col">
          <q-input v-model="name" placeholder="Your name or username"></q-input>

          <q-input
            bottom-slots
            v-model="newFeedback"
            placeholder="Feedback content"
            autogrow
            class="new-post"
          >
          </q-input>
        </div>

        <div class="col col-shrink">
          <q-btn
            round
            dense
            flat
            @click="addNewPost"
            icon="send"
            class="q-mb-lg"
            :disable="!newFeedback || !name"
          />
        </div>
      </div>
      <div v-if="feedbackSent">
        <h5 style="text-align: center">Thank you for your feedback!</h5>
      </div>
      <q-list v-if="admin" separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item v-for="post in feedback" :key="post.id" class="q-py-md">
            <q-item-section>
              <q-item-label>
                <span class="text-grey-7 postName">
                  {{ post.name }}
                </span>
                <span
                  class="text-grey-7"
                  style="position: relative; padding-right: 50px; float: right"
                >
                  {{
                    post.date > Date.now() - 35 * 60 * 60 * 1000
                      ? formatDistanceStrict(post.date, new Date())
                      : format(post.date, "d MMM")
                  }}</span
                >
              </q-item-label>
              <q-item-label class="post-content text-body1">
                {{ post.content }}
              </q-item-label>
            </q-item-section>
            <q-btn
              round
              dense
              flat
              icon="close"
              class="showwhenimagebtn"
              @click="confirm(post)"
            ></q-btn>
          </q-item>
        </transition-group>

        <q-separator
          size="1px"
          :color="$q.dark.isActive ? 'grey-9' : 'grey-4'"
          :class="$q.dark.isActive ? 'dividerDark' : 'dividerLight'"
        />
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { formatDistanceStrict, formatDistance, format } from "date-fns";
import { ref as dbRef, getDatabase, get, child } from "firebase/database";
import db, { auth } from "src/boot/firebase";
import { useQuasar } from "quasar";

export default {
  name: "FeedbackPage",
  data() {
    return {
      newFeedback: "",
      name: "",
      feedbackSent: false,
      formatDistance,
      formatDistanceStrict,
      format,
      feedback: [],
      admin: false,
    };
  },
  setup() {
    const $q = useQuasar();
    const confirm = (post) => {
      $q.dialog({
        title: "Delete Feedback",
        message: `Would you like to remove this feedback: ${post.content}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        removeFeedback(post);
      });
    };
    const removeFeedback = (post) => {
      deleteDoc(doc(db, "feedback", post.id));
    };
    return { confirm, removeFeedback };
  },
  methods: {
    getPosts() {
      const q = query(collection(db, "feedback"), orderBy("date"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let postChange = change.doc.data();
          postChange.id = change.doc.id;

          if (change.type === "added") {
            this.feedback.unshift(postChange);
          }

          if (change.type === "modified") {
            let index = this.feedback.findIndex(
              (post) => post.id === postChange.id
            );
            Object.assign(this.feedback[index], postChange);
          }
          if (change.type === "removed") {
            let index = this.feedback.findIndex(
              (post) => post.id === postChange.id
            );
            this.feedback.splice(index, 1);
          }
        });
      });
    },
    async addNewPost() {
      let feedback = {
        content: this.newFeedback,
        date: Date.now(),
        name: this.name,
      };
      // this.posts.unshift(newPost);
      addDoc(collection(db, "feedback"), feedback);

      this.feedbackSent = true;
    },
  },
  mounted() {
    const userId = auth.currentUser.uid;
    const dbReff = dbRef(getDatabase());

    get(child(dbReff, `users/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.admin = snapshot.val().admin;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    this.getPosts();
  },
};
</script>

<style lang="scss" scoped>
.postName {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 30px;
  overflow: hidden;
}
.showwhenimagebtn {
  padding: 0;
  margin: 0;
  width: 10px;
  height: 10px;
}
</style>
