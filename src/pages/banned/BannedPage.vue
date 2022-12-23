<template>
  <q-page class="q-pa-lg">
    <h5 class="q-mt-none q-mb-md text-weight-bold">Hello @{{ username }}!</h5>
    <h6>You have been permanently banned from Starshifted.</h6>

    <div class="text-body1">
      <p>
        You have broken the rules of the website and it resulted in a permanent
        ban.
      </p>
      <p>Your reason for being banned: "{{ banReasoning }}"</p>
      <br />
      <p>
        Send your unban request in
        <router-link to="/banned/unbanRequest">here</router-link>.
      </p>
      <p>
        Only one unban request per account, other appeals will result in
        ignoring your appeal, so make it count!
      </p>
    </div>
    <br />
    <br />
    <br />
    <h5 class="q-mt-md q-mb-md text-weight-bold">
      Rules of Starshifted as a refresher
    </h5>
    <div class="text-body2">
      <p>
        - Don't pretend to be someone you're not. Impersonating someone else is
        prohibited.
      </p>
      <p>
        - You can <b>not</b> threaten other person or a group of people with
        violence. You can <b>not</b> promote violence against, threaten or
        harass other people on the basis of their race, ethnicity, national
        origin, caste, sexual orientation, gender, gender identity, religious
        affiliation, age, disability or a serious disease.
      </p>
      <p>- You can <b>not</b> promote or threaten terrorism.</p>
      <p>- You can <b>not</b> promote or encourage self-harm or suicide.</p>
      <p>- You can <b>not</b> post media that is considered gore.</p>
      <p>
        - All sexual content must be behind NSFW toggle that you can find in
        your
        <span style="color: pink">settings</span>. (You must be logged in to
        access this.)
        <b>You may not promote or post sexual violence and/or assault.</b>
      </p>
      <p>
        - You are <b>not</b> allowed to use Starshifted as a platform for
        illegal activities or unlawful purpose. Including buying, selling or
        facilitating transactions in illegal goods or services.
      </p>
      <p>
        - You are <b>not</b> allowed to publish or post other people's private
        information and/or intimate photos or videos without their permission
        and full consent. Threatening to do so is also not allowed.
      </p>
      <p>
        - You can <b>not</b> steal copyrighted content and claim it as your own.
      </p>
      <h5 style="color: red; text-align: center">
        Any violation of these rules can result in a permanent suspension.
      </h5>
    </div>
  </q-page>
</template>

<script>
import db, { database, auth } from "src/boot/firebase";
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  orderByChild,
  equalTo,
  onValue,
} from "firebase/database";
import { defineComponent, ref, toRaw, nextTick } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "AboutPage",
  data() {
    return {
      banReasoning: null,
      username: "",
    };
  },
  mounted() {
    const myID = auth.currentUser.uid;

    const dbReff = dbRef(getDatabase());
    get(child(dbReff, `users/${myID}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.banReasoning = snapshot.val().status.banReasoning;
          this.username = snapshot.val().username;
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
});
</script>
