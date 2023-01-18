<template>
  <q-page
    class="full-height full-width row justify-center items-center"
    style="background: linear-gradient(#101010, #5a4a9f)"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width: 400px; height: 360px">
          <q-card-section class="bg-grey-10">
            <h4 class="text-h5 text-white q-my-sm">{{ title }}</h4>
          </q-card-section>
          <q-card-section>
            <q-tooltip>Change password</q-tooltip>
            <q-form class="q-px-sm q-pt-xl">
              <q-input
                ref="email"
                square
                v-model="email"
                type="email"
                :rules="[this.required, this.isEmail]"
                label="Email"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>
            </q-form>
          </q-card-section>

          <q-card-actions class="q-px-lg">
            <q-btn
              unelevated
              size="lg"
              color="accent"
              @click="submit"
              class="full-width text-white"
              label="Reset password"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const emailRef = ref("");

export default {
  data() {
    return {
      title: "Reset password",
      email: emailRef,
    };
  },

  methods: {
    required(val) {
      return (val && val.length > 0) || "This is required";
    },
    isEmail(val) {
      const emailPattern =
        /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
      return emailPattern.test(val) || "Enter a valid email";
    },
    submit() {
      const auth = getAuth();
      sendPasswordResetEmail(auth, this.email)
        .then(() => {
          alert("Password reset email sent!");
          // ..
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode + " and " + errorMessage);
        });
    },
  },
};
</script>

<style></style>
