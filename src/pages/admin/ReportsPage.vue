<template>
  <q-page padding>
    <q-list separator>
      <transition-group
        appear
        enter-active-class="animated fadeIn slow"
        leave-active-class="animated fadeOut slow"
      >
        <q-item v-for="post in reports" :key="post.id" class="q-py-md">
          <q-item-section>
            <q-item-label>
              <span
                class="text-grey-7"
                style="
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  width: 30px;
                  overflow: hidden;
                "
              >
                {{ post.posterUsername }}
              </span>
            </q-item-label>
            <q-item-label class="post-content text-body1">
              Post content: "{{ post.postContent }}""
            </q-item-label>
            <span>Report: {{ post.reportContent }}</span>
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
  </q-page>
</template>

<script>
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import db, { auth } from "src/boot/firebase";
import { useQuasar } from "quasar";

export default {
  name: "FeedbackPage",
  data() {
    return {
      reports: [],
    };
  },
  setup() {
    const $q = useQuasar();
    const confirm = (post) => {
      $q.dialog({
        title: "Delete Report",
        message: `Would you like to remove this report: ${post.content}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        removeFeedback(post);
      });
    };
    const removeFeedback = (post) => {
      deleteDoc(doc(db, "reports", post.id));
    };
    return { confirm, removeFeedback };
  },
  methods: {
    getPosts() {
      const myID = auth.currentUser.uid;

      const q = query(collection(db, "reports"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let postChange = change.doc.data();
          postChange.id = change.doc.id;

          if (change.type === "added") {
            this.reports.unshift(postChange);
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
  },
  mounted() {
    this.getPosts();
  },
};
</script>

<style lang="scss" scoped>
.showwhenimagebtn {
  padding: 0;
  margin: 0;
  width: 10px;
  height: 10px;
}
</style>
