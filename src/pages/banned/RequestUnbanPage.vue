<template>
  <q-page class="relative-position">
    <q-scroll-area :visible="false" class="absolute full-width full-height">
      <div
        v-if="!requestSent"
        class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm"
      >
        <div class="col">
          <q-input
            bottom-slots
            v-model="newRequest"
            placeholder="Unban request content here..."
            autogrow
            class="new-post"
          >
          </q-input>
        </div>

        <div class="col col-shrink">
          <q-btn
            round
            dense
            flat
            @click="addNewRequest"
            icon="send"
            class="q-mb-lg"
            :disable="!newRequest"
          />
        </div>
      </div>
      <div v-if="requestSent">
        <h5 style="text-align: center">
          Thank you for appealing! We will process this request ASAP.
        </h5>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { collection, addDoc } from "firebase/firestore";
import { ref as dbRef, get, getDatabase, child } from "firebase/database";
import db, { auth } from "src/boot/firebase";
export default {
  name: "FeedbackPage",
  data() {
    return {
      newRequest: "",
      username: "",
      name: "",
      email: "",
      requestSent: false,
    };
  },
  methods: {
    async addNewRequest() {
      const myID = auth.currentUser.uid;
      let appeal = {
        appealContent: this.newRequest,
        email: this.email,
        date: Date.now(),
        name: this.name,
      };
      addDoc(
        collection(db, "appeals/" + this.username + "/sentRequests"),
        appeal
      );

      this.requestSent = true;
    },
  },
  mounted() {
    const myID = auth.currentUser.uid;

    const dbReff = dbRef(getDatabase());
    get(child(dbReff, `users/${myID}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.username = snapshot.val().username;
          this.email = snapshot.val().email;
          this.name = snapshot.val().displayName;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
</script>
