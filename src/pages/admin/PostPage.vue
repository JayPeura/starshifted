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
                :name="post.isUserVerified ? 'verified' : ''"
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
                {{ formatDistance(post.date, new Date()) }}</span
              >
            </q-item-label>
            <q-item-label class="post-content text-body1">
              {{ post.content }}
              <img :src="post.postImg" class="postImage" />
            </q-item-label>
            <div class="postMenu row justify-between q-mt-sm">
              <q-btn flat round icon="more_horiz" size="13px">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      clickable
                      @click="deletePost(post)"
                      v-if="post.creatorId === myID"
                    >
                      <q-item-section>Delete post</q-item-section>
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
                @click="togglePostLiked(post)"
                :color="post.whoLiked[myID] ? 'red' : 'grey'"
                :icon="post.whoLiked[myID] ? 'favorite' : 'favorite_border'"
                size="sm"
              >
                <span class="postLikes">
                  {{
                    new Intl.NumberFormat("en-GB", {
                      notation: "compact",
                    }).format(post.likes)
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
                <q-img v-bind:src="myImage" />
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
                <q-img v-bind:src="comment.creatorImage" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1"
                ><strong>{{ comment.creatorDisplayname }}</strong>
                <q-icon
                  :name="comment.isUserVerified ? 'verified' : ''"
                  :class="
                    comment.isUserVerified
                      ? 'showWhenVerified'
                      : 'hideWhenNotVerified'
                  "
                />
                <span class="text-grey-7">
                  @{{ comment.creatorUsername }} &bull; <br class="lt-md" />
                  {{ formatDistance(comment.date, new Date()) }}
                </span>
              </q-item-label>
              <q-item-label class="post-content text-body1">
                {{ comment.content }}
                <img :src="comment.postImg" class="postImage" />
              </q-item-label>
              <div class="postMenu row justify-between q-mt-sm">
                <q-btn flat round icon="more_horiz" size="13px">
                  <q-menu>
                    <q-list style="min-width: 100px">
                      <q-item
                        clickable
                        @click="deleteComment(comment)"
                        v-if="comment.creatorId === myID"
                      >
                        <q-item-section>Delete post</q-item-section>
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
                  :color="comment.whoLiked[myID] ? 'red' : 'grey'"
                  :icon="
                    comment.whoLiked[myID] ? 'favorite' : 'favorite_border'
                  "
                  size="sm"
                >
                  <span class="postLikes">
                    {{
                      new Intl.NumberFormat("en-GB", {
                        notation: "compact",
                      }).format(comment.likes)
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
  where,
  arrayUnion,
  arrayRemove,
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
import { defineComponent, ref, toRaw } from "vue";
import { formatDistance } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import {
  getDownloadURL,
  ref as stRef,
  uploadBytesResumable,
  uploadBytes,
} from "firebase/storage";

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
      formatDistance,
      comments: [],
      postImage: "",
      myComments: [],
      posts: [],
      userVerified: false,
      postLikes: 0,
      creatorID: "",
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
  methods: {
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
      let newPost = {
        content: this.newStarshiftingPost,
        date: Date.now(),
        liked: false,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        whoLiked: {
          [`${creatorID}`]: false,
        },
        postImg: this.imageUrl,
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        commentImg: this.creatorImage,
        likes: 0,
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
    toggleLiked(comment) {
      const creatorID = auth.currentUser.uid;

      //check if likes are NaN and fix it
      if (isNaN(comment.likes)) {
        updateDoc(doc(db, `posts/${this.postID}/comments`, comment.id), {
          likes: 0,
        });
      }

      if (!comment.whoLiked[creatorID]) {
        const updateData = {
          likes: comment.likes + 1,
          [`whoLiked.${creatorID}`]: true,
        };
        updateDoc(
          doc(db, `posts/${this.postID}/comments`, comment.id),
          updateData
        );
      } else {
        const updateData = {
          likes: Math.max(0, comment.likes - 1),
          [`whoLiked.${creatorID}`]: false,
        };
        updateDoc(
          doc(db, `posts/${this.postID}/comments`, comment.id),
          updateData
        );
        this.likerID = "";
      }
    },
    togglePostLiked(post) {
      const creatorID = auth.currentUser.uid;
      console.log(post);
      //check if likes are NaN and fix it
      if (isNaN(post.likes)) {
        updateDoc(doc(db, "posts", post.id), { likes: 0 });
      }
      if (!post.whoLiked[creatorID]) {
        const updateData = {
          likes: post.likes + 1,
          [`whoLiked.${creatorID}`]: true,
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
      } else if (post.whoLiked[creatorID]) {
        const updateData = {
          likes: Math.max(0, post.likes - 1),
          [`whoLiked.${creatorID}`]: false,
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
        this.likerID = "";
      }
    },
    async getPostLiked() {
      const creatorID = auth.currentUser.uid;
      const newQuerySnapshot = await getDocs(collection(db, `posts/`));
      newQuerySnapshot.forEach((post) => {
        const postData = post.data();

        if (postData.whoLiked[creatorID]) {
          const updateData = {
            [`whoLiked.${creatorID}`]: true,
            likes: postData.likes,
          };
          updateDoc(doc(db, "posts/", post.id), updateData);
        } else {
          const updateData = {
            [`whoLiked.${creatorID}`]: false,
            likes: postData.likes,
          };
          updateDoc(doc(db, "posts/", post.id), updateData);
        }
      });
    },
    async getLiked() {
      const creatorID = auth.currentUser.uid;
      const newQuerySnapshot = await getDocs(
        collection(db, `posts/${this.postID}/comments`)
      );
      newQuerySnapshot.forEach((post) => {
        const postData = post.data();

        if (postData.whoLiked === undefined) {
          console.log("whoLiked undefined, updating");
          const updateData = {
            [`whoLiked.${creatorID}`]: false,
          };
          updateDoc(
            doc(db, "posts/" + this.postID + "/comments", post.id),
            updateData
          );
        }

        if (isNaN(post.likes)) {
          updateDoc(doc(db, "posts/" + this.postID + "/comments", post.id), {
            likes: 0,
          });
        }
        if (postData.whoLiked[creatorID]) {
          const updateData = {
            [`whoLiked.${creatorID}`]: true,
            likes: postData.likes,
          };
          updateDoc(
            doc(db, "posts/" + this.postID + "/comments", post.id),
            updateData
          );
        } else {
          const updateData = {
            [`whoLiked.${creatorID}`]: false,
            likes: postData.likes,
          };
          updateDoc(
            doc(db, "posts/" + this.postID + "/comments", post.id),
            updateData
          );
        }
      });
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
            this.isVerified = commentChange.isUserVerified;
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
    this.getLiked();
    this.getPostLiked();

    const docRef = doc(db, "posts", this.postID);
    const docSnap = await getDoc(docRef);

    const docSnapData = docSnap.data();
    if (docSnapData) {
      this.posterUsername = docSnapData.creatorUsername;
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = auth.currentUser.uid;
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${userId}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.currUsername = snapshot.val().username;
              this.currName = snapshot.val().displayName;
              this.myImage = snapshot.val().image;
              this.userVerified = snapshot.val().verified;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
        if (this.myID === this.creatorID) {
          this.isHidden = true;
        }
      }
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
