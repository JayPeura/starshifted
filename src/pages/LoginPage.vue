<template>
  <q-page
    class="full-height full-width row justify-center items-center"
    style="background: radial-gradient(#5a4a9f, #101010)"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card
          square
          :class="register ? 'shadow-24 credentialCard' : 'shadow-24 loginCard'"
        >
          <q-card-section class="bg-grey-10">
            <h4 class="text-h5 text-white q-my-sm">{{ title }}</h4>
          </q-card-section>
          <q-card-section>
            <q-fab
              color="primary"
              @click="switchTypeForm"
              icon="add"
              :class="register ? 'absolute' : 'login'"
              style="top: 0; right: 20px; transform: translateY(-50%)"
            >
              <q-tooltip> Registration of a new user </q-tooltip>
            </q-fab>
            <q-form @keyup.enter="submit" class="q-px-sm q-pt-sm">
              <q-input
                ref="email"
                square
                v-model="email"
                type="email"
                lazy-rules
                :rules="[this.required, this.isEmail, this.short]"
                label="Email"
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input
                ref="username"
                v-if="register"
                square
                v-model="username"
                lazy-rules
                :rules="[
                  this.required,
                  this.usernameShort,
                  this.isUsernameTaken,
                ]"
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
                type="username"
                label="Username"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input
                ref="displayname"
                v-if="register"
                square
                v-model="displayname"
                lazy-rules
                :rules="[this.required]"
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
                type="username"
                label="Displayname"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-dialog v-model="usernameTakenPrompt">
                <q-card>
                  <q-card-section>
                    <div class="text-h6">Username taken</div>
                  </q-card-section>

                  <q-card-section class="q-pt-none">
                    Please choose another username.
                  </q-card-section>

                  <q-card-actions align="right">
                    <q-btn flat label="OK" color="primary" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>

              <q-input
                ref="password"
                square
                v-model="password"
                :type="passwordFieldType"
                lazy-rules
                :rules="[this.required, this.short]"
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
                label="Password"
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
                ref="repassword"
                v-if="register"
                square
                v-model="repassword"
                :type="passwordFieldType"
                lazy-rules
                :rules="[this.required, this.short, this.diffPassword]"
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
                label="Password again"
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
            </q-form>
          </q-card-section>
          <p
            @click="$router.push('/forgotpassword')"
            class="text-grey-6"
            style="
              cursor: pointer;
              display: flex;
              justify-content: center;
              margin-bottom: 0;
              margin-top: -5px;
            "
          >
            Forgot your password?
          </p>
          <q-card-actions class="q-px-xl">
            <q-btn
              unelevated
              size="lg"
              color="accent"
              @click="submit"
              class="full-width text-white mobileButton"
              :label="btnLabel"
            />
          </q-card-actions>
          <q-card-section v-if="!register" class="text-center q-pa-xs">
            <p
              @click="switchTypeForm"
              class="text-grey-6"
              style="cursor: pointer"
            >
              Don't have an account?
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  ref as dbRef,
  set,
  get,
  update,
  onValue,
  child,
  getDatabase,
  query,
  equalTo,
  orderByChild,
} from "firebase/database";
import db, { auth, database } from "../boot/firebase";

const emailRef = ref(""),
  usernameRef = ref(""),
  passwordRef = ref(""),
  displaynameRef = ref(""),
  imageRef = ref(""),
  repasswordRef = ref(""),
  usernameTakenRef = ref(false);

export default {
  data() {
    return {
      title: "Login",
      email: emailRef,
      username: usernameRef,
      password: passwordRef,
      repassword: repasswordRef,
      displayname: displaynameRef,
      image:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      register: false,
      takenUsername: "",
      passwordFieldType: "password",
      usernameTakenPrompt: usernameTakenRef,
      btnLabel: "Login",
      visibility: false,
      visibilityIcon: "visibility",
      loggedIn: false,
      dbUsername: "",
      dbKey: "",
    };
  },

  methods: {
    required(val) {
      return (val && val.length > 0) || "This is required";
    },
    diffPassword(val) {
      const val2 = this.$refs.password.modelValue;
      return (val && val === val2) || "The password doesn't match!";
    },
    short(val) {
      return (val && val.length > 3) || "The password is too short";
    },
    usernameShort(val) {
      return (val && val.length > 1) || "The username is too short";
    },
    isEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "Enter a valid email";
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
    submit() {
      if (this.register) {
        this.$refs.email.validate();
        this.$refs.username.validate();
        this.$refs.displayname.validate();
        this.$refs.password.validate();
        this.$refs.repassword.validate();

        const usernameRef = dbRef(database, "users");
        onValue(
          usernameRef,
          (snapshot) => {
            snapshot.forEach((childSnapshot) => {
              const childKey = childSnapshot.key;
              const childData = childSnapshot.val();
              if (this.username === childData.username) {
                this.takenUsername = childData.username;
              }
            });
          },
          {
            onlyOnce: true,
          }
        );

        if (this.takenUsername === this.username) {
          this.usernameTakenPrompt = true;
          return;
        } else {
          createUserWithEmailAndPassword(
            auth,
            this.$refs.email.modelValue,
            this.$refs.password.modelValue
          )
            .then((userCredential) => {
              // Signed in
              const user = userCredential.user;
              set(dbRef(database, "users/" + user.uid), {
                username: this.$refs.username.modelValue,
                email: this.$refs.email.modelValue,
                displayName: this.$refs.displayname.modelValue,
                status: { banned: false, banReasoning: "" },
                image: this.image,
              })
                .then(() => {
                  // Data saved successfully!
                  alert("User created successfully!");
                  this.username = "";
                  this.displayname = "";
                  this.password = "";
                  this.repassword = "";
                  this.switchTypeForm();
                })
                .catch((error) => {
                  // The write failed...
                  alert(error);
                });
              // ...
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              alert(errorMessage);
              // ..
            });
        }
      } else {
        this.$refs.email.validate();
        this.$refs.password.validate();
        signInWithEmailAndPassword(
          auth,
          this.$refs.email.modelValue,
          this.$refs.password.modelValue
        )
          .then((userCredential) => {
            // Signed in
            let lgDate = new Date();
            const user = userCredential.user;
            update(dbRef(database, "users/" + user.uid), {
              last_login: lgDate,
            })
              .then(() => {
                // Data saved successfully!
                this.loggedIn = true;
                this.$emit("logged-in", this.loggedIn);
                this.$router.push("/");
              })
              .catch((error) => {
                // The write failed...
                alert(error);
              });
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
          });
      }
    },
    switchTypeForm() {
      this.register = !this.register;
      this.title = this.register ? "Register" : "Login";
      this.btnLabel = this.register ? "Register account" : "Login";
    },
    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
  },
};
</script>

<style lang="scss" scoped>
.credentialCard {
  width: 400px;
  height: 620px;
}

.login {
  position: absolute;
}
.loginCard {
  width: 350px;
  height: 400px;
}
@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
  .credentialCard {
    width: 300px;
    height: 600px;
  }

  .loginCard {
    width: 300px;
    height: 400px;
  }
  .mobileButton {
    font-size: 12px;
  }
}
</style>
