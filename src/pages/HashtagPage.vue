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
      <h4 align="center" style="margin-left: 15px">#{{ trimURL() }}</h4>
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
      <q-list v-if="$route.name === 'Topics'" separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            v-for="post in posts"
            :key="post.id"
            class="q-py-md"
            :style="
              'background-color: ' +
              getThemeColour(theme.value).mild +
              '; color: ' +
              getThemeColour(theme.value).txt
            "
          >
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
                ><strong @click="handleRedirect(post)" class="clickableLabel">{{
                  post.creatorDisplayname
                }}</strong>
                <q-icon
                  :name="post.isUserVerified ? 'bi-moon-stars-fill' : ''"
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
                      ? formatDistanceStrict(post.date, new Date())
                      : format(post.date, "d MMM")
                  }}</span
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
                  @click="
                    imageShower = true;
                    openImage = post.postImg;
                  "
                  :src="post.postImg"
                  class="postImage blur"
                />
                <img
                  v-else
                  @click="
                    imageShower = true;
                    openImage = post.postImg;
                  "
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
                            ? formatDistanceStrict(repost.date, new Date())
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
                          @click="
                            imageShower = true;
                            openImage = repost.postImg;
                          "
                          :src="repost.postImg"
                          class="postImage blur"
                        />
                        <img
                          v-else
                          @click="
                            imageShower = true;
                            openImage = repost.postImg;
                          "
                          :src="repost.postImg"
                          class="postImage"
                        />
                      </q-item-label>
                    </q-item-label>
                  </q-item>
                  <q-item
                    v-if="repost.deleted && repost.id === post.repostID"
                    style="border: 2px solid grey; padding: 15px; color: red"
                    >DELETED POST</q-item
                  >
                </div>
                <q-dialog v-model="imageShower">
                  <q-card>
                    <img :src="openImage" />
                  </q-card>
                </q-dialog>
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
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
          :class="$q.dark.isActive ? 'dividerDark' : 'dividerLight'"
        />
      </q-list>
    </q-scroll-area>
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
  updateDoc,
  deleteField,
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
import sanitizeHtml from "sanitize-html";
import { useQuasar } from "quasar";

const imageRef = ref(null);
const imageUrlRef = ref("");
const likeRef = ref(0);

export default defineComponent({
  name: "HomePage",
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.posts = [];
      vm.myPosts = [];
      vm.getPosts();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.myPosts = [];
    this.posts = [];
    this.getPosts();
    next();
  },
  data() {
    return {
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
      repostPrompt: false,
      repostImageUrl: "",
      repostImage: null,
      imageRepostShow: false,
      repostPost: "",
      isNSFW: false,
      theme: "",
      repostedPosts: [],
      repostID: [],
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
    createHashtags(text) {
      const regex = /#\w+/g;
      const matches = text.match(regex);
      if (matches) {
        return (this.hashtags = [...matches.map((tag) => tag.substring(1))]);
      } else {
        return [];
      }
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
    trimURL() {
      const lastWord = window.location.href.split("topic/")[1];
      return lastWord;
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
    handleRedirect(post) {
      this.$router.push("/profile/" + post.creatorUsername);
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

      if (post.whoLiked === undefined) {
        const updateData = {
          [`whoLiked.${creatorID}`]: { dateLiked: Date.now() },
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
      } else if (!post.whoLiked[creatorID]) {
        const updateData = {
          [`whoLiked.${creatorID}`]: { dateLiked: Date.now() },
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
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
    getPosts() {
      const myID = auth.currentUser.uid;

      const postQ = query(
        collection(db, "posts"),
        where("hashtags", "array-contains", this.trimURL()),
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
              this.creatorID = postChange.creatorId;
              this.myPosts.unshift(postChange.id);
              this.posts.unshift(postChange);
              if (postChange.repostID !== undefined) {
                const newSub = onSnapshot(
                  doc(db, "posts", postChange.repostID),
                  (prevPoster) => {
                    if (prevPoster.exists()) {
                      let prevPost = prevPoster.data();
                      prevPost.id = prevPoster.id;

                      const existingPostIndex = this.repostedPosts.findIndex(
                        (post) => post.id === postChange.repostID
                      );

                      if (existingPostIndex === -1) {
                        this.repostedPosts.push(prevPost);
                      }
                    } else {
                      const deletedPostIndex = this.repostedPosts.findIndex(
                        (post) => post.id === postChange.repostID
                      );

                      if (deletedPostIndex !== -1) {
                        this.repostedPosts[deletedPostIndex].deleted = true;
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
                const filteredArray = array.find(
                  (item) => item === postChange.id
                );

                const usernameRef = dbRef(
                  database,
                  "users/" + postChange.creatorId
                );
                onValue(usernameRef, (snapshot) => {
                  if (snapshot.val() !== null) {
                    const data = snapshot.val();
                    if (data.verified === undefined) {
                      this.userVerified = false;
                      this.currUsername = data.username;
                      this.currName = data.displayName;
                      if (this.creatorID === myID && this.postID) {
                        const replaceInfo = doc(db, "posts/", filteredArray);
                        const newInfo = {
                          creatorUsername: data.username,
                          creatorDisplayname: data.displayName,
                          isUserVerified: false,
                          creatorImage: data.image,
                          isHidden: false,
                        };
                        updateDoc(replaceInfo, newInfo);
                      }
                      const replaceInfo = doc(db, "posts/", filteredArray);
                      const newInfo = {
                        isUserVerified: this.userVerified,
                      };
                      updateDoc(replaceInfo, newInfo);
                    } else {
                      this.userVerified = data.verified;
                      this.currUsername = data.username;
                      this.currName = data.displayName;

                      if (this.creatorID === myID && this.postID) {
                        const replaceInfo = doc(db, "posts/", filteredArray);
                        const newInfo = {
                          creatorUsername: data.username,
                          creatorDisplayname: data.displayName,
                          isUserVerified: data.verified,
                          creatorImage: data.image,
                          isHidden: false,
                        };
                        updateDoc(replaceInfo, newInfo);
                      } else if (!this.creatorID === myID) {
                        const replaceInfo = doc(db, "posts/", filteredArray);
                        const newInfo = {
                          isHidden: true,
                        };
                        updateDoc(replaceInfo, newInfo);
                      }
                      const replaceInfo = doc(db, "posts/", filteredArray);
                      const newInfo = {
                        isUserVerified: this.userVerified,
                      };
                      updateDoc(replaceInfo, newInfo);
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
    },
  },
  async mounted() {
    const myID = auth.currentUser.uid;

    const dbReff = dbRef(getDatabase());
    get(child(dbReff, `users/${myID}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.myImage = snapshot.val().image;
          this.admin = snapshot.val().admin;
          this.theme = snapshot.val().theme;
          if (!snapshot.val().verified === undefined) {
            this.userVerified = snapshot.val().verified;
          } else {
            this.userVerified = false;
          }
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
  width: 80%;
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
  object-fit: cover;
}
.myPostAvatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  object-fit: cover;
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
</style>
