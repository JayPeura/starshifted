<template>
  <q-page padding>
    <q-list v-if="admin" separator>
      <transition-group
        appear
        enter-active-class="animated fadeIn slow"
        leave-active-class="animated fadeOut slow"
      >
        <q-item v-for="report in reports" :key="report.id" class="q-py-md report">
          <q-item-section>
            <q-item-label>
              <span
                class="text-grey-7 posterUsername"
              >
                {{ report.posterUsername }}
              </span>
            </q-item-label>
            <q-item-label class="post-content text-body1">
              Post content: "{{ report.postContent }}"
            </q-item-label>
            <span>Report message: {{ report.reportContent }}</span>
          </q-item-section>
          <q-btn
            round
            dense
            flat
            icon="close"
            class="showwhenimagebtn"
            title="Delete this report"
            @click="confirm(report)"
          ></q-btn>
          <q-btn
            round
            dense
            flat
            icon="chat"
            class="showwhenimagebtn"
            title="See the reported content"
            @click="redirectToPost(report.postID)"
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
import { ref as dbRef, getDatabase, get, child } from "firebase/database";
import db, { auth } from "src/boot/firebase";
import { useQuasar } from "quasar";

export default {
  name: "FeedbackPage",
  data() {
    return {
      reports: [],
      admin: false,
      report: {},
    };
  },
  setup() {
    const $q = useQuasar();
    const confirm = (post) => {
      $q.dialog({
        title: "Delete Report",
        message: `Would you like to remove this report: ${post.reportContent}?`,
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
            let index = this.reports.findIndex(
              (post) => post.id === postChange.id
            );
            Object.assign(this.reports[index], postChange);
          }
          if (change.type === "removed") {
            let index = this.reports.findIndex(
              (post) => post.id === postChange.id
            );
            this.reports.splice(index, 1);
          }
        });
      });
    },
    redirectToPost(report) {
      this.$router.push(`/post/${report}`);
    }
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
.showwhenimagebtn {
  padding: 0;
  margin: 0;
  width: 10px;
  height: 10px;
}

.posterUsername {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 30px;
  overflow: hidden;
}

.report {
  cursor: pointer;
}
.report:hover {
  background-color: rgba(255, 255, 255, 0.11);
}
</style>
