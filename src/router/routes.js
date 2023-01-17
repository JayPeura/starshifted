const routes = [
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
      {
        path: "reports",
        component: () => import("pages/ReportsPage.vue"),
        name: "Reports",
        meta: { requiresAdmin: true },
        props: true,
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
