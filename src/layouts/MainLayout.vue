<template>
  <q-layout view="lHr lpR fff">
    <q-header
      bordered
      :style="
        'background-color: ' +
        getThemeColour(theme.value).bg +
        '; color: ' +
        getThemeColour(theme.value).txt
      "
    >
      <p style="position: absolute; right: 55px; top: 15px">
        Do you want NSFW?
      </p>
      <q-toggle
        style="position: absolute; right: 0; top: 5px"
        color="red"
        keep-color
        v-model="doYouWantNSFW"
        @update:model-value="refreshPage()"
      />
      <q-toolbar style="width: 80%">
        <div class="leftDrawerBtn">
          <q-btn
            dense
            flat
            round
            icon="menu"
            class="leftDrawerBtn"
            @click="toggleLeftDrawer"
          />
        </div>

        <q-toolbar-title class="text-weight-bold">
          <span class="gt-sm">{{ $route.name }}</span>
          <img
            class="q-pa-md logo-middle header-icon lt-md"
            src="~assets/starshifted.png"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer
      ref="drawer"
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="drawerWidth"
      :style="{
        'margin-left': margins,
        'background-color': getThemeColour(theme.value).mild,
        color: getThemeColour(theme.value).txt,
      }"
    >
      <img
        v-if="$q.dark.isActive"
        class="logo-left"
        src="~assets/starshiftedWhite.png"
      />
      <img
        v-if="!$q.dark.isActive"
        class="logo-left"
        src="~assets/starshifted.png"
      />
      <q-badge
        v-if="!admin"
        outline
        color="green"
        align="top"
        style="margin-top: 10px"
        >BETA</q-badge
      >
      <q-badge
        outline
        :color="theme === 'red' ? 'black' : 'accent'"
        align="top"
        v-else
        style="margin-top: 10px"
        >ADMIN</q-badge
      >

      <q-list>
        <q-item
          to="/"
          clickable
          v-ripple
          exact
          :style="{
            'background-color': getThemeColour(theme.value).mild,
            color: getThemeColour(theme.value).txt,
          }"
        >
          <q-item-section avatar>
            <q-icon name="home" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Home</q-item-section>
        </q-item>
        <q-item
          :key="$route.fullPath"
          :to="loggedIn ? '/profile/' + this.myUsername : '/profile'"
          clickable
          v-ripple
          exact
          :style="{
            'background-color': getThemeColour(theme.value).mild,
            color: getThemeColour(theme.value).txt,
          }"
        >
          <q-item-section avatar>
            <q-icon name="person" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Profile</q-item-section>
        </q-item>

        <q-item
          :to="'/notifications'"
          clickable
          v-ripple
          exact
          :style="{
            'background-color': getThemeColour(theme.value).mild,
            color: getThemeColour(theme.value).txt,
          }"
        >
          <q-badge
            v-if="notificationsCount > 0"
            rounded
            floating
            color="red"
            class="notifications"
          />

          <q-item-section avatar>
            <q-icon name="notifications_none" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Notifications</q-item-section>
        </q-item>
        <q-item
          :to="'/messages'"
          clickable
          v-ripple
          exact
          :style="{
            'background-color': getThemeColour(theme.value).mild,
            color: getThemeColour(theme.value).txt,
          }"
        >
          <q-badge
            v-if="messagesCount > 0"
            rounded
            floating
            color="red"
            class="messages"
          />
          <q-item-section avatar>
            <q-icon name="mail" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Messages</q-item-section>
        </q-item>

        <q-item
          to="/settings"
          clickable
          v-ripple
          exact
          :style="{
            'background-color': getThemeColour(theme.value).mild,
            color: getThemeColour(theme.value).txt,
          }"
        >
          <q-item-section avatar>
            <q-icon name="settings" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Settings</q-item-section>
        </q-item>
      </q-list>

      <q-list style="position: absolute; bottom: 0">
        <q-separator />

        <q-item
          to="/feedback"
          clickable
          v-ripple
          exact
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
        >
          <q-item-section avatar>
            <q-icon name="feedback" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Feedback</q-item-section>
        </q-item>
        <q-item
          to="/reports"
          v-if="admin"
          clickable
          v-ripple
          exact
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
        >
          <q-item-section avatar>
            <q-icon name="warning" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">Reports</q-item-section>
        </q-item>
        <q-item
          to="/about"
          clickable
          v-ripple
          exact
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
        >
          <q-item-section avatar>
            <q-icon name="info" size="md" />
          </q-item-section>

          <q-item-section class="text-h6">About & Rules</q-item-section>
        </q-item>
        <q-item
          @click="modeHandler()"
          clickable
          v-ripple
          exact
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
        >
          <q-item-section avatar>
            <q-icon
              :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">{{
            $q.dark.isActive ? "Light mode" : "Dark mode"
          }}</q-item-section>
        </q-item>
        <q-select
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
          filled
          v-model="themeOption"
          :options="getThemeOptions"
          label="Theme"
        >
          <template v-slot:prepend>
            <q-icon name="dark_mode" size="md" />
          </template>
        </q-select>

        <q-item
          @click="loginHandler()"
          clickable
          v-ripple
          exact
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
        >
          <q-item-section avatar>
            <q-icon name="lock" size="md" />
          </q-item-section>
          <q-item-section class="text-h6"
            >{{ loggedIn ? "Log out" : "Log in / Sign up"
            }}<span :class="loggedIn ? 'text-h6 nextToLogout' : 'noLogout'"
              >@{{ myUsername }}</span
            ></q-item-section
          >
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer
      ref="drawer"
      show-if-above
      v-model="rightDrawerOpen"
      side="right"
      :width="drawerWidth"
      bordered
      :style="{
        'margin-right': margins,
        'background-color': getThemeColour(theme.value).mild,
        color: getThemeColour(theme.value).txt,
      }"
    >
      <q-input
        outlined
        class="q-ma-lg"
        placeholder="Search for content or users"
        :style="{
          'margin-right': margins,
          'background-color': getThemeColour(theme.value).mild,
          color: getThemeColour(theme.value).txt,
        }"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <h5
        align="center"
        class="q-ma-sm"
        :style="{
          'margin-right': margins,
        }"
      >
        Trending topics
      </h5>
      <q-list
        separator
        :style="{
          'margin-right': margins,
        }"
      >
        <q-item
          class="q-pa-md"
          v-for="topic in trendingTopics"
          :key="topic"
          clickable
          @click="rediectAndRefresh(topic.topic)"
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
        >
          <q-item-section>
            <q-item-label class="text-weight-bold"
              >#{{ topic.topic }}</q-item-label
            >
            <q-item-label class="text-grey-8"
              >Appearing in {{ topic.count }} posts during the past 24
              hours!</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
      <q-item
        class="flex flex-center"
        style="position: absolute; bottom: 15px; left: 19%"
        ><q-item-section side
          ><q-item-label caption class="text-grey-8 text-uppercase"
            >© 2023 {{ APP_NAME }}</q-item-label
          ></q-item-section
        ></q-item
      >
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive><component :is="Component" /></keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, getCurrentInstance } from "vue";
import {
  collection,
  orderBy,
  query as fquery,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import db, { database, auth, storage } from "src/boot/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref as dbRef,
  getDatabase,
  get,
  child,
  orderByChild,
  equalTo,
  query,
  onValue,
  update,
} from "firebase/database";
import { useQuasar } from "quasar";
import { updateTrendingTopics, updateTopics } from "../../trendingTopics";

