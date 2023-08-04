<template>
  <q-page padding>
    <q-list separator>
      <transition-group
        appear
        enter-active-class="animated fadeIn slow"
        leave-active-class="animated fadeOut slow"
      >
        <q-item
          v-for="noti in notifications"
          :key="noti"
          class="q-py-md"
          :style="
            noti.seen
              ? 'background-color: transparent'
              : 'background-color: rgba(155,155,155,0.3)'
          "
          clickable
          @click="
            redirectToPost(noti.postID);
            makeMeSeen(noti);
          "
        >
          <q-item-section>
            <q-item-label
              v-if="noti.type === 'like'"
              class="post-content text-body1"
            >
              {{ noti.likerDN }} just liked your post.
              <span class="text-grey-7">
                {{
                  noti.date > Date.now() - 35 * 60 * 60 * 1000
                    ? formatDistanceStrict(noti.date, new Date())
                    : format(noti.date, "d MMM")
                }}</span
              >
            </q-item-label>
          </q-item-section>
        </q-item>
      </transition-group>
    </q-list>
  </q-page>
</template>

<script>
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  onValue,
  update,
  equalTo,
  remove,
  orderByChild,
} from "firebase/database";
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  deleteDoc,
  updateDoc,
  getDoc,
  doc,
  where,
} from "firebase/firestore";
import { formatDistanceStrict, format } from "date-fns";
import db, { auth, database, storage } from "../boot/firebase";

export default {
  name: "NotificationsPage",
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.notifications = [];
      vm.getProfileInfo();
      vm.getNotifications();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.notifications = [];
    this.getProfileInfo();
    this.getNotifications();
    next();
  },
  data() {
    return {
      admin: false,
      theme: "",
      notifications: [],
      formatDistanceStrict,
      format,
    };
  },
  methods: {
    async makeMeSeen(noti) {
      const myID = auth.currentUser.uid;
      const notiRef = doc(db, "notifications", myID);

      const docSnap = await getDoc(notiRef);
      if (docSnap.exists()) {
        const notificationsData = docSnap.data().notifications;
        notificationsData[noti.index].seen = true;

        await updateDoc(notiRef, {
          notifications: notificationsData,
        });
      }
    },
    redirectToPost(notification) {
      this.$router.push(`/post/${notification}`);
    },
    async getNotifications() {
      const myID = auth.currentUser.uid;

      const docRef = doc(db, "notifications", myID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const notificationsData = docSnap.data().notifications;
        const sortedNotifications = notificationsData.sort(
          (a, b) => b.date - a.date
        );

        this.notifications.unshift(...sortedNotifications);
      } else {
        console.log("No such document!");
      }
    },
    getProfileInfo() {
      const userId = auth.currentUser.uid;

      const userFollowRef = dbRef(database, "users/" + userId);
      onValue(userFollowRef, (snapshot1) => {
        const info = snapshot1.val();
        this.admin = info.admin;
        this.theme = info.theme;
      });
    },
  },
};
</script>
