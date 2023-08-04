<template>
  <q-page class="relative-position">
    <q-scroll-area
      :visible="false"
      class="absolute full-width full-height"
      :style="
        'background-color: ' +
        getThemeColour(theme.value).mild +
        '; color: ' +
        getThemeColour(theme.value).txt
      "
    >
      <div class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm">
        <div class="col">
          <span class="isNSFW">NSFW?</span>
          <q-toggle
            v-model="isNSFW"
            color="red"
            keep-color
            title="Is your post NSFW? Toggle this if yes (:"
            style="position: absolute; top: 0; right: 0"
          />
          <q-input
            bottom-slots
            v-model="newStarshiftingPost"
            placeholder="What's going on?"
            autogrow
            borderless
            :counter="newStarshiftingPost ? true : false"
            maxlength="680"
            class="new-post"
            @update:model-value="showSuggestions"
          >
            <template v-slot:before>
              <q-avatar round size="xl">
                <q-img v-bind:src="myImage" class="myPostAvatar" />
              </q-avatar>
            </template>
          </q-input>

          <ul v-if="showSuggestedHashtags">
            <q-item
              v-for="suggestion in suggestedHashtags"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              clickable
            >
              #{{ suggestion.topic }}
            </q-item>
          </ul>
        </div>

        <div class="col col-shrink">
          <q-btn
            icon="image"
            round
            dense
            flat
            class="q-mb-lg"
            type="button"
            @click="pickFile"
          />
          <q-file
            style="display: none"
            v-model="image"
            accept=".jpg, image/*"
            @update:model-value="onFilePicked(e)"
            ref="files"
          >
          </q-file>
          <q-btn
            round
            dense
            flat
            @click="addNewPost"
            icon="send"
            class="q-mb-lg"
            :disable="!newStarshiftingPost && !image"
          />
        </div>
      </div>
      <div :class="imageShow ? 'showwhenimage' : 'hidewhenimage'">
        <q-img :src="imageUrl" class="imagePreview" ratio="1" />
        <q-btn
          round
          dense
          flat
          icon="close"
          :class="imageShow ? 'showwhenimagebtn' : 'hidewhenimagebtn'"
          @click="cancelFileUpload"
        ></q-btn>
      </div>
      <q-separator
        size="15px"
        :style="
          'background-color: ' +
          getThemeColour(theme.value).mild +
          '; color: ' +
          getThemeColour(theme.value).txt
        "
        :class="$q.dark.isActive ? 'dividerDark' : 'dividerLight'"
      />
      <q-list v-if="$route.name === 'Home'" separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item v-for="post in posts" :key="post.id" class="q-py-md">
            <q-item-section avatar top>
              <label
                for="actual-btn"
                class="clickableLabel"
                @click="handleRedirect(post)"
              >
                <q-avatar round size="xl">
                  <q-img
                    v-bind:src="post.creatorImage"
                    class="homePostAvatar"
                  /> </q-avatar
              ></label>

              <button id="actual-btn" hidden></button>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1"
                ><strong
                  @click="handleRedirect(post)"
                  class="clickableLabel"
                  :style="'color: ' + getThemeColour(theme.value).txt"
                  >{{ post.creatorDisplayname }}</strong
                >
                <q-icon
                  :name="post.isUserVerified ? 'bi-moon-stars-fill' : ''"
                  :style="'color: ' + getThemeColour(theme.value).txt"
                  :class="
                    post.isUserVerified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
                />
                <span
                  class="text-grey-7"
                  style="
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                  "
                >
                  @{{ post.creatorUsername }}
                  ─
                </span>
                <span class="text-grey-7">
                  {{
                    post.date > Date.now() - 35 * 60 * 60 * 1000
                      ? formatDistanceStrict(post.date, new Date()) + " ago"
                      : format(post.date, "d MMM")
                  }}</span
                >
                <span v-if="post.NSFW" style="color: red; margin-left: 5px"
                  >NSFW</span
                >
              </q-item-label>
              <q-item-label class="homePostContent text-body1">
                <span
                  v-html="linkifyText(post)"
                  :style="
                    'background-color: ' +
                    getThemeColour(theme.value).mild +
                    '; color: ' +
                    getThemeColour(theme.value).txt
                  "
                ></span>
                <img
                  v-if="post.NSFW"
                  @click="openDialog(post)"
                  :src="post.postImg"
                  class="postImage blur"
                />
                <img
                  v-else
                  @click="openDialog(post)"
                  :src="post.postImg"
                  class="postImage"
                />
                <div v-for="repost in repostedPosts" :key="repost.id">
                  <q-item
                    v-if="
                      post.repostID !== undefined &&
                      repost.id === post.repostID &&
                      !repost.deleted
                    "
                    style="
                      border: 1px solid grey;
                      border-radius: 5px;
                      padding: 15px;
                      margin-top: 10px;
                      margin-right: 20px;
                    "
                    clickable
                    :to="'/post/' + post.repostID"
                  >
                    <q-item-section avatar top>
                      <label
                        for="actual-btn"
                        class="clickableLabel"
                        @click="handleRedirect(repost)"
                      >
                        <q-avatar round size="lg">
                          <q-img
                            v-bind:src="repost.creatorImage"
                            class="homeRepostAvatar"
                          /> </q-avatar
                      ></label>

                      <button id="actual-btn" hidden></button>
                    </q-item-section>
                    <q-item-label class="text-subtitle1"
                      ><strong
                        @click="handleRedirect(repost)"
                        class="clickableLabel"
                        :style="'color: ' + getThemeColour(theme.value).txt"
                        >{{ repost.creatorDisplayname }}</strong
                      >
                      <q-icon
                        :name="post.isUserVerified ? 'bi-moon-stars-fill' : ''"
                        :style="'color: ' + getThemeColour(theme.value).txt"
                        :class="
                          repost.isUserVerified
                            ? 'showWhenVerified'
                            : 'hideWhenNotVerified'
                        "
                      />
                      <span
                        class="text-grey-7"
                        style="
                          text-overflow: ellipsis;
                          white-space: nowrap;
                          overflow: hidden;
                        "
                      >
                        @{{ repost.creatorUsername }}
                        ─
                      </span>
                      <span class="text-grey-7">
                        {{
                          repost.date > Date.now() - 35 * 60 * 60 * 1000
                            ? formatDistanceStrict(repost.date, new Date()) +
                              " ago"
                            : format(repost.date, "d MMM")
                        }}</span
                      >
                      <span
                        v-if="repost.NSFW"
                        style="color: red; margin-left: 5px"
                        >NSFW</span
                      >
                      <q-item-label class="homePostContent text-body2">
                        <span
                          v-html="linkifyText(repost)"
                          :style="
                            'background-color: ' +
                            getThemeColour(theme.value).mild +
                            '; color: ' +
                            getThemeColour(theme.value).txt
                          "
                        ></span>
                        <img
                          v-if="repost.NSFW"
                          :src="repost.postImg"
                          class="postImage blur"
                        />
                        <img v-else :src="repost.postImg" class="postImage" />
                      </q-item-label>
                    </q-item-label>
                  </q-item>
                  <q-item
                    v-if="repost.deleted && repost.id === post.repostID"
                    style="border: 2px solid grey; padding: 15px; color: red"
                    >DELETED POST</q-item
                  >
                </div>
              </q-item-label>
              <div class="postMenu row justify-between q-mt-sm">
                <q-btn
                  flat
                  round
                  icon="more_vert"
                  size="13px"
                  @click="getFollowed(post)"
                >
                  <q-menu auto-close>
                    <q-list style="min-width: 240px">
                      <q-item
                        v-if="post.creatorId !== myID"
                        clickable
                        @click="followFromPost(post)"
                      >
                        <q-item-section avatar>
                          <q-icon
                            :color="$q.dark.isActive ? 'secondary' : 'primary'"
                            name="person"
                            size="sm"
                          />
                        </q-item-section>

                        <q-item-section
                          >{{ following }} @{{
                            post.creatorUsername
                          }}</q-item-section
                        >
                      </q-item>
                      <q-separator color="grey-9" />

                      <q-item
                        v-if="post.creatorId === myID || admin"
                        clickable
                        @click="deletePost(post)"
                      >
                        <q-item-section avatar>
                          <q-icon
                            :color="$q.dark.isActive ? 'secondary' : 'primary'"
                            name="delete"
                            class="text-red"
                            size="sm"
                        /></q-item-section>
                        <q-item-section class="text-red"
                          >Delete post</q-item-section
                        ></q-item
                      >

                      <q-item
                        v-if="post.creatorId !== myID && !admin"
                        clickable
                        @click="confirmReport(post)"
                      >
                        <q-item-section avatar>
                          <q-icon
                            :color="$q.dark.isActive ? 'secondary' : 'primary'"
                            name="warning"
                            class="text-red"
                            size="sm"
                        /></q-item-section>
                        <q-item-section class="text-red"
                          >Report post</q-item-section
                        >
                      </q-item>
                      <q-separator
                        v-if="post.creatorId !== myID && admin"
                        color="grey-9"
                      />
                      <q-item
                        v-if="post.creatorId !== myID && admin"
                        clickable
                        outline
                        @click="banUser(post)"
                      >
                        <q-item-section avatar>
                          <q-icon
                            :color="$q.dark.isActive ? 'secondary' : 'primary'"
                            name="gavel"
                            class="text-red"
                            size="sm"
                        /></q-item-section>
                        <q-item-section class="text-red"
                          >Ban user</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <div class="post-icons row justify-between q-mt-sm">
                <q-btn
                  flat
                  round
                  color="grey"
                  icon="chat_bubble_outline"
                  size="sm"
                  :to="'/post/' + post.id"
                />
                <q-btn
                  flat
                  round
                  color="grey"
                  icon="cached"
                  size="sm"
                  @click="
                    repostPrompt = true;
                    selectedPost = post;
                  "
                />
                <div class="postButtonContainer">
                  <q-btn
                    flat
                    round
                    @click="toggleLiked(post)"
                    :color="checkColor(post)"
                    :icon="checkIcon(post)"
                    size="sm"
                  >
                  </q-btn>
                  <span
                    class="postLikes"
                    @click="
                      likePrompt = true;
                      selectedPost = post;
                      selectedLikes();
                    "
                  >
                    {{
                      post.whoLiked !== undefined
                        ? new Intl.NumberFormat("en-GB", {
                            notation: "compact",
                          }).format(Object.keys(post.whoLiked).length)
                        : 0
                    }}
                  </span>
                </div>
                <q-btn flat round color="grey" icon="share" size="sm" />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
        <q-separator
          size="1px"
          :color="$q.dark.isActive ? 'grey-9' : 'grey-4'"
          :class="$q.dark.isActive ? 'dividerDark' : 'dividerLight'"
        />
      </q-list>
    </q-scroll-area>
    <q-dialog v-for="post in posts" :key="post.id" v-model="post.imageShower">
      <q-card>
        <img :src="post.postImg" />
      </q-card>
    </q-dialog>
    <q-dialog v-model="repostPrompt" persistent>
      <q-card style="padding: 10px; width: 700px">
        <q-card-section>
          <div class="text-h5">Want to repost this?</div>
          <span class="text-body1 text-red"
            >@{{ selectedPost.creatorUsername }}:</span
          >
          <p>{{ selectedPost.content }}</p>
          <q-img
            v-if="selectedPost.postImg"
            :src="selectedPost.postImg"
            style="height: 300px; width: 300px"
          />
        </q-card-section>
        <q-separator />
        <div class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm">
          <div class="col">
            <q-input
              bottom-slots
              v-model="repostPost"
              placeholder="Repost content here"
              autogrow
              borderless
              :counter="repostPost ? true : false"
              maxlength="680"
              class="new-post"
            >
              <template v-slot:before>
                <q-avatar round size="xl">
                  <q-img v-bind:src="myImage" class="myPostAvatar" />
                </q-avatar>
              </template>
            </q-input>
          </div>

          <div class="col col-shrink">
            <span class="isNSFW">NSFW?</span>
            <q-toggle
              v-model="isNSFW"
              color="red"
              keep-color
              title="Is your post NSFW? Toggle this if yes (:"
            />
            <q-btn
              icon="image"
              round
              dense
              flat
              class="q-mb-lg"
              type="button"
              @click="pickFile"
            />
            <q-file
              style="display: none"
              v-model="repostImage"
              accept=".jpg, image/*"
              @update:model-value="onFilePickedRepost(e)"
              ref="files"
            >
            </q-file>
            <q-btn
              round
              dense
              flat
              @click="repostThis(selectedPost, repostPost)"
              icon="send"
              class="q-mb-lg"
              :disable="!repostPost && !repostImage"
              v-close-popup
            />
          </div>
        </div>
        <div :class="imageRepostShow ? 'showwhenimage' : 'hidewhenimage'">
          <q-img :src="repostImageUrl" class="imagePreview" ratio="1" />
          <q-btn
            round
            dense
            flat
            icon="close"
            :class="imageRepostShow ? 'showwhenimagebtn' : 'hidewhenimagebtn'"
            @click="cancelFileUpload"
          ></q-btn>
        </div>
        <q-card-actions>
          <q-btn v-close-popup label="Close" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="likePrompt" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">People who liked this post</div>
        </q-card-section>
        <q-separator />

        <q-card-section style="max-height: 35vh" class="scroll"
          ><q-list v-if="!noLikes" separator>
            <q-item class="likers" v-for="liker in likers" :key="liker.id">
              <q-item-section avatar>
                <label
                  for="actual-btn"
                  class="clickableLabel"
                  @click="handleRedirectLikes(liker)"
                >
                  <q-avatar round size="xl">
                    <q-img
                      :src="liker.image"
                      class="homePostAvatar"
                    /> </q-avatar
                ></label>

                <button id="actual-btn" hidden></button>
              </q-item-section>
              <q-item-label
                class="text-subtitle1"
                style="display: flex; align-items: center"
                ><strong
                  @click="handleRedirectLikes(liker)"
                  class="clickableLabel"
                  >{{ liker.displayName }}</strong
                >
                <q-icon
                  :name="liker.verified ? 'bi-moon-stars-fill' : ''"
                  :class="
                    liker.verified ? 'showWhenVerified' : 'hideWhenNotVerified'
                  "
                />
                <span
                  class="text-grey-7"
                  style="
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                  "
                >
                  @{{ liker.username }}
                  <br />
                </span>
                <br />
                <br />
                <br /> </q-item-label></q-item
          ></q-list>
        </q-card-section>
        <div v-if="noLikes" align="center">No one liked this post yet.</div>
        <br />

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Close"
            :color="$q.dark.isActive ? 'secondary' : 'primary'"
            v-close-popup
            @click="likers = []"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteField,
  setDoc,
  arrayUnion,
  where,
} from "firebase/firestore";
import db, { database, auth, storage } from "src/boot/firebase";
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  onValue,
} from "firebase/database";
import { defineComponent, ref, toRaw, nextTick } from "vue";
import { formatDistance, formatDistanceStrict, format } from "date-fns";
import { ref as stRef, uploadBytes } from "firebase/storage";
import sanitizeHtml from "sanitize-html";
import { useQuasar } from "quasar";
import { trendingTopics, topics } from "../../trendingTopics";