const loggedInRef = ref(false);

export default {
  data() {
    return {
      loggedIn: loggedInRef,
      myUsername: "",
      darkMode: false,
      notifications: true,
      notificationsCount: 0,
      messagesCount: 0,
      users: [],
      userID: "",
      admin: false,
      theme: "",
      themeOption: null,
      posts: [],
      trendingTopics: [],
      doYouWantNSFW: false,
      screenSize: "",
      drawerWidth: 423,
      margins: "0",
    };
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    const $q = useQuasar();

    let value = localStorage.getItem("darkMode");
    $q.dark.set(JSON.parse(value) === true);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      modeHandler() {
        $q.dark.toggle();
        localStorage.setItem("darkMode", $q.dark.isActive);
      },
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
    };
  },
  watch: {
    $route(to, from) {
      if (from.path === "/login") {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            const userId = auth.currentUser.uid;
            const dbReff = dbRef(getDatabase());
            this.userID = userId;

            get(child(dbReff, `users/${userId}`))
              .then((snapshot) => {
                if (snapshot.exists()) {
                  this.myUsername = snapshot.val().username;
                } else {
                  console.log("No data available");
                }
              })
              .catch((error) => {
                console.error(error);
              });

            this.loggedIn = true;
          } else {
            this.loggedIn = false;
          }
        });
      }
    },
    themeOption(newValue, oldValue) {
      const uid = auth.currentUser.uid;
      const db = getDatabase();
      const themeValue = this.themeOption || "";
      update(dbRef(db, "users/" + uid), {
        theme: themeValue,
      })
        .then(() => {
          this.theme = themeValue;
        })
        .catch((e) => {
          console.error(e);
        });
    },
    doYouWantNSFW(newValue, oldValue) {
      const uid = auth.currentUser.uid;
      const db = getDatabase();
      const NSFWPostValue = this.doYouWantNSFW || false;
      update(dbRef(db, "users/" + uid), {
        doYouWantNSFW: NSFWPostValue,
      })
        .then(() => {})
        .catch((e) => {
          console.error(e);
        });
    },
    margins() {
      this.updateDrawerContentWidth();
    },
  },
  methods: {
    refreshPage() {
      location.reload();
    },
    calculateTimeDifference(postDate) {
      const currentTime = Date.now();
      const hoursDiff = (currentTime - postDate) / (60 * 60 * 1000);
      return hoursDiff;
    },
    rediectAndRefresh(topic) {
      this.$router.push("/topic/" + topic).then(() => {
        location.reload();
      });
    },
    getTopics() {
      const topicsMap = new Map(); // Map to store topic counts

      this.posts.forEach((post) => {
        // Consider posts within the past 24 hours
        if (post.hashtags && Array.isArray(post.hashtags)) {
          const hashtags = post.hashtags;
          const uniqueHashtags = [...new Set(hashtags)]; // Get unique hashtags in the post
          uniqueHashtags.forEach((tag) => {
            const isExactMatch = hashtags.some((ht) => ht === tag);

            // Check if the hashtag is a whole word or has a partial match
            const isWholeWord = new RegExp(`\\b${tag}\\b`).test(post.content); // Consider post content instead of concatenated hashtags

            if (isExactMatch && isWholeWord) {
              if (topicsMap.has(tag)) {
                topicsMap.set(tag, topicsMap.get(tag) + 1);
              } else {
                topicsMap.set(tag, 1);
              }
            }
          });
        }
      });
      // Filter hashtags that meet the threshold
      const nonTrendingTopics = Array.from(topicsMap.entries()).reduce(
        (result, [topic, count]) => {
          result.push({ topic, count });
          return result;
        },
        []
      );

      updateTopics(nonTrendingTopics);
    },
    getTrendingTopics() {
      const threshold = this.globalTrendingTopicThreshold; // Number of posts required to be considered trending
      const maxTopicsToShow = 10;

      const topicsMap = new Map(); // Map to store topic counts

      this.posts.forEach((post) => {
        const hoursDiff = this.calculateTimeDifference(post.date);
        if (hoursDiff <= 24) {
          // Consider posts within the past 24 hours
          if (post.hashtags && Array.isArray(post.hashtags)) {
            const hashtags = post.hashtags;
            const uniqueHashtags = [...new Set(hashtags)]; // Get unique hashtags in the post
            uniqueHashtags.forEach((tag) => {
              const isExactMatch = hashtags.some((ht) => ht === tag);

              // Check if the hashtag is a whole word or has a partial match
              const isWholeWord = new RegExp(`\\b${tag}\\b`).test(post.content); // Consider post content instead of concatenated hashtags

              if (isExactMatch && isWholeWord) {
                if (topicsMap.has(tag)) {
                  topicsMap.set(tag, topicsMap.get(tag) + 1);
                } else {
                  topicsMap.set(tag, 1);
                }
              }
            });
          }
        }
      });
      // Filter hashtags that meet the threshold
      const trendingTopics = Array.from(topicsMap.entries())
        .reduce((result, [topic, count]) => {
          if (count >= threshold) {
            result.push({ topic, count });
          }
          return result;
        }, [])
        .slice(0, maxTopicsToShow);

      this.trendingTopics = trendingTopics;
      updateTrendingTopics(trendingTopics);
    },
    getPosts() {
      const postQ = query(collection(db, "posts"), orderBy("date"));
      const unsubscribe = onSnapshot(postQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let postChange = change.doc.data();
          postChange.id = change.doc.id;
          this.postID = postChange.id;
          this.creatorID = postChange.creatorId;
          if (postChange.underPostID === undefined) {
            if (change.type === "added") {
              this.creatorUsername = postChange.creatorUsername;
              this.creatorDisplayname = postChange.creatorDisplayname;
              this.creatorImage = postChange.creatorImage;
              this.creatorVerified = postChange.isUserVerified;
              this.postImage = postChange.postImg;
              this.postID = postChange.id;
              this.repostID = postChange.repostID;
              this.creatorID = postChange.creatorId;
              this.posts.unshift(postChange);
            }
          }
        });

        this.getTrendingTopics();
        this.getTopics();
      });
    },
    loginHandler() {
      if (auth.currentUser) {
        signOut(auth)
          .then(() => {
            // Sign-out successful.
            this.loggedIn = false;
            this.$router.push("/login");
          })
          .catch((error) => {
            // An error happened.
            alert(error);
          });
      } else {
        this.$router.push("/login");
      }
    },
    calculateItemWidth(margins) {
      switch (margins) {
        case "40%":
          return "60%";
        case "20%":
          return "80%";
        default:
          return "100%";
      }
    },
    handleWindowResize() {
      let newWidth;
      switch (true) {
        case window.innerWidth >= 1660:
          newWidth = 483;
          this.margins = "40%";
          break;
        case window.innerWidth >= 1459:
          newWidth = 423;
          this.margins = "20%";
          break;
        case window.innerWidth >= 1356:
          newWidth = 310;
          this.margins = "0";
          break;
      }
      this.drawerWidth = newWidth;
    },
    updateDrawerContentWidth() {
      const drawerElements = document.querySelectorAll(".q-drawer--left");
      if (drawerElements.length > 0) {
        for (let i = 0; i < drawerElements.length; i++) {
          const drawerContent =
            drawerElements[i].querySelector(".q-drawer__content");
          if (drawerContent) {
            drawerContent.style.setProperty(
              "width",
              this.margins === "40%"
                ? "60%"
                : this.margins === "20%"
                ? "80%"
                : "100%",
              "important"
            );
          }
        }
      }
    },
  },
  beforeUnmount() {
    // Remove the listener when the component is about to be unmounted
    window.removeEventListener("resize", this.handleWindowResize);
  },
  mounted() {
    this.handleWindowResize();
    window.addEventListener("resize", this.handleWindowResize);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = auth.currentUser.uid;
        const dbReff = dbRef(getDatabase());
        this.userID = userId;

        get(child(dbReff, `users/${userId}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.myUsername = snapshot.val().username;
              this.admin = snapshot.val().admin;
              this.theme = snapshot.val().theme;
              this.themeOption = snapshot.val().theme;
              this.doYouWantNSFW = snapshot.val().doYouWantNSFW;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });

        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
    this.getPosts();
  },
};
</script>

<style lang="scss" scoped>
.drawer-content-width-60 {
  width: 60% !important;
}

.drawer-content-width-80 {
  width: 80% !important;
}

a.q-router-link--active {
  color: inherit;
}
@media screen and (min-width: 1024px) {
  .leftDrawerBtn {
    display: none;
  }
}
.logo-left {
  width: 4.5em;
  padding: 0.4em;
  margin-bottom: 2em;
}
.logo-middle {
  width: 3.5em;
  background-color: white;
  background-clip: content-box;
  border: 1 solid;
  border-radius: 2em;
}

.separator {
  position: absolute;
  bottom: 5px;
  width: 322px;
  border-top: 1px solid $primary;
}
.notifications {
  position: absolute;
  width: 10px;
  top: 7px;
  z-index: 1;
  left: 35px;
}
.messages {
  position: absolute;
  width: 10px;
  top: 7px;
  z-index: 1;
  left: 41px;
}
.noNotifications {
  display: none;
}
.header-icon {
  position: absolute;
  top: -13px;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
}
.nextToLogout {
  display: flex;
  position: absolute;
  margin-left: 75px;
}

.noLogout {
  display: none;
}
</style>
