<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div v-if="!postDeleted">
        <q-item v-for="post in posts" :key="post.id" class="q-py-md">
          <q-item-section avatar top>
            <label for="actual-btn" class="clickableLabel">
              <q-avatar round size="xl">
                <q-img
                  v-bind:src="post.creatorImage"
                  for="actual-btn"
                  class="postavatar"
                /> </q-avatar
            ></label>

            <button id="actual-btn" @click="handleRedirect" hidden></button>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1"
              ><strong @click="handleRedirect" class="clickableLabel">{{
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
              <span class="text-grey-7">
                @{{ post.creatorUsername }}
                &bull;
                <br class="lt-md" />
              </span>
              <span class="text-grey-7">
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
                    <q-item
                      v-if="post.creatorId !== myID"
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
                      ></q-item
                    >
                    <q-item
                      clickable
                      v-if="post.creatorId === myID"
                      @click="confirm(post)"
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
      </div>
      <div v-else>
        <h4 style="width: 100%; text-align: center">Post deleted</h4>
      </div>
      <q-separator
        size="10px"
        :color="$q.dark.isActive ? 'grey-10' : 'grey-4'"
        class="divider"
      />
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <p class="replyingTo">Replying to @{{ this.posterUsername }}</p>

          <q-input
            bottom-slots
            v-model="newStarshiftingPost"
            placeholder="Comment"
            autogrow
            counter
            maxlength="280"
            class="new-post"
          >
            <template v-slot:before>
              <q-avatar round size="xl">
                <q-img v-bind:src="myImage" class="postavatar" />
              </q-avatar>
            </template>
          </q-input>
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
            accept=".jpg, .png, .gif, .jpeg, .svg"
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
            :disable="(!newStarshiftingPost && !image) || postDeleted"
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
        size="0.1px"
        :color="$q.dark.isActive ? 'grey-10' : 'grey-4'"
        class="divider"
      />

      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            v-for="comment in comments"
            :key="comment.id"
            clickable
            class="q-py-md"
          >
            <q-item-section avatar top>
              <q-avatar round size="xl">
                <q-img v-bind:src="comment.creatorImage" class="postavatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1"
                ><strong>{{ comment.creatorDisplayname }}</strong>
                <q-icon
                  :name="comment.isUserVerified ? 'bi-moon-stars-fill' : ''"
                  :class="
                    comment.isUserVerified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
                />
                <span class="text-grey-7">
                  @{{ comment.creatorUsername }} &bull; <br class="lt-md" />
                  {{
                    comment.date > Date.now() - 35 * 60 * 60 * 1000
                      ? formatDistanceStrict(comment.date, new Date())
                      : format(comment.date, "d MMM")
                  }}
                </span>
              </q-item-label>
              <q-item-label class="post-content text-body1">
                <span v-html="linkifyText(comment)"></span>
                <img :src="comment.postImg" class="postImage" />
              </q-item-label>
              <div class="postMenu row justify-between q-mt-sm">
                <q-btn
                  flat
                  round
                  icon="more_vert"
                  size="13px"
                  @click="getFollowed(comment)"
                >
                  <q-menu auto-close>
                    <q-list style="min-width: 240px">
                      <q-item
                        v-if="comment.creatorId !== myID"
                        clickable
                        @click="followFromComment(comment)"
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
                            comment.creatorUsername
                          }}</q-item-section
                        >
                      </q-item>
                      <q-item
                        v-if="comment.creatorId !== myID"
                        clickable
                        @click="confirmReport(comment)"
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
                        ></q-item
                      >
                      <q-item
                        clickable
                        v-if="comment.creatorId === myID"
                        @click="confirm(comment)"
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
                />
                <q-btn flat round color="grey" icon="cached" size="sm" />
                <q-btn
                  flat
                  round
                  @click="toggleLiked(comment)"
                  :color="checkColor(comment)"
                  :icon="checkIcon(comment)"
                  size="sm"
                >
                  <span class="postLikes">
                    {{
                      comment.whoLiked !== undefined
                        ? new Intl.NumberFormat("en-GB", {
                            notation: "compact",
                          }).format(Object.keys(comment.whoLiked).length)
                        : 0
                    }}
                  </span></q-btn
                >
                <q-btn flat round color="grey" icon="share" size="sm" />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>

        <q-separator
          size="0.1px"
          :color="$q.dark.isActive ? 'grey-10' : 'grey-4'"
          class="divider"
        />
      </q-list>
    </q-scroll-area>
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
  updateDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import db, { auth, storage, database } from "src/boot/firebase";
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  onValue,
} from "firebase/database";
import { defineComponent, ref } from "vue";
import { formatDistanceStrict, format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import { ref as stRef, uploadBytes } from "firebase/storage";
import sanitizeHtml from "sanitize-html";
import { useQuasar } from "quasar";

const imageRef = ref(null);
const imageUrlRef = ref("");

export default defineComponent({
  name: "HomePage",
  data() {
    return {
      newStarshiftingPost: "",
      currName: "",
      currUsername: "",
      creatorUsername: "",
      creatorDisplayname: "",
      creatorImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      defaultImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      formatDistanceStrict,
      format,
      comments: [],
      postImage: "",
      myComments: [],
      posts: [],
      userVerified: false,
      postLikes: 0,
      creatorID: "",
      following: "Follow",
      imageShow: false,
      imageButtonShow: false,
      imageUrl: imageUrlRef,
      image: imageRef,
      postDeleted: false,
      likerID: "",
      whoLiked: [],
      postID: window.location.href.split("post/")[1],
      commentID: "",
      posterUsername: "",
      myID: auth.currentUser.uid,
      isHidden: false,
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

    return { confirmReport };
  },
  methods: {
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
    cancelFileUpload() {
      this.image = null;
      this.imageUrl = "";
      this.imageShow = false;
      this.imageButtonShow = false;
    },
    pickFile() {
      this.$refs.files.pickFiles();
    },
    async onFilePicked(e) {
      this.imageUrl = URL.createObjectURL(this.image);
      this.imageShow = true;
      this.imageButtonShow = true;
    },
    async addNewPost() {
      const creatorID = auth.currentUser.uid;
      const newPost = {
        content: this.newStarshiftingPost,
        date: Date.now(),
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        postImg: this.imageUrl,
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        commentImg: this.creatorImage,
      };
      // this.posts.unshift(newPost);
      if ((this.postID = window.location.href.split("post/")[1])) {
        addDoc(collection(db, `posts/${this.postID}/comments`), newPost);
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

          const uploadTask = await uploadBytes(fileRef, this.image, metadata);
        }
        this.imageShow = false;
        this.imageButtonShow = false;
        this.imageUrl = "";
        this.image = null;
        this.newStarshiftingPost = "";
      }
    },
    deletePost(post) {
      if (auth.currentUser.uid === post.creatorId) {
        deleteDoc(doc(db, `posts/${post.id}`));
        this.postDeleted = true;
      } else {
        return;
      }
    },
    deleteComment(comment) {
      if (auth.currentUser.uid === comment.creatorId) {
        deleteDoc(doc(db, `posts/${this.postID}/comments`, comment.id));
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
    async togglePostLiked(post) {
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
  },
  async mounted() {
    if (this.postID) {
      const postsInUserRef = collection(db, `posts/${this.postID}/comments`);

      const q = query(postsInUserRef, orderBy("createdAt"));

      const postsInUserSnapshot = await getDocs(q);
      const arr = [];
      postsInUserSnapshot.docs.map((d) => {
        arr.push(d.data());
      });
    }
    const unsub = onSnapshot(doc(db, "posts", this.postID), (poster) => {
      if (poster.exists()) {
        let post = poster.data();
        post.id = poster.id;

        this.posts = { post: post };

        if (post.content === "" && post.postImg === undefined) {
          this.postDeleted = true;
        } else {
          this.postDeleted = false;
        }
      } else {
        this.postDeleted = true;
        return;
      }
    });

    const q = query(
      collection(db, `posts/${this.postID}/comments`),
      orderBy("date")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.doc.data() !== undefined) {
          let commentChange = change.doc.data();
          commentChange.id = change.doc.id;
          if (change.type === "added") {
            this.creatorUsername = commentChange.creatorUsername;
            this.creatorDisplayname = commentChange.creatorDisplayname;
            this.creatorID = commentChange.creatorId;
            this.commentID = commentChange.id;
            this.commentLikes = commentChange.likes;
            this.commentLiked = commentChange.isLiked;
            this.commentID = commentChange.id;
            this.userVerified = commentChange.isUserVerified;
            this.myComments.unshift(commentChange.id);
            this.comments.unshift(commentChange);
            if (commentChange.creatorId === this.creatorID) {
              const joinedArray = this.myComments.join(" ");
              const array = joinedArray.split(" ");
              const filteredArray = array.find(
                (item) => item === commentChange.id
              );
              const usernameRef = dbRef(
                database,
                "users/" + commentChange.creatorId
              );
              onValue(usernameRef, (snapshot) => {
                if (snapshot.val() !== null) {
                  const data = snapshot.val();
                  this.userVerified = data.verified;
                  this.currUsername = data.username;
                  this.currName = data.displayName;

                  const replaceInfo = doc(
                    db,
                    "posts/" + this.postID + "/comments",
                    filteredArray
                  );

                  const newInfo = {
                    creatorUsername: data.username,
                    creatorDisplayname: data.displayName,
                    creatorImage: data.image,
                    isUserVerified: this.userVerified,
                  };
                  updateDoc(replaceInfo, newInfo);
                } else if (snapshot.val() === null) {
                  this.creatorUsername = "";
                  this.creatorDisplayname = "Deleted User";
                  this.creatorImage = this.defaultImage;
                  this.creatorVerified = false;

                  const replaceInfo = doc(
                    db,
                    "posts/" + this.postID + "/comments",
                    filteredArray
                  );
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
              const docRef2 = doc(
                db,
                `posts/${this.postID}/comments`,
                filteredArray
              );
              const docSnap2 = await getDoc(docRef2);

              const docSnapData = docSnap2.data();

              if (this.creatorID === auth.currentUser.uid && this.postID) {
                const replaceInfo = doc(
                  db,
                  "posts/" + this.postID + "/comments",
                  filteredArray
                );
                const newInfo = {
                  creatorUsername: this.currUsername,
                  creatorDisplayname: this.currName,
                };
                updateDoc(replaceInfo, newInfo);
              }
            }
          }
          if (change.type === "modified") {
            let index = this.comments.findIndex(
              (comment) => comment.id === commentChange.id
            );
            Object.assign(this.comments[index], commentChange);
          }
          if (change.type === "removed") {
            let index = this.comments.findIndex(
              (comment) => comment.id === commentChange.id
            );
            this.comments.splice(index, 1);
          }
        }
      });
    });

    const docRef = doc(db, "posts", this.postID);
    const docSnap = await getDoc(docRef);

    const docSnapData = docSnap.data();
    if (docSnapData) {
      this.posterUsername = docSnapData.creatorUsername;
    }

    const myID = auth.currentUser.uid;

    const dbReff = dbRef(getDatabase());
    get(child(dbReff, `users/${myID}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.myImage = snapshot.val().image;
          if (snapshot.val().verified === undefined) {
            this.userVerified = false;
          } else {
            this.userVerified = snapshot.val().verified;
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
.postavatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.hidewhenimage {
  width: 0;
  height: 0;
}
.showwhenimage {
  margin-top: -45px;
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
.clickableLabel {
  cursor: pointer;
}
.avatar {
  object-fit: cover;
}
.postMenu {
  position: absolute;
  right: 10px;
  top: 0;
}
.post-icons {
  width: 80%;
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
.showWhenVerified {
  margin-left: 5px;
  margin-top: -2.5px;
}
.hideWhenNotVerified {
  display: none;
}
.post-content {
  white-space: pre-line;
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
  max-width: 450px;
  max-height: 400px;
  margin-bottom: 15px;
  margin-top: 10px;
  display: flex;
}
@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
  .postImage {
    width: 200px;
  }
}
@media screen and (min-width: 1204px) {
  .postImage {
    width: 200px;
  }
}
img[src=""] {
  display: none;
}
</style>