const imageRef = ref(null);
const imageUrlRef = ref("");
const likeRef = ref(0);

export default defineComponent({
  name: "HomePage",
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.posts = [];
      vm.repostedPosts = [];
      vm.getPosts();
      vm.getProfileInfo();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.posts = [];
    this.repostedPosts = [];
    this.getPosts();
    this.getProfileInfo();
    next();
  },
  data() {
    return {
      newStarshiftingPost: "",
      isNSFW: false,
      currName: "",
      currUsername: "",
      creatorUsername: "",
      creatorDisplayname: "",
      userVerified: false,
      creatorVerified: false,
      creatorImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      defaultImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      formatDistance,
      formatDistanceStrict,
      format,
      imageUrl: imageUrlRef,
      image: imageRef,
      posts: [],
      imageShow: false,
      postLikes: likeRef,
      following: "Follow",
      creatorID: "",
      currentCreatorID: "",
      postID: [],
      myPosts: [],
      myID: auth.currentUser.uid,
      isHidden: false,
      isLiked: false,
      admin: false,
      imageShower: false,
      openImage: "",
      likePrompt: false,
      selectedPost: {},
      likers: [],
      noLikes: true,
      hashtags: [],
      theme: "",
      repostPrompt: false,
      repostPost: "",
      repostImageUrl: "",
      repostImage: null,
      imageRepostShow: false,
      repostedPosts: [],
      repostID: [],
      suggestedHashtags: [],
      showSuggestedHashtags: false,
      doYouWantNSFW: false,
      NSFWPosts: [],
    };
  },
  setup() {
    const $q = useQuasar();
    const confirmReport = (post) => {
      $q.dialog({
        title: "Report post",
        message: `Post content: "${post.content}"`,
        prompt: {
          model: "",
          isValid: (val) => val.length > 2,
          type: "text",
        },
        cancel: true,
        persistent: true,
      }).onOk((data) => {
        addDoc(collection(db, "reports"), {
          postContent: post.content,
          posterUsername: post.creatorUsername,
          posterID: post.creatorId,
          postID: post.id,
          reportContent: data,
        });
      });
    };
    const banUser = (post) => {
      $q.dialog({
        title: "Ban user",
        message: `Do you want to ban user @${post.creatorUsername} from Starshifted?`,
        prompt: {
          model: "",
          placeholder: "Ban reasoning",
          type: "text",
        },
        cancel: true,
        persistent: true,
      }).onOk((data) => {
        console.log("Banned user!");
        update(dbRef(database, "users/" + post.creatorId), {
          status: {
            banned: true,
            banReasoning: data,
          },
        });
      });
    };
    return { confirmReport, banUser };
  },
  methods: {
    openDialog(post) {
      post.openImage = post.postImg;
      post.imageShower = true;
    },
    showSuggestions() {
      const hashtags = this.newStarshiftingPost.match(/#[^\s#]+/g); // Extract hashtags using regular expression
      if (hashtags && hashtags.length > 0) {
        const lastHashtag = hashtags[hashtags.length - 1];
        const keyword = lastHashtag.substring(1); // Remove the leading "#" from the last hashtag

        // Get trending suggestions based on the keyword
        const trendingSuggestions = trendingTopics.filter((existingTag) =>
          existingTag.topic.startsWith(keyword)
        );

        const nonTrendingSuggestions = topics.filter(
          (existingTag) =>
            existingTag.topic.startsWith(keyword) &&
            !trendingSuggestions.some((tag) => tag.topic === existingTag.topic)
        );

        // Combine and filter out duplicate suggestions
        const combinedSuggestions = [
          ...trendingSuggestions,
          ...nonTrendingSuggestions,
        ];

        // Limit the suggestions to 4 items
        this.suggestedHashtags = combinedSuggestions.slice(0, 4);
        this.showSuggestedHashtags = trendingSuggestions.length > 0;
      } else {
        this.showSuggestedHashtags = false;
        this.suggestedHashtags = [];
      }
    },
    selectSuggestion(suggestion) {
      const hashtags = this.newStarshiftingPost.match(/#[^\s#]+/g); // Extract hashtags using regular expression
      if (hashtags && hashtags.length > 0) {
        const lastHashtag = hashtags[hashtags.length - 1];
        const updatedText = this.newStarshiftingPost.replace(
          lastHashtag,
          "#" + suggestion.topic
        );
        this.newStarshiftingPost = updatedText;
      }
      this.showSuggestedHashtags = false;
      this.suggestedHashtags = [];
    },
    async repostThis(post, repost) {
      const creatorID = auth.currentUser.uid;
      let newPost = {
        content: repost,
        date: Date.now(),
        whoLiked: [],
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        postImg: this.repostImageUrl,
        hashtags: this.createHashtags(repost),
        NSFW: this.isNSFW,
        repostID: post.id,
      };
      addDoc(collection(db, "posts"), newPost);
      if (this.repostImage !== null) {
        let uidDate = new Date().getTime();
        const currentUser = auth.currentUser;

        const metadata = {
          contentType: this.repostImage.type,
        };

        const fileRef = stRef(
          storage,
          "images/posts/" + currentUser.uid + uidDate
        );

        await uploadBytes(fileRef, this.repostImage, metadata);
      }
      this.imageRepostShow = false;
      this.repostImageUrl = "";
      this.repostImage = null;
      this.hashtags = [];
    },
    resetImage() {
      this.openImage = "";
    },
    handleRedirectLikes(liker) {
      console.log(liker);
      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${liker.id}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.$router.push("/profile/" + snapshot.val().username);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    selectedLikes() {
      if (this.selectedPost.whoLiked !== undefined) {
        this.noLikes = true;
      }
      const likes = Object.keys(this.selectedPost.whoLiked);
      likes.forEach((likerID) => {
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${likerID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              let likers = snapshot.val();
              likers.id = snapshot.key;
              this.likers.push(likers);
              this.noLikes = false;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    followFromPost(post) {
      const followerID = auth.currentUser.uid;

      const db2 = getDatabase();
      const q = dbRef(db2, "users/" + post.creatorId);
      get(q).then((snapshot) => {
        if (snapshot.exists()) {
          onValue(
            q,
            (theirSnapshot) => {
              const info = theirSnapshot.val();

              const myRef = dbRef(database, "users/" + followerID);
              onValue(
                myRef,
                (mySnapshot) => {
                  const myInfo = mySnapshot.val();
                  if (info.followers === undefined) {
                    this.followerCount = 0;
                  }

                  if (info.followers === undefined) {
                    this.followed = true;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;
                    this.following = "Unfollow";
                    update(dbRef(database, "users/" + post.creatorId), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${post.creatorId}`]: true,
                    });
                  } else if (!info.followers[followerID]) {
                    this.followed = true;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;
                    this.following = "Unfollow";

                    update(dbRef(database, "users/" + post.creatorId), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${post.creatorId}`]: true,
                    });
                  } else {
                    this.followed = false;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;
                    this.following = "Follow";

                    update(dbRef(database, "users/" + post.creatorId), {
                      [`followers/${followerID}`]: null,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${post.creatorId}`]: null,
                    });
                  }
                },
                {
                  onlyOnce: true,
                }
              );
            },
            {
              onlyOnce: true,
            }
          );
        }
      });
    },
    async getFollowed(post) {
      const myID = auth.currentUser.uid;
      const db2 = getDatabase();
      const followerRef = dbRef(db2);
      const getData = await get(child(followerRef, "users/" + myID)).then(
        (snapshot) => {
          if (snapshot.exists()) {
            const followingData = snapshot.val();
            if (followingData.following === undefined) {
              this.following = "Follow";
              return;
            }
            if (followingData.following[post.creatorId]) {
              this.following = "Unfollow";
              return;
            } else {
              this.following = "Follow";
              return;
            }
          }
        }
      );
    },
    checkColor(post) {
      const myID = auth.currentUser.uid;
      if (post.whoLiked === undefined) {
        return "grey";
      } else if (post.whoLiked[myID]) {
        return "red";
      } else if (!post.whoLiked[myID]) {
        return "grey";
      }
    },
    checkIcon(post) {
      const myID = auth.currentUser.uid;
      if (post.whoLiked === undefined) {
        return "star_border";
      } else if (post.whoLiked[myID]) {
        return "star";
      } else if (!post.whoLiked[myID]) {
        return "star_border";
      }
    },
    linkifyText(post) {
      const pattern1 =
        /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      let text = post.content.replace(
        pattern1,
        '<a href="$1" target="_blank">$1</a>'
      );

      const pattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      text = text.replace(
        pattern2,
        '$1<a href="http://$2" target="_blank">$2</a>'
      );

      const pattern3 = /#(\w+)/g;
      text = text.replace(
        pattern3,
        '<a class="hashtag" href="/#/topic/$1">#$1</a>'
      );

      return sanitizeHtml(text, {
        allowedTags: ["b", "i", "em", "strong", "a"],
        allowedAttributes: {
          a: ["href", "class"],
        },
        allowedIframeHostnames: ["www.youtube.com"],
      });
    },
    cancelFileUpload() {
      this.image = null;
      this.imageUrl = "";
      this.imageShow = false;
      this.repostImage = null;
      this.repostImageUrl = "";
      this.imageRepostShow = false;
    },
    pickFile() {
      this.$refs.files.pickFiles();
    },
    async onFilePicked(e) {
      const reader = new FileReader();
      reader.readAsDataURL(this.image);
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.imageShow = true;
      };
    },
    async onFilePickedRepost(e) {
      const reader = new FileReader();
      reader.readAsDataURL(this.repostImage);
      reader.onload = () => {
        this.repostImageUrl = reader.result;
        this.imageRepostShow = true;
      };
    },
    handleRedirect(post) {
      this.$router.push("/profile/" + post.creatorUsername);
    },
    createHashtags(text) {
      const regex = /#\w+/g;
      const matches = text.match(regex);
      if (matches) {
        return (this.hashtags = [...matches.map((tag) => tag.substring(1))]);
      } else {
        return [];
      }
    },
    async addNewPost() {
      const creatorID = auth.currentUser.uid;
      let newPost = {
        content: this.newStarshiftingPost,
        date: Date.now(),
        whoLiked: [],
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        postImg: this.imageUrl,
        hashtags: this.createHashtags(this.newStarshiftingPost),
        NSFW: this.isNSFW,
      };
      addDoc(collection(db, "posts"), newPost);
      if (this.image !== null) {
        let uidDate = new Date().getTime();
        const currentUser = auth.currentUser;

        const metadata = {
          contentType: this.image.type,
        };

        const fileRef = stRef(
          storage,
          "images/posts/" + currentUser.uid + uidDate
        );

        await uploadBytes(fileRef, this.image, metadata);
      }
      this.imageShow = false;
      this.imageUrl = "";
      this.image = null;
      this.newStarshiftingPost = "";
      this.hashtags = [];
    },
    deletePost(post) {
      if (auth.currentUser.uid === post.creatorId || this.admin) {
        deleteDoc(doc(db, "posts", post.id));
      } else {
        return;
      }
    },
    async toggleLiked(post) {
      const creatorID = auth.currentUser.uid;
      this.postID = post.id;

      this.getProfileInfo();
      if (post.whoLiked === undefined) {
        const updateData = {
          [`whoLiked.${creatorID}`]: { dateLiked: Date.now() },
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
        const notificationsRef = doc(db, "notifications", post.creatorId);
        const docSnapshot = await getDoc(notificationsRef);

        if (docSnapshot.exists()) {
          const notificationsData = docSnapshot.data().notifications;
          const existingNotification = notificationsData.find(
            (notification) =>
              notification.type === "like" &&
              notification.postID === post.id &&
              notification.likerID === creatorID
          );

          if (!existingNotification) {
            notificationsData.push({
              type: "like",
              postID: post.id,
              likerID: creatorID,
              date: Date.now(),
              recipientID: post.creatorId,
              seen: false,
              likerDN: this.currName,
              index: notificationsData.length,
            });

            await updateDoc(notificationsRef, {
              notifications: notificationsData,
            });
          }
        } else {
          const notificationsData = [
            {
              type: "like",
              postID: post.id,
              likerID: creatorID,
              date: Date.now(),
              recipientID: post.creatorId,
              seen: false,
              likerDN: this.currName,
              index: 0,
            },
          ];

          await setDoc(notificationsRef, {
            notifications: notificationsData,
          });
        }
      } else if (!post.whoLiked[creatorID]) {
        const updateData = {
          [`whoLiked.${creatorID}`]: { dateLiked: Date.now() },
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
        const notificationsRef = doc(db, "notifications", post.creatorId);
        const docSnapshot = await getDoc(notificationsRef);

        if (docSnapshot.exists()) {
          const notificationsData = docSnapshot.data().notifications;
          const existingNotification = notificationsData.find(
            (notification) =>
              notification.type === "like" &&
              notification.postID === post.id &&
              notification.likerID === creatorID
          );

          if (!existingNotification) {
            notificationsData.push({
              type: "like",
              postID: post.id,
              likerID: creatorID,
              date: Date.now(),
              recipientID: post.creatorId,
              seen: false,
              likerDN: this.currName,
              index: notificationsData.length,
            });

            await updateDoc(notificationsRef, {
              notifications: notificationsData,
            });
          }
        } else {
          const notificationsData = [
            {
              type: "like",
              postID: post.id,
              likerID: creatorID,
              date: Date.now(),
              recipientID: post.creatorId,
              seen: false,
              likerDN: this.currName,
              index: 0,
            },
          ];

          await setDoc(notificationsRef, {
            notifications: notificationsData,
          });
        }
      } else if (post.whoLiked[creatorID]) {
        const updateData = {
          [`whoLiked.${creatorID}`]: deleteField(),
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
      } else {
        console.log("Toodaloo");
      }
    },
    async getDelete(post) {
      const myID = auth.currentUser.uid;

      const docRef = doc(db, "posts", post.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.isHidden = data.isHidden;
        console.log(data);
        if (data.creatorId === myID) {
          const updateData = {
            isHidden: false,
          };
          updateDoc(doc(db, "posts/", post.id), updateData);
        } else {
          const updateData = {
            isHidden: true,
          };
          updateDoc(doc(db, "posts/", post.id), updateData);
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    },
    async getPosts() {
      const myID = auth.currentUser.uid;
      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${myID}`)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Retrieve the followers' IDs from the followingData object
          if (data.following !== undefined) {
            const followingIDs = Object.keys(data.following);
            followingIDs.push(myID);
            const postQ = query(
              collection(db, "posts"),
              where("creatorId", "in", followingIDs),
              orderBy("date")
            );
            const unsubscribe = onSnapshot(postQ, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                let postChange = change.doc.data();
                postChange.id = change.doc.id;
                this.postID = postChange.id;
                this.creatorID = postChange.creatorId;
                if (postChange.underPostID === undefined) {
                  if (change.type === "added") {
                    this.creatorUsername = postChange.creatorUsername;
                    this.creatorDisplayname = postChange.creatorDisplayname;
                    this.creatorImage = postChange.creatorImage;
                    this.creatorVerified = postChange.isUserVerified;
                    this.postImage = postChange.postImg;
                    this.postID = postChange.id;
                    this.repostID = postChange.repostID;
                    this.creatorID = postChange.creatorId;
                    if (postChange.NSFW) {
                      if (this.doYouWantNSFW) {
                        this.myPosts.unshift(postChange.id);
                        this.posts.unshift(postChange);
                      }
                    } else {
                      this.myPosts.unshift(postChange.id);
                      this.posts.unshift(postChange);
                    }

                    if (postChange.hashtags !== undefined) {
                      postChange.hashtags.forEach((hashtag) => {
                        if (!this.hashtags.includes(hashtag)) {
                          this.hashtags.push(hashtag);
                        }
                      });
                    }
                    if (postChange.repostID !== undefined) {
                      const newSub = onSnapshot(
                        doc(db, "posts", postChange.repostID),
                        (prevPoster) => {
                          if (prevPoster.exists()) {
                            let prevPost = prevPoster.data();
                            prevPost.id = prevPoster.id;

                            const existingPostIndex =
                              this.repostedPosts.findIndex(
                                (post) => post.id === postChange.repostID
                              );

                            if (existingPostIndex === -1) {
                              this.repostedPosts.push(prevPost);
                            }
                          } else {
                            const deletedPostIndex =
                              this.repostedPosts.findIndex(
                                (post) => post.id === postChange.repostID
                              );

                            if (deletedPostIndex !== -1) {
                              this.repostedPosts[
                                deletedPostIndex
                              ].deleted = true;
                            } else {
                              this.repostedPosts.push({
                                deleted: true,
                                id: postChange.repostID,
                              });
                            }
                          }
                        }
                      );
                    }

                    if (postChange.creatorId === this.creatorID) {
                      const joinedArray = this.myPosts.join(" ");
                      const array = joinedArray.split(" ");
                      const filteredArray = array.filter(
                        (item) => item === postChange.id
                      );

                      const usernameRef = dbRef(
                        database,
                        "users/" + postChange.creatorId
                      );
                      onValue(usernameRef, async (snapshot) => {
                        if (snapshot.val() !== null) {
                          const data = snapshot.val();
                          for (const postId of filteredArray) {
                            const replaceInfo = doc(db, "posts", postId);
                            let newInfo;

                            if (data.verified === undefined) {
                              this.userVerified = false;
                              this.currUsername = data.username;
                              this.currName = data.displayName;

                              if (this.creatorID === myID && this.postID) {
                                newInfo = {
                                  creatorUsername: data.username,
                                  creatorDisplayname: data.displayName,
                                  isUserVerified: false,
                                  creatorImage: data.image,
                                  isHidden: false,
                                };
                              } else {
                                newInfo = {
                                  isUserVerified: this.userVerified,
                                };
                              }
                            } else {
                              this.userVerified = data.verified;
                              this.currUsername = data.username;
                              this.currName = data.displayName;

                              if (this.creatorID === myID && this.postID) {
                                newInfo = {
                                  creatorUsername: data.username,
                                  creatorDisplayname: data.displayName,
                                  isUserVerified: data.verified,
                                  creatorImage: data.image,
                                  isHidden: false,
                                };
                              } else if (this.creatorID !== myID) {
                                newInfo = {
                                  isHidden: true,
                                };
                              } else {
                                newInfo = {
                                  isUserVerified: this.userVerified,
                                };
                              }
                            }

                            await updateDoc(replaceInfo, newInfo);
                          }
                        } else if (snapshot.val() === null) {
                          this.userVerified = false;
                          this.currUsername = "";
                          this.currName = "Deleted User";
                          this.creatorUsername = "";
                          this.creatorDisplayname = "Deleted User";
                          this.creatorImage = this.defaultImage;
                          this.creatorVerified = false;

                          const replaceInfo = doc(db, "posts/", filteredArray);
                          const newInfo = {
                            creatorUsername: "",
                            creatorDisplayname: "Deleted User",
                            isUserVerified: false,
                            creatorImage: this.defaultImage,
                            content: "(deleted)",
                          };
                          updateDoc(replaceInfo, newInfo);
                        }
                      });
                    }
                  }

                  if (change.type === "modified") {
                    let index = this.posts.findIndex(
                      (post) => post.id === postChange.id
                    );
                    Object.assign(this.posts[index], postChange);
                  }
                  if (change.type === "removed") {
                    let index = this.posts.findIndex(
                      (post) => post.id === postChange.id
                    );
                    this.posts.splice(index, 1);
                  }
                }
              });
            });
          } else {
            const postQ = query(collection(db, "posts"), orderBy("date"));
            const unsubscribe = onSnapshot(postQ, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                let postChange = change.doc.data();
                postChange.id = change.doc.id;
                this.postID = postChange.id;
                this.creatorID = postChange.creatorId;
                if (postChange.underPostID === undefined) {
                  if (change.type === "added") {
                    this.creatorUsername = postChange.creatorUsername;
                    this.creatorDisplayname = postChange.creatorDisplayname;
                    this.creatorImage = postChange.creatorImage;
                    this.creatorVerified = postChange.isUserVerified;
                    this.postImage = postChange.postImg;
                    this.postID = postChange.id;
                    this.repostID = postChange.repostID;
                    this.creatorID = postChange.creatorId;
                    const likes = Object.keys(postChange.whoLiked);

                    if (likes.length >= this.globalLikeVariable) {
                      if (postChange.NSFW) {
                        if (this.doYouWantNSFW) {
                          this.myPosts.unshift(postChange.id);
                          this.posts.unshift(postChange);
                        }
                      } else {
                        this.myPosts.unshift(postChange.id);
                        this.posts.unshift(postChange);
                      }
                    }
                    if (postChange.hashtags !== undefined) {
                      postChange.hashtags.forEach((hashtag) => {
                        if (!this.hashtags.includes(hashtag)) {
                          this.hashtags.push(hashtag);
                        }
                      });
                    }
                    if (postChange.repostID !== undefined) {
                      const newSub = onSnapshot(
                        doc(db, "posts", postChange.repostID),
                        (prevPoster) => {
                          if (prevPoster.exists()) {
                            let prevPost = prevPoster.data();
                            prevPost.id = prevPoster.id;

                            const existingPostIndex =
                              this.repostedPosts.findIndex(
                                (post) => post.id === postChange.repostID
                              );

                            if (existingPostIndex === -1) {
                              this.repostedPosts.push(prevPost);
                            }
                          } else {
                            const deletedPostIndex =
                              this.repostedPosts.findIndex(
                                (post) => post.id === postChange.repostID
                              );

                            if (deletedPostIndex !== -1) {
                              this.repostedPosts[
                                deletedPostIndex
                              ].deleted = true;
                            } else {
                              this.repostedPosts.push({
                                deleted: true,
                                id: postChange.repostID,
                              });
                            }
                          }
                        }
                      );
                    }

                    if (postChange.creatorId === this.creatorID) {
                      const joinedArray = this.myPosts.join(" ");
                      const array = joinedArray.split(" ");
                      const filteredArray = array.filter(
                        (item) => item === postChange.id
                      );

                      const usernameRef = dbRef(
                        database,
                        "users/" + postChange.creatorId
                      );
                      onValue(usernameRef, async (snapshot) => {
                        if (snapshot.val() !== null) {
                          const data = snapshot.val();
                          for (const postId of filteredArray) {
                            const replaceInfo = doc(db, "posts", postId);
                            let newInfo;

                            if (data.verified === undefined) {
                              this.userVerified = false;
                              this.currUsername = data.username;
                              this.currName = data.displayName;

                              if (this.creatorID === myID && this.postID) {
                                newInfo = {
                                  creatorUsername: data.username,
                                  creatorDisplayname: data.displayName,
                                  isUserVerified: false,
                                  creatorImage: data.image,
                                  isHidden: false,
                                };
                              } else {
                                newInfo = {
                                  isUserVerified: this.userVerified,
                                };
                              }
                            } else {
                              this.userVerified = data.verified;
                              this.currUsername = data.username;
                              this.currName = data.displayName;

                              if (this.creatorID === myID && this.postID) {
                                newInfo = {
                                  creatorUsername: data.username,
                                  creatorDisplayname: data.displayName,
                                  isUserVerified: data.verified,
                                  creatorImage: data.image,
                                  isHidden: false,
                                };
                              } else if (this.creatorID !== myID) {
                                newInfo = {
                                  isHidden: true,
                                };
                              } else {
                                newInfo = {
                                  isUserVerified: this.userVerified,
                                };
                              }
                            }

                            await updateDoc(replaceInfo, newInfo);
                          }
                        } else if (snapshot.val() === null) {
                          this.userVerified = false;
                          this.currUsername = "";
                          this.currName = "Deleted User";
                          this.creatorUsername = "";
                          this.creatorDisplayname = "Deleted User";
                          this.creatorImage = this.defaultImage;
                          this.creatorVerified = false;

                          const replaceInfo = doc(db, "posts/", filteredArray);
                          const newInfo = {
                            creatorUsername: "",
                            creatorDisplayname: "Deleted User",
                            isUserVerified: false,
                            creatorImage: this.defaultImage,
                            content: "(deleted)",
                          };
                          updateDoc(replaceInfo, newInfo);
                        }
                      });
                    }

                    if (change.type === "modified") {
                      let index = this.posts.findIndex(
                        (post) => post.id === postChange.id
                      );
                      Object.assign(this.posts[index], postChange);
                    }
                    if (change.type === "removed") {
                      let index = this.posts.findIndex(
                        (post) => post.id === postChange.id
                      );
                      this.posts.splice(index, 1);
                    }
                  }
                }
              });
            });
          }
        }
      });
    },
    getProfileInfo() {
      const userId = auth.currentUser.uid;

      const userFollowRef = dbRef(database, "users/" + userId);
      onValue(userFollowRef, (snapshot1) => {
        const info = snapshot1.val();
        this.myImage = info.image;
        this.admin = info.admin;
        this.theme = info.theme;
        this.doYouWantNSFW = info.doYouWantNSFW;
        this.currName = info.displayName;

        if (!snapshot1.val().verified === undefined) {
          this.userVerified = snapshot.val().verified;
        } else {
          this.userVerified = false;
        }
      });
    },
  },
  async mounted() {},
});
</script>

<style lang="scss">
.new-post {
  textarea {
    font-size: 19px;
    line-height: 1.4 !important;
  }
}
.postMenu {
  position: absolute;
  right: 10px;
  top: 0;
}
.showWhenVerified {
  margin-left: 5px;
  margin-top: -2.5px;
}
.hideWhenNotVerified {
  display: none;
}
.hidewhenimage {
  width: 0;
  height: 0;
}
.showwhenimage {
  margin-top: -45px;
}
.clickableLabel {
  cursor: pointer;
}
.avatar {
  width: 30px;
  height: 30px;
  object-fit: cover;
}
.post-icons {
  width: 90%;
  align-items: center;
  padding: 0;
}
.postButtonContainer {
  position: relative;
  display: inline-block;
}

.postLikes {
  color: grey;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.homePostAvatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  overflow: hidden;
  img {
    width: auto;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }
}
.homeRepostAvatar {
  display: flex;
  cursor: pointer;
  object-fit: cover;
  object-position: center center;
  img {
    width: auto;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }
}
.myPostAvatar {
  display: flex;
  object-fit: cover;
  object-position: center center;
  img {
    width: auto;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }
}

.homePostContent {
  white-space: pre-line;
}
.hiding {
  display: none;
}
.dividerDark {
  border-top: 1px solid;
  border-bottom: 1px solid;
  color: $primary;
}
.dividerLight {
  border-top: 1px solid;
  border-bottom: 1px solid;
  color: $secondary;
}
.showwhenimagebtn {
  position: relative;
  z-index: 1;
  margin-top: -120px;
  margin-left: -10px;
}

.hidewhenimagebtn {
  display: none;
}
.imagePreview {
  max-width: 150px;
  max-height: 150px;
  margin-left: 75px;
  margin-bottom: 15px;
  margin-top: 10px;
}
.postImage {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 300px;
  margin-bottom: 15px;
  padding-right: 35px;
  margin-top: 10px;
  display: flex;
}

img[src=""] {
  display: none;
}

.hashtag {
  color: rgb(255, 95, 95);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.isNSFW {
  color: $grey-8;
  position: absolute;
  top: 7px;
  right: 50px;
  padding: 4px;
}

.blur {
  filter: blur(15px);
}
</style>
