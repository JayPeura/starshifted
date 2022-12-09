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

/////////////// do this later ////////////////////
// let admin;

// const isAdmin = () => {
//   const adminUsers = query(
//     dbRef(database, "users"),
//     orderByChild("admin"),
//     equalTo(true)
//   );

//   onValue(
//     adminUsers,
//     (snapshot) => {
//       snapshot.forEach((childSnapshot) => {
//         const childKey = childSnapshot.key;
//         const childData = childSnapshot.val();

//         // ...
//       });
//     },
//     {
//       onlyOnce: true,
//     }
//   );
// };

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
    children: [
      //ADMIN ROUTES
      {
        path: "home",
        component: () => import("pages/admin/HomePage.vue"),
        name: "Admin view: Home",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "post/:postId",
        component: () => import("pages/admin/PostPage.vue"),
        name: "Admin view: Post",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "forgotpassword",
        component: () => import("pages/admin/ForgotPassword.vue"),
        name: "Admin view: Forgot Password",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "notifications",
        component: () => import("pages/admin/NotificationsPage.vue"),
        name: "Admin view: Notifications",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "messages",
        component: () => import("pages/admin/MessagesPage.vue"),
        name: "Admin view:  Messaging",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "messages/:chatID",
        component: () => import("src/components/admin/MessageView.vue"),
        name: "Admin view: Message",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "profile",
        component: () => import("pages/admin/ProfilePage.vue"),
        name: "Admin view: Empty profile",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "profile/:username",
        component: () => import("pages/admin/ProfilePage.vue"),
        name: "Admin view: Profile",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "settings",
        component: () => import("pages/admin/SettingsPage.vue"),
        name: "Admin view: Settings",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "reports",
        component: () => import("pages/admin/ReportsPage.vue"),
        name: "Reports",
        meta: { requiresAuth: true, requiresAdmin: true },
        props: true,
      },
      {
        path: "about",
        component: () => import("pages/admin/AboutPage.vue"),
        name: "Admin view: About",
      },
      {
        path: "login",
        component: () => import("pages/LoginPage.vue"),
        name: "Admin view: Login",
        props: true,
      },
    ],
  },

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
        path: "post/:postId",
        component: () => import("pages/PostPage.vue"),
        name: "Post",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "forgotpassword",
        component: () => import("pages/ForgotPassword.vue"),
        name: "ForgotPassword",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "notifications",
        component: () => import("pages/NotificationsPage.vue"),
        name: "Notifications",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "messages",
        component: () => import("pages/MessagesPage.vue"),
        name: "Messaging",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "messages/:chatID",
        component: () => import("src/components/MessageView.vue"),
        name: "Message",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "profile",
        component: () => import("pages/ProfilePage.vue"),
        name: "Empty profile",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "profile/:username",
        component: () => import("pages/ProfilePage.vue"),
        name: "Profile",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "settings",
        component: () => import("pages/SettingsPage.vue"),
        name: "Settings",
        meta: { requiresAuth: true },
        props: true,
      },
      {
        path: "about",
        component: () => import("pages/AboutPage.vue"),
        name: "About",
      },
      {
        path: "login",
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
