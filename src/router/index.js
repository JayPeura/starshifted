import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { auth, database } from "../boot/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref as dbRef,
  query,
  onValue,
  orderByChild,
  equalTo,
} from "firebase/database";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  const user = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        reject
      );
    });
  };

  const admin = () => {
    return new Promise((resolve, reject) => {
      let admins = [];
      const adminUsers = query(
        dbRef(database, "users"),
        orderByChild("admin"),
        equalTo(true)
      );

      onValue(
        adminUsers,
        (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            let data = childSnapshot.val();
            data.id = childSnapshot.key;
            admins.push(data);
            resolve(admins);
            // ...
          });
        },
        reject,
        {
          onlyOnce: true,
        }
      );
    });
  };
  Router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(
      (record) => record.meta.requiresAdmin
    );
    const adminData = await admin();
    const adminIDchecker = adminData.map((admin) => admin.id);
    const data = await user();
    if (requiresAuth && !data) {
      next("Login");
    } else if (
      requiresAdmin &&
      adminData.admin === null &&
      !adminIDchecker.includes(auth.currentUser.uid)
    ) {
      next("/");
    } else if (data && adminIDchecker.includes(auth.currentUser.uid)) {
      next();
    } else {
      next();
    }
  });
  return Router;
});
