<template>
  <q-page class="q-pa-lg">
    <h5 class="q-mt-none q-mb-md text-weight-bold">About Starshifted</h5>
    <div class="text-body1">
      <p>Starshifted is a Twitter inspired app made just for the users</p>
      <p>
        This app currently only has one developer only working on everything and
        hoping it is enough.
      </p>
      <p>
        Starshifted will be soon published for the people and hopefully it can
        satisfy the needs where Twitter fails.
      </p>
      <h5 class="q-mb-none q-mb-md text-weight-bold">ADMINS ONLY:</h5>
      <p>Remember that you represent this site! Behave accordinly.</p>
    </div>
    <h5 class="q-mt-md q-mb-md text-weight-bold">Rules of Starshifted</h5>
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
        <router-link :to="'/admin/settings'" style="color: pink"
          >settings</router-link
        >. (You must be logged in to access this.)
        <b>But you may not promote or post sexual violence and/or assault.</b>
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
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "AboutPage",
  data() {
    return {};
  },
  methods: {
    editPage() {},
  },
});
</script>
