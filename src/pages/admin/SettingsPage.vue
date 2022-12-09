<template>
  <q-page padding>
    <h5 class="q-ml-xl">Hello {{ currName }}!</h5>

    <h6 class="q-ml-xl">Your current username is @{{ currUsername }}</h6>

    <q-input
      square
      class="username"
      ref="newUsernameRef"
      lazy-rules
      v-model="newUsername"
      :rules="[this.isUsernameTaken]"
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
    <q-dialog v-model="usernameTaken">
      <q-card>
        <q-card-section>
          <div class="text-h6">Username taken</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Please choose another username.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            :color="$q.dark.isActive ? 'primary' : 'secondary'"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="usernameEmpty">
      <q-card>
        <q-card-section>
          <div class="text-h6">Username can not be empty!</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Please choose a new username.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            :color="$q.dark.isActive ? 'primary' : 'secondary'"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="usernameChanged">
      <q-card>
        <q-card-section>
          <div class="text-h6">Hello {{ newUsername }}!</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Username change was a success!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            :color="$q.dark.isActive ? 'primary' : 'secondary'"
            @click="clear"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="usernameShort">
      <q-card>
        <q-card-section>
          <div class="text-h6">Your username is too short!</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Think of another username!
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            :color="$q.dark.isActive ? 'secondary' : 'primary'"
            @click="clear"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
import { auth, database, storage } from "../../boot/firebase";

const inputRef = ref(null);
const newUsernameRef = ref("");

export default defineComponent({
  name: "ProfilePage",
  data() {
    return {
      currName: "",
      newUsername: newUsernameRef,
      currUsername: "",
      userId: "",
      input: inputRef,
      usernameTaken: false,
      usernameEmpty: false,
      usernameChanged: false,
      usernameShort: false,
      chosen: false,
      dbUsername: "",
    };
  },
  methods: {
    clear() {
      this.newUsername = "";
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
      return (val && val !== this.dbUsername) || "Username already taken";
    },
    updateName() {
      const user = auth.currentUser;
      if (this.newUsername !== this.dbUsername && this.newUsername.length > 2) {
        update(dbRef(database, "users/" + user.uid), {
          username: this.newUsername,
        })
          .then(() => {
            // Data saved successfully!
            this.usernameChanged = true;
            this.currUsername = this.newUsername;
            this.newUsername = "";
          })
          .catch((error) => {
            // The write failed...
            alert(error);
          });
      } else if (!this.newUsername) {
        this.usernameEmpty = true;
        return;
      } else if (this.newUsername === this.dbUsername) {
        this.usernameTaken = true;
        return;
      } else if (this.newUsername.length > 1) {
        this.usernameShort = true;
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
