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
            value=""
            :bg-color="$q.dark.isActive ? 'transparent' : 'transparent'"
            @keydown.enter="handleSearch"
          />
        </div>
      </div>
      <div class="full-width">
        <q-list>
          <q-item
            v-for="(user, id) in users"
            :key="id"
            :to="'/messages/' + id"
            class="q-my-md"
            clickable
          >
            <q-item-section avatar>
              <q-avatar size="xl">
                <img v-bind:src="user.image" class="avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label
                >{{ user.displayName }}
                <q-icon
                  :name="user.verified ? 'verified' : ''"
                  :class="
                    user.verified ? 'showWhenVerified' : 'hideWhenNotVerified'
                  "
              /></q-item-label>
              <q-item-label caption lines="2">{{ user.content }}</q-item-label>
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
      myMessages: [],
      messageContent: "",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
    };
  },
  methods: {
    async handleSearch(val) {
      const usernameRef = dbRef(database, "users");
      onValue(usernameRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          this.users.push({ id: childKey, data: childData });
          console.log(toRaw(this.users));
        });
      });
    },
  },
  mounted() {
    this.userID = auth.currentUser.uid;

    const db2 = getDatabase();
    const userQ = dbQuery(dbRef(db2, "users"));
    get(userQ).then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val());
        const data = snapshot.val();
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

    this.handleSearch();
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
