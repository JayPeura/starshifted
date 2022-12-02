<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-sm">
        <div class="col">
          <q-input
            bottom-slots
            v-model="newStarshiftingPost"
            placeholder="What's going on?"
            autogrow
            borderless
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
      </div>
      <q-separator
        size="15px"
        :color="$q.dark.isActive ? 'grey-10' : 'grey-4'"
        :class="$q.dark.isActive ? 'dividerDark' : 'dividerLight'"
      />
      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item v-for="post in posts" :key="post.id" class="q-py-md">
            <q-item-section avatar top>
              <label for="actual-btn" class="clickableLabel">
                <q-avatar size="xl">
                  <img
                    v-bind:src="post.creatorImage"
                    class="avatar"
                    for="actual-btn"
                  /> </q-avatar
              ></label>

              <button
                id="actual-btn"
                @click="handleRedirect(post)"
                hidden
              ></button>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1"
                ><strong @click="handleRedirect(post)" class="clickableLabel">{{
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

              <div class="post-icons row justify-between q-mt-sm">
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
                  :color="post.liked ? 'red' : 'grey'"
                  :icon="post.liked ? 'favorite' : 'favorite_border'"
                  size="sm"
                >
                  <span class="postLikes">
                    {{ post.likes }}
                  </span></q-btn
                >

                <q-btn flat round color="grey" icon="share" size="sm" />
                <q-btn
                  @click="deletePost(post)"
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
          size="1px"
          :color="$q.dark.isActive ? 'grey-9' : 'grey-4'"
          :class="$q.dark.isActive ? 'dividerDark' : 'dividerLight'"
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
  setDoc,
  where,
  increment,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import db, { auth, storage } from "src/boot/firebase";
import { ref as dbRef, get, getDatabase, child } from "firebase/database";
import { defineComponent, ref, toRaw } from "vue";
import { formatDistance } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import { ref as stRef, uploadBytes } from "firebase/storage";

const imageRef = ref(null);
const imageUrlRef = ref("");
const likeIdRef = ref("");
const likeRef = ref(0);

export default defineComponent({
  name: "HomePage",
  data() {
    return {
      newStarshiftingPost: "",
      currName: "",
      currUsername: "",
      creatorUsername: "",
      creatorDisplayname: "",
      userVerified: false,
      creatorImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",

      formatDistance,
      imageUrl: imageUrlRef,
      image: imageRef,
      posts: [],
      imageShow: false,
      postLikes: likeRef,
      likes: [],
      likeID: likeIdRef,
      likerID: "",
      creatorID: "",
      postID: [],
      myPosts: [],
      myID: auth.currentUser.uid,
      isHidden: false,
      isLiked: false,
    };
  },
  methods: {
    pickFile() {
      this.$refs.files.pickFiles();
    },
    async onFilePicked(e) {
      this.imageUrl = URL.createObjectURL(this.image);
      this.imageShow = true;
      const file = this.image;
      const filename = file.name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file!");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.imageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(file);
      const currentUser = auth.currentUser;
      const metadata = {
        contentType: file.type,
      };

      let uidDate = new Date().getTime();

      const fileRef = stRef(
        storage,
        "images/posts/" + currentUser.uid + uidDate
      );

      const snapshot = await uploadBytes(fileRef, file, metadata);
    },
    handleRedirect(event) {
      console.log(event.target);
      //this.$router.push("/profile/" + this.creatorUsername);
    },
    addNewPost() {
      const creatorID = auth.currentUser.uid;
      let newPost = {
        content: this.newStarshiftingPost,
        date: Date.now(),
        liked: false,
        whoLiked: {
          [`${creatorID}`]: false,
        },
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        postImg: this.imageUrl,
        likes: 0,
      };
      // this.posts.unshift(newPost);
      addDoc(collection(db, "posts"), newPost);
      this.imageShow = false;
      this.imageUrl = "";
      this.image = null;
      this.newStarshiftingPost = "";
    },
    deletePost(post) {
      if (auth.currentUser.uid === post.creatorId) {
        deleteDoc(doc(db, "posts", post.id));
      } else {
        return alert("Not your post to delete.");
      }
    },
    toggleLiked(post) {
      const creatorID = auth.currentUser.uid;
      this.postID = post.id;

      if (post.likerID) {
        this.likerID = toRaw(post.likerID.find((id) => id === creatorID));
      }

      //check if likes are NaN and fix it
      if (isNaN(post.likes)) {
        updateDoc(doc(db, "posts", post.id), { likes: 0 });
      }

      if (!this.likerID && !post.likerID?.find((id) => id == creatorID)) {
        this.likerID = creatorID;
      }

      if (
        !post.whoLiked[creatorID] &&
        !post.liked &&
        this.likerID === creatorID
      ) {
        this.isLiked = true;
        const updateData = {
          likes: post.likes + 1,
          [`whoLiked.${creatorID}`]: !post.liked,
          likerID: arrayUnion(creatorID),
          liked: !post.liked,
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
      } else {
        this.isLiked = false;

        const updateData = {
          likes: Math.max(0, post.likes - 1),
          [`whoLiked.${creatorID}`]: !post.liked,
          likerID: arrayRemove(creatorID),
          liked: !post.liked,
        };
        updateDoc(doc(db, "posts/", post.id), updateData);
        this.likerID = "";
      }
    },
    async getLiked() {
      const creatorID = auth.currentUser.uid;

      const newQuerySnapshot = await getDocs(collection(db, "posts"));
      newQuerySnapshot.forEach((post) => {
        const postData = post.data();

        if (
          postData.whoLiked[creatorID] &&
          postData.likerID?.find((id) => id === creatorID)
        ) {
          this.likerID = postData.likerID;
          this.isLiked = true;
          const updateData = {
            likerID: arrayUnion(creatorID),
            [`whoLiked.${creatorID}`]: this.isLiked,
            liked: this.isLiked,
            likes: postData.likes,
          };
          updateDoc(doc(db, "posts/", post.id), updateData);
        } else {
          this.likerID = creatorID;
          this.isLiked = false;
          const updateData = {
            likerID: arrayRemove(creatorID),
            [`whoLiked.${creatorID}`]: this.isLiked,
            liked: this.isLiked,
            likes: postData.likes,
          };
          updateDoc(doc(db, "posts/", post.id), updateData);
        }
      });
    },
  },
  async mounted() {
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
    const q = query(collection(db, "posts"), orderBy("date"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        let postChange = change.doc.data();
        postChange.id = change.doc.id;
        this.postID = postChange.id;

        if (change.type === "added") {
          this.creatorUsername = postChange.creatorUsername;
          this.creatorDisplayname = postChange.creatorDisplayname;
          this.creatorImage = postChange.creatorImage;
          this.creatorID = postChange.creatorId;
          this.postImage = postChange.postImg;
          this.postLikes = postChange.likes;
          this.isLiked = postChange.isLiked;
          this.postID = postChange.id;

          this.myPosts.unshift(postChange.id);
          this.posts.unshift(postChange);

          if (postChange.creatorId === this.creatorID) {
            const joinedArray = this.myPosts.join(" ");
            const array = joinedArray.split(" ");
            const filteredArray = array.find((item) => item === postChange.id);
            if (this.creatorID === auth.currentUser.uid && this.postID) {
              const replaceInfo = doc(db, "posts/", filteredArray);
              const newInfo = {
                creatorUsername: this.currUsername,
                creatorDisplayname: this.currName,
                isUserVerified: this.userVerified,
              };
              updateDoc(replaceInfo, newInfo);
            }
          }
        }

        if (change.type === "modified") {
          let index = this.posts.findIndex((post) => post.id === postChange.id);
          Object.assign(this.posts[index], postChange);
        }
        if (change.type === "removed") {
          let index = this.posts.findIndex((post) => post.id === postChange.id);
          this.posts.splice(index, 1);
        }
      });
    });

    this.getLiked();
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
