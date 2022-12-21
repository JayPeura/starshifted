<template>
  <q-page>
    <q-scroll-area :visible="false" class="absolute full-width full-height">
      <div class="flexy">
        <div class="image-upload">
          <label for="actual-btn">
            <q-img
              :key="$route.fullPath"
              :src="image"
              alt="avatar"
              :class="isYourProfile ? 'avatar' : 'notYourAvatar'"
              for="actual-btn"
          /></label>

          <input
            type="file"
            ref="fileInput"
            :id="isYourProfile ? 'actual-btn' : ''"
            @change="onFilePicked"
            accept=".jpg, .png, .jpeg"
            hidden
          />
        </div>

        <h5 class="names">
          <strong>{{ profileName }}</strong>
          <q-icon
            :name="isUserVerified ? 'bi-moon-stars-fill' : ''"
            :class="isUserVerified ? 'showWhenVerified' : 'hideWhenNotVerified'"
          />
          {{ " " }}
          <span class="username">@{{ currUsername }}</span>
        </h5>
      </div>
      <q-item-section>
        <q-item-label class="rounded-borders bio-content text-body1">
          <span>{{ bio }}</span>
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>
          <span style="margin-right: 25px; margin-left: 20px"
            >{{ followingCount }}
            <span style="margin-left: 5px; color: grey">Following</span></span
          >

          <span
            >{{ followerCount }}
            <span style="margin-left: 5px; color: grey">Followers</span></span
          >
        </q-item-label>
      </q-item-section>
      <div :class="isYourProfile ? 'showIfYours' : 'hideIfNotYours'">
        <q-btn
          label="Edit profile"
          :class="$q.dark.isActive ? 'editProfileDark' : 'editProfileLight'"
          @click="prompt = true"
        />

        <q-dialog v-model="prompt" persistent>
          <q-card style="min-width: 350px; min-height: 300px">
            <q-card-section>
              <div class="text-h6">Edit profile</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input
                square
                outlined
                v-model="newName"
                placeholder="Display name"
                autofocus
              />
              <br />
              <q-input
                square
                outlined
                placeholder="Bio"
                v-model="newBio"
                counter
                maxlength="160"
                autofocus
              />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn
                flat
                label="Cancel"
                v-close-popup
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
              />
              <q-btn
                flat
                label="Done"
                @click="editProfile"
                v-close-popup
                :color="$q.dark.isActive ? 'secondary' : 'primary'"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
      <div :class="!isYourProfile ? 'showIfNotYours' : 'hideIfYours'">
        <q-btn
          label="Message"
          :class="$q.dark.isActive ? 'messageDark' : 'messageLight'"
          @click="handleRedirect"
        />
        <q-btn
          :label="checkFollowed()"
          :class="$q.dark.isActive ? 'editProfileDark' : 'editProfileLight'"
          @click="toggleFollow"
        />
      </div>

      <q-separator class="q-mt-xl q-mb-sm q-py-xs" color="grey-10" />

      <q-card>
        <q-tabs
          v-model="tab"
          dense
          :class="
            $q.dark.isActive ? 'bg-primary text-grey' : 'text-grey bg-grey-4'
          "
          :active-color="$q.dark.isActive ? 'secondary' : 'primary'"
          :active-bg-color="$q.dark.isActive ? 'grey-10' : 'secondary'"
          :indicator-color="$q.dark.isActive ? 'secondary' : 'primary'"
          align="justify"
          narrow-indicator
        >
          <q-tab name="posts" label="Posts" />
          <q-tab name="likedPosts" label="Liked Posts" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel
            name="posts"
            :class="$q.dark.isActive ? 'bg-primary' : 'bg-secondary'"
          >
            <q-list separator>
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
                          class="postavatar"
                        /> </q-avatar
                    ></label>

                    <button id="actual-btn" hidden></button>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="text-subtitle1"
                      style="overflow: hidden"
                      ><strong
                        @click="handleRedirect(post)"
                        class="clickableLabel"
                        >{{ post.creatorDisplayname }}</strong
                      >
                      <q-icon
                        :name="post.isUserVerified ? 'bi-moon-stars-fill' : ''"
                        :class="
                          post.isUserVerified
                            ? 'showWhenVerified'
                            : 'hideWhenNotVerified'
                        "
                      />
                      <span class="text-grey-7 usernameStyle">
                        @{{ post.creatorUsername }}
                        &bull;
                      </span>
                      <span
                        class="text-grey-7"
                        style="position: relative; padding-right: 50px"
                      >
                        {{
                          post.date > Date.now() - 35 * 60 * 60 * 1000
                            ? formatDistanceStrict(post.date, new Date())
                            : format(post.date, "d MMM")
                        }}</span
                      >
                    </q-item-label>
                    <q-item-label class="post-content text-body1">
                      <span v-html="linkifyText(post)"></span>
                      <img :src="post.postImg" class="postImage" />
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
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
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
                            <q-item clickable @click="confirm(post)">
                              <q-item-section avatar>
                                <q-icon
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
                                  name="delete"
                                  class="text-red"
                                  size="sm"
                              /></q-item-section>
                              <q-item-section class="text-red"
                                >Delete post</q-item-section
                              >
                            </q-item>
                            <q-separator
                              v-if="post.creatorId !== myID"
                              color="grey-9"
                            />
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                    <div
                      class="post-icons row justify-between q-mt-sm"
                      style="width: 80%"
                    >
                      <q-btn
                        flat
                        round
                        color="grey"
                        icon="chat_bubble_outline"
                        size="sm"
                        :to="'/admin/post/' + post.id"
                      />
                      <q-btn flat round color="grey" icon="cached" size="sm" />
                      <q-btn
                        flat
                        round
                        @click="toggleLiked(post)"
                        :color="checkColor(post)"
                        :icon="checkIcon(post)"
                        size="sm"
                      >
                        <span class="postLikes">
                          {{
                            post.whoLiked !== undefined
                              ? new Intl.NumberFormat("en-GB", {
                                  notation: "compact",
                                }).format(Object.keys(post.whoLiked).length)
                              : 0
                          }}
                        </span></q-btn
                      >

                      <q-btn flat round color="grey" icon="share" size="sm" />
                    </div>
                  </q-item-section>
                </q-item>
              </transition-group> </q-list
          ></q-tab-panel>

          <q-tab-panel
            name="likedPosts"
            :class="$q.dark.isActive ? 'bg-primary' : 'bg-secondary'"
          >
            <q-list separator>
              <transition-group
                appear
                enter-active-class="animated fadeIn slow"
                leave-active-class="animated fadeOut slow"
              >
                <q-item
                  v-for="post in likedPosts"
                  :key="post.id"
                  class="q-py-md"
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
                          class="postavatar"
                        /> </q-avatar
                    ></label>

                    <button id="actual-btn" hidden></button>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="text-subtitle1"
                      style="overflow: hidden"
                      ><strong
                        @click="handleRedirect(post)"
                        class="clickableLabel"
                        >{{ post.creatorDisplayname }}</strong
                      >
                      <q-icon
                        :name="post.isUserVerified ? 'bi-moon-stars-fill' : ''"
                        :class="
                          post.isUserVerified
                            ? 'showWhenVerified'
                            : 'hideWhenNotVerified'
                        "
                      />
                      <span class="text-grey-7 usernameStyle">
                        @{{ post.creatorUsername }}
                        &bull;
                      </span>
                      <span
                        class="text-grey-7"
                        style="position: relative; padding-right: 50px"
                      >
                        {{
                          post.date > Date.now() - 35 * 60 * 60 * 1000
                            ? formatDistanceStrict(post.date, new Date())
                            : format(post.date, "d MMM")
                        }}</span
                      >
                    </q-item-label>
                    <q-item-label class="post-content text-body1">
                      <span v-html="linkifyText(post)"></span>
                      <img :src="post.postImg" class="postImage" />
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
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
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
                            <q-item
                              v-if="post.creatorId !== myID"
                              clickable
                              @click="confirmReport(post)"
                            >
                              <q-item-section avatar>
                                <q-icon
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
                                  name="warning"
                                  class="text-red"
                                  size="sm"
                              /></q-item-section>
                              <q-item-section class="text-red"
                                >Report post</q-item-section
                              ></q-item
                            >
                            <q-item
                              clickable
                              v-if="post.creatorId === myID"
                              @click="confirm(post)"
                            >
                              <q-item-section avatar>
                                <q-icon
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
                                  name="delete"
                                  class="text-red"
                                  size="sm"
                              /></q-item-section>
                              <q-item-section class="text-red"
                                >Delete post</q-item-section
                              >
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                    <div
                      class="post-icons row justify-between q-mt-sm"
                      style="width: 80%"
                    >
                      <q-btn
                        flat
                        round
                        color="grey"
                        icon="chat_bubble_outline"
                        size="sm"
                        :to="'/post/' + post.id"
                      />
                      <q-btn flat round color="grey" icon="cached" size="sm" />
                      <q-btn
                        flat
                        round
                        @click="toggleLiked(post)"
                        :color="checkColor(post)"
                        :icon="checkIcon(post)"
                        size="sm"
                      >
                        <span class="postLikes">
                          {{
                            post.whoLiked !== undefined
                              ? new Intl.NumberFormat("en-GB", {
                                  notation: "compact",
                                }).format(Object.keys(post.whoLiked).length)
                              : 0
                          }}
                        </span></q-btn
                      >

                      <q-btn flat round color="grey" icon="share" size="sm" />
                    </div>
                  </q-item-section>
                </q-item>
              </transition-group> </q-list
          ></q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent, ref, nextTick, toRaw } from "vue";
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  onValue,
  update,
  query,
  equalTo,
  remove,
  orderByChild,
} from "firebase/database";
import {
  getDocs,
  query as fsQuery,
  getDoc,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
  limit,
  where,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import db, { auth, database, storage } from "../boot/firebase";
import { getDownloadURL, ref as stRef, uploadBytes } from "firebase/storage";
import { formatDistanceStrict, formatDistance, format } from "date-fns";
import sanitizeHtml from "sanitize-html";
import { useQuasar } from "quasar";

const inputRef = ref(null);
const fileInput = ref(null);
const prompt = ref(false);

export default defineComponent({
  name: "ProfilePage",
  data() {
    return {
      profileName: "",
      currUsername: "",
      newName: "",
      bio: "",
      newBio: "",
      tab: ref("posts"),
      image:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      userID: "",
      formatDistance,
      formatDistanceStrict,
      format,
      myID: auth.currentUser.uid,
      theirID: "",
      isUserVerified: false,
      imageURL: "",
      prompt: prompt,
      merged: [],
      isYourProfile: false,
      followed: false,
      followingCount: 0,
      followerCount: 0,
      componentKey: 0,
      following: "Follow",
      followerID: "",
      theyFollowed: false,
      receiverList: false,
      chatIDList: [],
      posts: [],
      likedPosts: [],
      senderList: false,
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

    const confirm = (post) => {
      $q.dialog({
        title: "Delete post",
        message: `Are you sure you want to delete this post?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deletePost(post);
      });
    };
    const deletePost = (post) => {
      if (auth.currentUser.uid === post.creatorId) {
        deleteDoc(doc(db, "posts", post.id));
      } else {
        return;
      }
    };
    return { confirm, deletePost, confirmReport };
  },
  methods: {
    followFromPost(post) {
      const followerID = auth.currentUser.uid;

      const db2 = getDatabase();
      const q = query(
        dbRef(db2, "users"),
        orderByChild("username"),
        equalTo(post.creatorUsername)
      );
      get(q).then((snapshot) => {
        if (snapshot.exists()) {
          const key = Object.keys(snapshot.val())[0];

          this.userID = key;
          const userFollowRef = dbRef(database, "users/" + key);
          onValue(
            userFollowRef,
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
                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: true,
                    });
                  } else if (!info.followers[followerID]) {
                    this.followed = true;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;
                    this.following = "Unfollow";

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: true,
                    });
                  } else {
                    this.followed = false;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;
                    this.following = "Follow";

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: null,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: null,
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
      let vm = this;
      const db2 = getDatabase();
      const q2 = query(
        dbRef(db2, "users"),
        orderByChild("username"),
        equalTo(post.creatorUsername)
      );
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
        return "favorite_border";
      } else if (post.whoLiked[myID]) {
        return "favorite";
      } else if (!post.whoLiked[myID]) {
        return "favorite_border";
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
      return sanitizeHtml(text, {
        allowedTags: ["b", "i", "em", "strong", "a"],
        allowedAttributes: {
          a: ["href"],
        },
        allowedIframeHostnames: ["www.youtube.com"],
      });
    },
    async handleRedirect() {
      const myID = auth.currentUser.uid;

      const IDs = [myID, this.userID];
      const IDs2 = [this.userID, myID];

      const participantList = await getDocs(
        fsQuery(collection(db, "chats"), where("participants", "==", IDs))
      );

      if (!participantList.empty) {
        participantList.forEach(async (receiver) => {
          const pList = receiver.data();
          this.$router.push("/messages/" + pList.id);
        });
      } else {
        const theirList = await getDocs(
          fsQuery(collection(db, "chats"), where("participants", "==", IDs2))
        );
        if (!theirList.empty) {
          theirList.forEach(async (theirs) => {
            const tList = theirs.data();

            this.$router.push("/messages/" + tList.id);
          });
        } else {
          await addDoc(collection(db, "chats"), {
            lastMessage: "",
            theirImage: this.image,
            myImage: this.myImage,
            lastMessageAt: Date.now(),
            participants: [this.userID, myID],
          }).then(async (docRef) => {
            await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
            this.$router.push("/messages/" + docRef.id);
          });
        }
      }
    },
    pickFile() {
      this.$refs.fileInput.click();
    },
    getPosts() {
      const myID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const db2 = getDatabase();
      const q2 = query(
        dbRef(db2, "users"),
        orderByChild("username"),
        equalTo(username)
      );
      get(q2).then((snapshot) => {
        if (snapshot.exists()) {
          const key = Object.keys(snapshot.val())[0];
          const dbReff = dbRef(getDatabase());
          const q = fsQuery(
            collection(db, "posts"),
            where("creatorId", "==", this.userID),
            orderBy("date")
          );
          const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              let postChange = change.doc.data();
              postChange.id = change.doc.id;
              this.postID = postChange.id;
              this.creatorID = postChange.creatorId;

              if (change.type === "added") {
                this.creatorUsername = postChange.creatorUsername;
                this.creatorDisplayname = postChange.creatorDisplayname;
                this.creatorImage = postChange.creatorImage;
                this.creatorVerified = postChange.isUserVerified;
                this.postImage = postChange.postImg;
                this.postLikes = postChange.likes;
                this.postID = postChange.id;
                this.creatorID = postChange.creatorId;
                this.posts.unshift(postChange);
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
            });
          });
        }
      });
    },
    getLikedPosts() {
      const myID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const db2 = getDatabase();
      const q2 = query(
        dbRef(db2, "users"),
        orderByChild("username"),
        equalTo(username)
      );
      get(q2).then((snapshot) => {
        if (snapshot.exists()) {
          const key = Object.keys(snapshot.val())[0];
          const dbReff = dbRef(getDatabase());
          const q = fsQuery(
            collection(db, "posts"),
            orderBy(`whoLiked.${key}.dateLiked`)
          );
          const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              let postChange = change.doc.data();
              postChange.id = change.doc.id;
              this.postID = postChange.id;
              this.creatorID = postChange.creatorId;

              if (change.type === "added") {
                this.creatorUsername = postChange.creatorUsername;
                this.creatorDisplayname = postChange.creatorDisplayname;
                this.creatorImage = postChange.creatorImage;
                this.creatorVerified = postChange.isUserVerified;
                this.postImage = postChange.postImg;
                this.postLikes = postChange.likes;
                this.postID = postChange.id;
                this.creatorID = postChange.creatorId;
                this.likedPosts.unshift(postChange);
              }

              if (change.type === "modified") {
                let index = this.likedPosts.findIndex(
                  (post) => post.id === postChange.id
                );
                Object.assign(this.likedPosts[index], postChange);
              }
              if (change.type === "removed") {
                let index = this.likedPosts.findIndex(
                  (post) => post.id === postChange.id
                );
                this.likedPosts.splice(index, 1);
              }
            });
          });
        }
      });
    },
    checkFollowed() {
      if (!this.followed && !this.theyFollowed) {
        return "Follow";
      } else if (this.followed && !this.theyFollowed) {
        return "Unfollow";
      } else if (this.followed && this.theyFollowed) {
        return "Unfollow";
      } else if (!this.followed && this.theyFollowed) {
        return "Follow back";
      }
    },
    toggleFollow() {
      const followerID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const db2 = getDatabase();
      const q = query(
        dbRef(db2, "users"),
        orderByChild("username"),
        equalTo(username)
      );
      get(q).then((snapshot) => {
        if (snapshot.exists()) {
          const key = Object.keys(snapshot.val())[0];

          this.userID = key;
          const userFollowRef = dbRef(database, "users/" + key);
          onValue(
            userFollowRef,
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

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: true,
                    });
                  } else if (!info.followers[followerID]) {
                    this.followed = true;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: true,
                    });
                  } else {
                    this.followed = false;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: null,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: null,
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
    async getFollows() {
      const followerID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const db2 = getDatabase();
      const q = query(
        dbRef(db2, "users"),
        orderByChild("username"),
        equalTo(username)
      );
      get(q).then((snapshot) => {
        if (snapshot.exists()) {
          const key = Object.keys(snapshot.val())[0];
          this.userID = key;

          const userFollowRef = dbRef(database, "users/" + key);
          onValue(userFollowRef, (snapshot1) => {
            const info = snapshot1.val();
            this.followerCount = snapshot1.child("followers").size;
            this.followingCount = snapshot1.child("following").size;

            const myRef = dbRef(database, "users/" + followerID);
            onValue(
              myRef,
              (snapshot2) => {
                const myInfo = snapshot2.val();
                this.followingCount = snapshot1.child("following").size;
                this.followerCount = snapshot1.child("followers").size;
                this.myImage = myInfo.image;

                if (myInfo.following === undefined) {
                  this.followed = false;
                } else if (info.following === undefined) {
                  this.theyFollowed = false;
                } else if (
                  myInfo.following[key] &&
                  info.following[followerID]
                ) {
                  this.followed = true;
                  this.theyFollowed = true;
                } else if (
                  !myInfo.following[key] &&
                  info.following[followerID]
                ) {
                  this.followed = false;
                  this.theyFollowed = true;
                } else if (
                  myInfo.following[key] &&
                  !info.following[followerID]
                ) {
                  this.followed = true;
                  this.theyFollowed = false;
                }
              },
              {
                onlyOnce: true,
              }
            );
          });
        }
      });
    },
    async onFilePicked(e) {
      const files = e.target.files;
      let filename = files[0].name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file!");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.imageURL = fileReader.result;
      });
      fileReader.readAsDataURL(files[0]);
      this.image = files[0];
      const currentUser = auth.currentUser;
      const metadata = {
        contentType: files[0].type,
      };

      const fileRef = stRef(storage, "images/" + currentUser.uid);

      const snapshot = await uploadBytes(fileRef, files[0], metadata);

      const image = await getDownloadURL(fileRef);
      this.image = image;
      update(dbRef(database, "users/" + currentUser.uid), {
        image: this.image,
      })
        .then(() => {
          // Data saved successfully!
          this.$router.go();
        })
        .catch((error) => {
          // The write failed...
          alert(error);
        });
    },
    editProfile() {
      const user = auth.currentUser;
      if (!this.newName && this.newBio) {
        update(dbRef(database, "users/" + user.uid), {
          bio: this.newBio,
        })
          .then(() => {
            // Data saved successfully!
            this.bio = this.newBio;
            this.newBio = "";
          })
          .catch((error) => {
            // The write failed...
            alert(error);
          });
      } else if (this.newName && this.newBio) {
        update(dbRef(database, "users/" + user.uid), {
          displayName: this.newName,
          bio: this.newBio,
        })
          .then(() => {
            // Data saved successfully!
            this.profileName = this.newName;
            this.bio = this.newBio;
            this.newBio = "";
            this.newName = "";
          })
          .catch((error) => {
            // The write failed...
            alert(error);
          });
      } else if (this.newName && !this.newBio) {
        update(dbRef(database, "users/" + user.uid), {
          displayName: this.newName,
        })
          .then(() => {
            // Data saved successfully!
            this.profileName = this.newName;
            this.newName = "";
          })
          .catch((error) => {
            // The write failed...
            alert(error);
          });
      } else {
        return;
      }
    },
  },
  async mounted() {
    const userId = auth.currentUser.uid;
    const username = window.location.href.split("profile/")[1];

    const db2 = getDatabase();
    const q = query(
      dbRef(db2, "users"),
      orderByChild("username"),
      equalTo(username)
    );
    get(q).then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        const dbReff = dbRef(getDatabase());
        this.userID = key;

        const userFollowRef = dbRef(database, "users/" + userId);
        onValue(userFollowRef, (snapshot1) => {
          const info = snapshot1.val();
          this.myImage = info.image;
        });
        get(child(dbReff, `users/${key}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.currUsername = snapshot.val().username;
              this.profileName = snapshot.val().displayName;
              this.image = snapshot.val().image;
              if (snapshot.val().verified !== undefined) {
                this.isUserVerified = snapshot.val().verified;
              } else {
                this.isUserVerified = false;
              }
              this.bio = snapshot.val().bio;
              if (snapshot.child("followers").size > 0) {
                this.followerCount = snapshot.child("followers").size;
              } else {
                this.followerCount = 0;
              }
              if (snapshot.child("following").size > 0) {
                this.followingCount = snapshot.child("following").size;
              } else {
                this.followingCount = 0;
              }

              if (key === userId) {
                this.isYourProfile = true;
              }
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });

    this.getPosts();
    this.getLikedPosts();
  },
});
</script>
<style lang="scss">
.postMenu {
  position: absolute;
  right: 10px;
  top: 0;
}

.post-icons {
  align-items: center;
  padding: 0;
  .postLikes {
    display: flex;
    position: absolute;
    font-size: 16px;
    color: grey;
    margin-left: 60px;
  }
}
.post-content {
  white-space: pre-line;
}
.usernameStyle {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 30px;
  overflow: hidden;
}

.postContainers {
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  width: 100%;

  .postsBtn {
    width: 100%;
  }

  .likedPostsBtn {
    width: 100%;
  }
}
.flexy {
  display: flex;
}
.hideWhenNotVerified {
  width: 0;
}
.showWhenVerified {
  width: 20px;
  margin-left: 5px;
  margin-top: -2.5px;
}
.names {
  margin: 40px 0 0 30px;
}
.fields {
  margin-left: 30px;
  font-size: 12px;
}
.showIfNotYours {
  display: block;
}
.hideIfYours {
  display: none;
}
.showIfYours {
  display: block;
}
.hideIfNotYours {
  display: none;
}
.editProfileDark {
  display: flex;
  position: absolute;
  color: $secondary;
  background-color: $grey-10;
  right: 30px;
  top: 35px;
}
.editProfileLight {
  display: flex;
  position: absolute;
  color: $primary;
  background-color: $grey-11;
  right: 30px;
  top: 35px;
}

.messageDark {
  display: flex;
  position: absolute;
  color: $secondary;
  background-color: $grey-10;
  right: 125px;
  top: 35px;
}
.messageLight {
  display: flex;
  position: absolute;
  color: $primary;
  background-color: $grey-11;
  right: 150px;
  top: 35px;
}
.postavatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.avatar {
  margin: 15px;
  margin-left: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.notYourAvatar {
  margin: 15px;
  width: 80px;
  height: 80px;
  margin-left: 20px;
  border-radius: 50%;
  display: flex;
  object-fit: cover;
}
.image-upload {
  width: 80px;
  cursor: pointer;
}
.fileTypesSpan {
  color: rgb(177, 177, 177);
}
.username {
  color: grey;
}
.bio-content {
  white-space: pre-line;
  margin: 30px;
  margin-top: 0;
}
@media screen and (min-width: 1000px) and (max-width: 1170px) {
  .messageDark {
    display: flex;
    position: absolute;
    color: $secondary;
    background-color: $grey-10;
    right: 10px;
    top: 45px;
  }
  .messageLight {
    display: flex;
    position: absolute;
    color: $primary;
    background-color: $grey-11;
    right: 10px;
    top: 45px;
  }
  .editProfileDark {
    display: flex;
    position: absolute;
    color: $secondary;
    background-color: $grey-10;
    right: 10px;
    top: 5px;
  }
  .editProfileLight {
    display: flex;
    position: absolute;
    color: $primary;
    background-color: $grey-11;
    right: 15px;
    top: 5px;
  }
}

@media screen and (min-width: 280px) and (max-width: 530px) {
  .messageDark {
    display: flex;
    position: absolute;
    color: $secondary;
    background-color: $grey-10;
    right: 10px;
    top: 45px;
  }
  .messageLight {
    display: flex;
    position: absolute;
    color: $primary;
    background-color: $grey-11;
    right: 10px;
    top: 45px;
  }
  .editProfileDark {
    display: flex;
    position: absolute;
    color: $secondary;
    background-color: $grey-10;
    right: 10px;
    top: 5px;
  }
  .editProfileLight {
    display: flex;
    position: absolute;
    color: $primary;
    background-color: $grey-11;
    right: 15px;
    top: 5px;
  }

  .names {
    margin: 35px 0 0 25px;
    font-size: 18px;
  }

  .avatar {
    margin: 15px;
    margin-left: 20px;
    width: 70px;
    height: 70px;
    display: flex;
    cursor: pointer;
    object-fit: cover;
  }
  .notYourAvatar {
    margin: 15px;
    width: 70px;
    height: 70px;
    margin-left: 20px;
    display: flex;
    object-fit: cover;
  }
}
</style>
