<template>
  <q-page class="relative-position">
    <q-scroll-area :visible="false" class="absolute full-width full-height">
      <div
        v-if="!feedbackSent"
        class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm"
      >
        <div class="col">
          <q-input v-model="name" placeholder="Your name or username"></q-input>

          <q-input
            bottom-slots
            v-model="newFeedback"
            placeholder="Feedback content"
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
            @click="addNewPost"
            icon="send"
            class="q-mb-lg"
            :disable="!newFeedback || !name"
          />
        </div>
      </div>
      <div v-if="feedbackSent">
        <h5 style="text-align: center">Thank you for your feedback!</h5>
      </div>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { collection, addDoc } from "firebase/firestore";
import db from "src/boot/firebase";
export default {
  name: "FeedbackPage",
  data() {
    return {
      newFeedback: "",
      name: "",
      feedbackSent: false,
    };
  },
  methods: {
    async addNewPost() {
      let feedback = {
        content: this.newFeedback,
        date: Date.now(),
        name: this.name,
      };
      // this.posts.unshift(newPost);
      addDoc(collection(db, "feedback"), feedback);

      this.feedbackSent = true;
    },
  },
};
</script>
