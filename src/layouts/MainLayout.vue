<template>
  <q-layout view="lHr lpR fff">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
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
            src="../assets/starshifted.png"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="323"
    >
      <img
        class="logo-left"
        :src="
          $q.dark.isActive
            ? 'src/assets/starshiftedWhite.png'
            : 'src/assets/starshifted.png'
        "
      />

      <q-list>
        <q-item to="/" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="home"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">Home</q-item-section>
        </q-item>
        <q-item
          :key="$route.fullPath"
          :to="loggedIn ? '/profile/' + this.myUsername : '/profile'"
          clickable
          v-ripple
          exact
        >
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="person"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">Profile</q-item-section>
        </q-item>

        <q-item :to="'/notifications'" clickable v-ripple exact>
          <q-badge
            v-if="notificationsCount > 0"
            rounded
            floating
            color="red"
            class="notifications"
          />

          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="notifications_none"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">Notifications</q-item-section>
        </q-item>
        <q-item :to="'/messages'" clickable v-ripple exact>
          <q-badge
            v-if="messagesCount > 0"
            rounded
            floating
            color="red"
            class="messages"
          />
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="mail"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">Messages</q-item-section>
        </q-item>

        <q-item to="/settings" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="settings"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">Settings</q-item-section>
        </q-item>

        <div
          class="separator-container"
          v-if="loggedIn ? 'Log out' : 'Log in / Sign up'"
        >
          <div class="separator">
            <q-item to="/about" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon
                  :color="$q.dark.isActive ? 'secondary' : 'primary'"
                  name="info"
                  size="md"
                />
              </q-item-section>

              <q-item-section class="text-h6">About</q-item-section>
            </q-item>
            <q-item @click="modeHandler()" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon
                  :color="$q.dark.isActive ? 'secondary' : 'primary'"
                  :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                  size="md"
                />
              </q-item-section>

              <q-item-section class="text-h6">{{
                $q.dark.isActive ? "Light mode" : "Dark mode"
              }}</q-item-section>
            </q-item>

            <q-item @click="loginHandler()" clickable v-ripple exact>
              <q-item-section avatar>
                <q-icon
                  :color="$q.dark.isActive ? 'secondary' : 'primary'"
                  name="lock"
                  size="md"
                />
              </q-item-section>
              <q-item-section class="text-h6"
                >{{ loggedIn ? "Log out" : "Log in / Sign up"
                }}<span :class="loggedIn ? 'text-h6 nextToLogout' : 'noLogout'"
                  >@{{ myUsername }}</span
                ></q-item-section
              >
            </q-item>
          </div>
        </div>
      </q-list>
    </q-drawer>

    <q-drawer
      show-if-above
      v-model="rightDrawerOpen"
      side="right"
      :width="323"
      bordered
    >
      <q-input
        outlined
        rounded
        class="q-ma-md"
        placeholder="Search Starshifted"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-list separator padding>
        <q-item class="q-pa-md">
          <q-item-section>
            <q-item-label overline class="text-grey">Animals</q-item-label>
            <q-item-label class="text-weight-bold"
              >Cats are at it again!</q-item-label
            >
            <q-item-label caption
              >Secondary line text. Lorem ipsum dolor sit amet, consectetur
              adipiscit elit.</q-item-label
            >
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>5 min ago</q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-pa-md">
          <q-item-section>
            <q-item-label overline class="text-grey">E-Sports</q-item-label>
            <q-item-label class="text-weight-bold"
              >Overwatch 2 champion</q-item-label
            >
            <q-item-label caption
              >New crowned champion! Check out this article!</q-item-label
            >
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>5 min ago</q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-pa-md">
          <q-item-section>
            <q-item-label overline class="text-grey">Animals</q-item-label>
            <q-item-label class="text-weight-bold"
              >Cats are at it again!</q-item-label
            >
            <q-item-label caption
              >Secondary line text. Lorem ipsum dolor sit amet, consectetur
              adipiscit elit.</q-item-label
            >
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>5 min ago</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-item
        ><q-item-section side top class="flex flex-center full-width"
          ><q-item-label caption class="text-grey-8 text-uppercase"
            >© 2022 Starshifted</q-item-label
          ></q-item-section
        ></q-item
      >
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" v-slot="{ Component }">
        <keep-alive
          ><transition name="fade" mode="out-in">
            <component :is="Component" /> </transition></keep-alive
      ></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import { signOut } from "firebase/auth";
import { auth, database } from "../boot/firebase";
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
} from "firebase/database";
import { useQuasar } from "quasar";

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
  },
  methods: {
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
  },
  mounted() {
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
  },
};
</script>

<style lang="scss" scoped>
.left-drawer {
  padding-left: 16em;
}
a.q-router-link--active {
  color: inherit;
}
@media screen and (min-width: 1024px) {
  .leftDrawerBtn {
    display: none;
  }
}
.right-drawer {
  padding-right: 16em;
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
