import { auth } from "../boot/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, getDatabase, get, child } from "firebase/database";

let userID;

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = auth.currentUser.uid;
    const dbReff = dbRef(getDatabase());

    get(child(dbReff, `users/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          userID = userId;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/HomePage.vue"),
        name: "Home",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/post/:postId",
        component: () => import("pages/PostPage.vue"),
        name: "Post",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/forgotpassword",
        component: () => import("pages/ForgotPassword.vue"),
        name: "ForgotPassword",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/notifications",
        component: () => import("pages/NotificationsPage.vue"),
        name: "Notifications",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/messages",
        component: () => import("pages/MessagesPage.vue"),
        name: "Your messages",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/messages/:chatID",
        component: () => import("src/components/MessageView.vue"),
        name: "Message",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/profile",
        component: () => import("pages/ProfilePage.vue"),
        name: "Empty profile",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/profile/:username",
        component: () => import("pages/ProfilePage.vue"),
        name: "Profile",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/settings",
        component: () => import("pages/SettingsPage.vue"),
        name: "Settings",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "/about",
        component: () => import("pages/AboutPage.vue"),
        name: "About",
      },
      {
        path: "/login",
        component: () => import("pages/LoginPage.vue"),
        name: "Login",
        props: true,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
