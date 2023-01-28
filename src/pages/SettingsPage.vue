<template>
  <q-page>
    <q-scroll-area :visible="false" class="absolute full-width full-height">
      <h5 class="q-ml-xl">Hello {{ currName }}!</h5>

      <h6 class="q-ml-xl">Your current username is @{{ currUsername }}</h6>

      <q-input
        outlined
        class="username"
        ref="newUsernameRef"
        v-model="newUsername"
        :rules="[isUsernameTaken]"
        type="username"
        label="New username"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <br />
      <div class="updateButtonDiv">
        <q-btn @click="updateName" color="accent" class="updateButton"
          >Change your username</q-btn
        >
      </div>
      <br />
      <hr />
      <h6 align="center">Email change</h6>
      <q-input
        outlined
        class="email"
        ref="newEmailRef"
        v-model="newEmail"
        :rules="[isEmail]"
        type="email"
        label="New email"
      >
        <template v-slot:prepend>
          <q-icon name="mail" />
        </template>
      </q-input>

      <br />
      <div class="updateButtonDiv">
        <q-btn @click="updateEmail" color="accent" class="updateButton"
          >Change your email</q-btn
        >
      </div>
      <br />
      <hr />
      <h6 align="center">Password change</h6>
      <q-input
        class="password"
        outlined
        v-model="oldPassword"
        :type="passwordFieldType"
        lazy-rules
        :rules="[required]"
        :color="$q.dark.isActive ? 'secondary' : 'primary'"
        label="Old password"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="visibilityIcon"
            @click="switchVisibility"
            class="cursor-pointer"
          />
        </template>
      </q-input>
      <q-input
        class="password"
        outlined
        v-model="password"
        :type="passwordFieldType"
        lazy-rules
        :rules="[required, short]"
        :color="$q.dark.isActive ? 'secondary' : 'primary'"
        label="New password"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="visibilityIcon"
            @click="switchVisibility"
            class="cursor-pointer"
          />
        </template>
      </q-input>

      <div class="updateButtonDiv">
        <q-btn
          @click="changePassword"
          color="accent"
          class="updateButton"
          label="Change password"
        />
      </div>
      <br />
      <!-- <hr /> -->
      <!-- TODO: delete account-->
      <!-- <h6 align="center">Delete account</h6> -->

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
        </q-card> </q-dialog
    ></q-scroll-area>
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
import {
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, database, storage } from "../boot/firebase";

const inputRef = ref(null);
const newUsernameRef = ref(""),
  newEmailRef = ref("");

export default defineComponent({
  name: "ProfilePage",
  data() {
    return {
      currName: "",
      newUsername: newUsernameRef,
      newEmail: newEmailRef,
      currUsername: "",
      userId: "",
      input: inputRef,
      usernameTaken: false,
      usernameEmpty: false,
      usernameChanged: false,
      usernameShort: false,
      chosen: false,
      dbUsername: "",
      visibility: false,
      visibilityIcon: "visibility",
      passwordFieldType: "password",
      oldPassword: "",
      password: "",
      repassword: "",
    };
  },
  methods: {
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
    short(val) {
      return (val && val.length > 3) || "The password is too short";
    },
    isEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "Enter a valid email";
    },
    required(val) {
      return (val && val.length > 0) || "This is required";
    },
    changePassword() {
      const user = auth.currentUser;
      if (this.oldPassword) {
        const userEmail = user.email;
        const credential = EmailAuthProvider.credential(
          userEmail,
          this.oldPassword
        );
        reauthenticateWithCredential(user, credential)
          .then(() => {
            updatePassword(user, this.password)
              .then(() => {
                alert("Password changed successfully.");
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            alert("Wrong password!");
          });
      }
    },
    updateEmail() {
      updateEmail(auth.currentUser, this.newEmail)
        .then(() => {
          update(dbRef(database, "users/" + auth.currentUser.uid), {
            email: this.newEmail,
          }).then(() => {
            alert("Email changed successfully.");
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    updateName() {
      const user = auth.currentUser;
      if (
        this.newUsername !== this.dbUsername &&
        this.newUsername.length >= 2
      ) {
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
      } else if (this.newUsername.length < 1) {
        this.usernameShort = true;
      }
    },
    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
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
.email {
  margin: 0 100px 0 100px;
}
.password {
  margin: 0 100px 0 100px;
}
.updateButtonDiv {
  display: flex;
  justify-content: center;
}
</style>
