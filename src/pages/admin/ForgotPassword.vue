<template>
  <q-page
    class="full-height full-width row justify-center items-center"
    style="background: linear-gradient(#101010, #5a4a9f)"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width: 400px; height: 660px">
          <q-card-section class="bg-grey-10">
            <h4 class="text-h5 text-white q-my-md">{{ title }}</h4>
          </q-card-section>
          <q-card-section>
            <q-tooltip>Change password</q-tooltip>
            <q-form class="q-px-sm q-pt-xl">
              <q-input
                ref="oldpassword"
                square
                v-model="oldpassword"
                :type="passwordFieldType"
                lazy-rules
                :rules="[this.required, this.short, this.oldPassword]"
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
                ref="password"
                square
                v-model="password"
                :type="passwordFieldType"
                lazy-rules
                :rules="[this.required, this.short]"
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
                square
                v-model="repassword"
                :type="passwordFieldType"
                lazy-rules
                :rules="[this.required, this.short, this.diffPassword]"
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

          <q-card-actions class="q-px-lg">
            <q-btn
              unelevated
              size="lg"
              color="secondary"
              @click="submit"
              class="full-width text-white"
              :label="btnLabel"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";

const passwordRef = ref(""),
  repasswordRef = ref(""),
  oldpasswordRef = ref("");

export default {
  data() {
    return {
      title: "Change password",
      password: passwordRef,
      oldpassword: oldpasswordRef,
      repassword: repasswordRef,
      passwordFieldType: "password",
      btnLabel: "Change password",
      visibility: false,
      visibilityIcon: "visibility",
    };
  },

  methods: {
    required(val) {
      return (val && val.length > 0) || "This is required";
    },
    oldPassword(val) {},
    diffPassword(val) {
      const val2 = this.$refs.password.modelValue;
      return (val && val === val2) || "The password doesn't match!";
    },
    short(val) {
      return (val && val.length > 3) || "The password is too short";
    },
    submit() {},
    switchVisibility() {
      this.visibility = !this.visibility;
      this.passwordFieldType = this.visibility ? "text" : "password";
      this.visibilityIcon = this.visibility ? "visibility_off" : "visibility";
    },
  },
};
</script>

<style></style>
