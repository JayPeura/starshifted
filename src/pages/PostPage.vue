<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <q-item class="q-py-md">
        <q-item-section avatar top>
          <label for="actual-btn" class="clickableLabel">
            <q-avatar size="xl">
              <img
                v-bind:src="posterImage"
                class="avatar"
                for="actual-btn"
              /> </q-avatar
          ></label>

          <button id="actual-btn" @click="handleRedirect" hidden></button>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-subtitle1"
            ><strong @click="handleRedirect" class="clickableLabel">{{
              posterName
            }}</strong>
            <q-icon
              :name="posterVerified ? 'verified' : ''"
              :class="
                posterVerified ? 'showWhenVerified' : 'hideWhenNotVerified'
              "
            />
            <span class="text-grey-7">
              @{{ posterUsername }}
              &bull;
              <br class="lt-md" />
            </span>
            <span class="text-grey-7">
              {{ formatDistance(posterDate, new Date()) }}</span
            >
          </q-item-label>
          <q-item-label class="post-content text-body1">
            {{ posterContent }}
            <img :src="postImage" class="postImage" />
          </q-item-label>

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
              @click="togglePostLiked"
              :color="postLiked ? 'red' : 'grey'"
              :icon="postLiked ? 'favorite' : 'favorite_border'"
              size="sm"
            >
              <span class="postLikes">
                {{ postLikes }}
              </span></q-btn
            >

            <q-btn flat round color="grey" icon="share" size="sm" />
            <q-btn
              @click="deletePost"
              :class="myID === creatorID ? '' : 'hidden'"
              flat
              round
              color="grey"
              icon="delete"
              size="sm"
            />
          </div>
        </q-item-section>
      </q-item>
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
              <q-avatar size="xl">
                <img v-bind:src="myImage" class="avatar" />
              </q-avatar>
            </template>
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
            :disable="!newStarshiftingPost"
          />
        </div>
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
              <q-avatar size="xl">
                <img v-bind:src="comment.creatorImage" class="avatar" />
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
              </q-item-label>
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
                  :color="comment.liked ? 'red' : 'grey'"
                  :icon="comment.liked ? 'favorite' : 'favorite_border'"
                  size="sm"
                >
                  <span class="postLikes">
                    {{ comment.likes }}
                  </span></q-btn
                >
                <q-btn flat round color="grey" icon="share" size="sm" />
                <q-btn
                  @click="deletePost(comment)"
                  :class="myID === creatorID ? '' : 'hidden'"
                  flat
                  round
                  color="grey"
                  icon="delete"
                  size="sm"
                />
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
import db, { auth, storage } from "src/boot/firebase";
import { ref as dbRef, get, getDatabase, child } from "firebase/database";
import { defineComponent, toRaw } from "vue";
import { formatDistance } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref as stRef } from "firebase/storage";

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

      formatDistance,
      comments: [],
      postImage: "",
      myComments: [],
      posts: [],
      userVerified: false,
      postLikes: 0,
      creatorID: "",
      likerID: "",
      whoLiked: [],
      postID: window.location.href.split("post/")[1],
      commentID: "",
      posterName: "",
      posterUsername: "",
      posterImage: "",
      posterContent: "",
      posterVerified: false,
      postLiked: false,
      commentLiked: false,
      posterDate: 0,
      postIcon: "favorite_border",
      postIconColor: "grey",
      myID: auth.currentUser.uid,
      isHidden: false,
    };
  },
  methods: {
    addNewPost() {
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
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        commentImg: this.creatorImage,
        likes: 0,
      };
      // this.posts.unshift(newPost);
      if ((this.postID = window.location.href.split("post/")[1])) {
        addDoc(collection(db, `posts/${this.postID}/comments`), newPost);
        this.newStarshiftingPost = "";
      }
    },
    deletePost(comment) {
      if (auth.currentUser.uid === comment.creatorId) {
        deleteDoc(doc(db, `posts/${this.postID}/comments`, comment.id));
      } else {
        return;
      }
    },
    toggleLiked(comment) {
      const creatorID = auth.currentUser.uid;

      if (comment.likerID) {
        this.likerID = toRaw(comment.likerID.find((id) => id === creatorID));
      }

      //check if likes are NaN and fix it
      if (isNaN(comment.likes)) {
        updateDoc(doc(db, `posts/${this.postID}/comments`, comment.id), {
          likes: 0,
        });
      }

      if (!this.likerID && !comment.likerID?.find((id) => id == creatorID)) {
        this.likerID = creatorID;
      }

      if (
        !comment.whoLiked[creatorID] &&
        comment.liked === false &&
        this.likerID === creatorID
      ) {
        this.isLiked = true;
        const updateData = {
          likes: comment.likes + 1,
          [`whoLiked.${creatorID}`]: !comment.liked,
          likerID: arrayUnion(creatorID),
          liked: !comment.liked,
        };
        updateDoc(
          doc(db, `posts/${this.postID}/comments`, comment.id),
          updateData
        );
      } else {
        this.isLiked = false;

        const updateData = {
          likes: Math.max(0, comment.likes - 1),
          [`whoLiked.${creatorID}`]: !comment.liked,
          likerID: arrayRemove(creatorID),
          liked: !comment.liked,
        };
        updateDoc(
          doc(db, `posts/${this.postID}/comments`, comment.id),
          updateData
        );
        this.likerID = "";
      }
    },
    async togglePostLiked() {
      const creatorID = auth.currentUser.uid;
      const certainPost = doc(db, "posts", this.postID);
      const poster = await getDoc(certainPost);
      if (poster.exists()) {
        const post = poster.data();
        //check if likes are NaN and fix it
        if (isNaN(post.likes)) {
          updateDoc(doc(db, "posts", this.postID), { likes: 0 });
        }

        if (!this.likerID && !post.likerID[creatorID]) {
          updateDoc(doc(db, "posts/", this.postID), {
            likerID: creatorID,
          });
          this.likerID = creatorID;
        }

        if (
          !post.whoLiked[creatorID] &&
          !post.liked &&
          this.likerID === creatorID
        ) {
          this.postLiked = true;
          this.postLikes = post.likes;

          const updateData = {
            likes: post.likes + 1,
            [`whoLiked.${creatorID}`]: !post.liked,
            likerID: arrayUnion(creatorID),
            liked: !post.liked,
          };
          updateDoc(doc(db, "posts/", this.postID), updateData);
          const getPost = doc(db, "posts", this.postID);
          const posting = await getDoc(getPost);
          if (posting.exists()) {
            const post = posting.data();
            this.postLikes = post.likes;
          }
        } else {
          this.postLiked = false;

          const updateData = {
            likes: Math.max(0, post.likes - 1),
            [`whoLiked.${creatorID}`]: !post.liked,
            likerID: arrayRemove(creatorID),
            liked: !post.liked,
          };
          updateDoc(doc(db, "posts/", this.postID), updateData);

          this.likerID = "";
          const getPost = doc(db, "posts", this.postID);
          const posting = await getDoc(getPost);
          if (posting.exists()) {
            const post = posting.data();
            this.postLikes = post.likes;
          }
        }
      }
    },
    async getPostLiked() {
      const creatorID = auth.currentUser.uid;
      const certainPost = doc(db, "posts", this.postID);
      const poster = await getDoc(certainPost);

      if (poster.exists()) {
        const post = poster.data();
        this.postLikes = post.likes;
        this.whoLiked = post.whoLiked;
        this.postLiked = post.liked;
        this.likerID = post.likerID;

        if (
          post.whoLiked[creatorID] &&
          post.likerID?.find((id) => id === creatorID)
        ) {
          this.likerID = post.likerID;
          this.postLiked = true;
          const updateData = {
            likerID: arrayUnion(creatorID),
            [`whoLiked.${creatorID}`]: this.postLiked,
            liked: this.postLiked,
            likes: this.postLikes,
          };
          updateDoc(doc(db, "posts/", this.postID), updateData);
        } else {
          this.likerID = creatorID;
          this.postLiked = false;
          const updateData = {
            likerID: arrayRemove(creatorID),
            [`whoLiked.${creatorID}`]: this.postLiked,
            liked: this.postLiked,
            likes: this.postLikes,
          };
          updateDoc(doc(db, "posts/", this.postID), updateData);
        }
      }
    },
    async getLiked() {
      const creatorID = auth.currentUser.uid;

      const newQuerySnapshot = await getDocs(
        collection(db, `posts/${this.postID}/comments`)
      );
      newQuerySnapshot.forEach((post) => {
        const postData = post.data();
        this.commentID = post.id;
        if (
          postData.whoLiked[creatorID] &&
          postData.likerID?.find((id) => id === creatorID)
        ) {
          this.likerID = postData.likerID;
          this.commentLiked = true;
          const updateData = {
            likerID: arrayUnion(creatorID),
            [`whoLiked.${creatorID}`]: this.commentLiked,
            liked: this.commentLiked,
            likes: postData.likes,
          };
          updateDoc(
            doc(db, `posts/${this.postID}/comments`, this.commentID),
            updateData
          );
        } else {
          this.likerID = creatorID;
          this.commentLiked = false;
          const updateData = {
            likerID: arrayRemove(creatorID),
            [`whoLiked.${creatorID}`]: this.commentLiked,
            liked: this.commentLiked,
            likes: postData.likes,
          };
          updateDoc(
            doc(db, `posts/${this.postID}/comments`, this.commentID),
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

    const certainPost = doc(db, "posts", this.postID);
    const poster = await getDoc(certainPost);

    if (poster.exists()) {
      const post = poster.data();
      this.posterName = post.creatorDisplayname;
      this.posterUsername = post.creatorUsername;
      this.posterImage = post.creatorImage;
      this.posterContent = post.content;
      this.posterVerified = post.isUserVerified;
      this.postImage = post.postImg;
      this.postLikes = post.likes;
      this.whoLiked = post.whoLiked;
      this.postLiked = post.liked;
      this.likerID = post.likerID;
    }
    const q = query(
      collection(db, `posts/${this.postID}/comments`),
      orderBy("date")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
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

          await this.myComments.unshift(commentChange.id);
          this.comments.unshift(commentChange);
          if (commentChange.creatorId === this.creatorID) {
            const joinedArray = this.myComments.join(" ");
            const array = joinedArray.split(" ");
            const filteredArray = array.find(
              (item) => item === commentChange.id
            );

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
      });
    });
    this.getLiked();
    this.getPostLiked();
    const docRef = doc(db, "posts", this.postID);
    const docSnap = await getDoc(docRef);

    const docSnapData = docSnap.data();
    if (docSnapData) {
      this.posterContent = docSnapData.content;
      this.posterUsername = docSnapData.creatorUsername;
      this.posterName = docSnapData.creatorDisplayname;
      this.posterImage = docSnapData.creatorImage;
      this.posterDate = docSnapData.date;
      this.postLiked = docSnapData.liked;
      this.posterVerified = docSnapData.isUserVerified;
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
.clickableLabel {
  cursor: pointer;
}
.avatar {
  object-fit: cover;
}
.post-icons {
  width: 80%;
  align-items: center;
  .postLikes {
    display: flex;
    font-size: 16px;
    color: grey;
    margin-left: 10px;
  }
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
  width: 200px;
  height: 200px;
  margin-bottom: 15px;
  margin-top: 10px;
  display: flex;
}
img[src=""] {
  display: none;
}
</style>
