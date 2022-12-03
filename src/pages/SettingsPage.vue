<template>
  <q-page>
    <h5 class="q-ml-xl">Hello {{ currName }}!</h5>

    <h6 class="q-ml-xl">Your current username is @{{ currUsername }}</h6>

    <q-input
      square
      class="username"
      lazy-rules
      v-model="newUsername"
      :rules="[this.usernameShort, this.isUsernameTaken]"
      value=""
      type="username"
      label="New username"
    >
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>

    <br />
    <br />
    <q-btn @click="updateName" class="updateButton">Change your username</q-btn>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import {
  ref as dbRef,
  set,
  get,
  update,
  onValue,
  child,
  getDatabase,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database, storage } from "../boot/firebase";

const inputRef = ref(null);

export default defineComponent({
  name: "ProfilePage",
  data() {
    return {
      currName: "",
      newUsername: "",
      currUsername: "",
      userId: "",
      input: inputRef,
      chosen: false,
      dbUsername: "",
    };
  },
  methods: {
    usernameShort(val) {
      return (val && val.length > 1) || "The username is too short";
    },
    isUsernameTaken(val) {
      const usernameRef = dbRef(database, "users");
      onValue(
        usernameRef,
        (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            const childKey = childSnapshot.key;
            const childData = childSnapshot.val();
            if (val === childData.username) {
              this.dbUsername = childData.username;
            }
          });
        },
        {
          onlyOnce: false,
        }
      );
      return (val && val != this.dbUsername) || "Username already taken";
    },

    updateName() {
      const user = auth.currentUser;
      if (this.newUsername !== this.dbUsername) {
        update(dbRef(database, "users/" + user.uid), {
          username: this.newUsername,
        })
          .then(() => {
            // Data saved successfully!
            window.location.reload();
          })
          .catch((error) => {
            // The write failed...
            alert(error);
          });
      } else if (!this.newUsername) {
        alert("Your new username can not be empty!");
      } else {
        alert("This username is already taken!");
      }
    },
    showUser() {},
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = auth.currentUser.uid;
        const dbReff = dbRef(getDatabase());

        get(child(dbReff, `users/${userId}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.currUsername = snapshot.val().username;
              this.currName = snapshot.val().displayName;
              this.image = snapshot.val().image;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  },
});
</script>

<style>
.username {
  margin: 0 100px 0 100px;
}
.updateButton {
  margin-left: 20em;
}
</style>
