import { auth, database } from "../boot/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref as dbRef,
  getDatabase,
  get,
  child,
  query,
  onValue,
  orderByChild,
  equalTo,
} from "firebase/database";

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
    path: "/admin",
    name: "Admin",
    component: () => import("layouts/AdminLayout.vue"),
    meta: { requiresAdmin: true, requiresAuth: true },
    children: [
      //ADMIN ROUTES
      {
        path: "",
        component: () => import("pages/admin/HomePage.vue"),
        name: "Admin view: Home",
        props: true,
      },
      {
        path: "feedback",
        component: () => import("pages/admin/FeedbackPage.vue"),
        name: "Read feedback",
        props: true,
      },
      {
        path: "post/:postId",
        component: () => import("pages/admin/PostPage.vue"),
        name: "Admin view: Post",
        props: true,
      },
      {
        path: "forgotpassword",
        component: () => import("pages/admin/ForgotPassword.vue"),
        name: "Admin view: Forgot Password",
        props: true,
      },
      {
        path: "notifications",
        component: () => import("pages/admin/NotificationsPage.vue"),
        name: "Admin view: Notifications",
        props: true,
      },
      {
        path: "messages",
        component: () => import("pages/admin/MessagesPage.vue"),
        name: "Admin view:  Messaging",
        props: true,
      },
      {
        path: "messages/:chatID",
        component: () => import("pages/admin/MessageView.vue"),
        name: "Admin view: Message",
        props: true,
      },
      {
        path: "profile",
        component: () => import("pages/admin/ProfilePage.vue"),
        name: "Admin view: Empty profile",
        props: true,
      },
      {
        path: "profile/:username",
        component: () => import("pages/admin/ProfilePage.vue"),
        name: "Admin view: Profile",
        props: true,
      },
      {
        path: "settings",
        component: () => import("pages/admin/SettingsPage.vue"),
        name: "Admin view: Settings",
        props: true,
      },
      {
        path: "reports",
        component: () => import("pages/admin/ReportsPage.vue"),
        name: "Reports",
        props: true,
      },
      {
        path: "about",
        component: () => import("pages/admin/AboutPage.vue"),
        name: "Admin view: About",
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("pages/HomePage.vue"),
        name: "Home",
        props: true,
      },
      {
        path: "/feedback",
        component: () => import("pages/FeedbackPage.vue"),
        name: "Send feedback",
        props: true,
      },
      {
        path: "post/:postId",
        component: () => import("pages/PostPage.vue"),
        name: "Post",
        props: true,
      },
      {
        path: "forgotpassword",
        component: () => import("pages/ForgotPassword.vue"),
        name: "ForgotPassword",
        props: true,
      },
      {
        path: "notifications",
        component: () => import("pages/NotificationsPage.vue"),
        name: "Notifications",
        props: true,
      },
      {
        path: "messages",
        component: () => import("pages/MessagesPage.vue"),
        name: "Messaging",
        props: true,
      },
      {
        path: "messages/:chatID",
        component: () => import("pages/MessageView.vue"),
        name: "Message",
        props: true,
      },
      {
        path: "profile",
        component: () => import("pages/ProfilePage.vue"),
        name: "Empty profile",
        props: true,
      },
      {
        path: "profile/:username",
        component: () => import("pages/ProfilePage.vue"),
        name: "Profile",
        props: true,
      },
      {
        path: "settings",
        component: () => import("pages/SettingsPage.vue"),
        name: "Settings",
        props: true,
      },
      {
        path: "about",
        component: () => import("pages/AboutPage.vue"),
        name: "About and Rules",
      },
    ],
  },
  {
    path: "/login",
    component: () => import("layouts/LoginLayout.vue"),
    name: "Login",
    children: [
      {
        path: "",
        component: () => import("pages/LoginPage.vue"),
        name: "Login",
        props: true,
      },
      {
        path: "about",
        component: () => import("pages/login/AboutPage.vue"),
        name: "About",
      },
    ],
  },
  {
    path: "/banned",
    component: () => import("layouts/BannedLayout.vue"),
    name: "Banned",
    meta: { requiresBanned: true },
    children: [
      {
        path: "",
        component: () => import("pages/banned/BannedPage.vue"),
        name: "You are banned",
        props: true,
      },
      {
        path: "unbanRequest",
        component: () => import("pages/banned/RequestUnbanPage.vue"),
        name: "Request Unban",
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
