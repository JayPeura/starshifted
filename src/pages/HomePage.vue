<template>
  <q-page class="relative-position">
    <q-scroll-area :visible="false" class="absolute full-width full-height">
      <div class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm">
        <div class="col">
          <q-input
            bottom-slots
            v-model="newStarshiftingPost"
            placeholder="What's going on?"
            autogrow
            borderless
            :counter="newStarshiftingPost ? true : false"
            maxlength="680"
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
                  &bull;
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
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
} from "firebase/firestore";
import db, { database, auth, storage } from "src/boot/firebase";
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
import { formatDistance, formatDistanceStrict, format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import { ref as stRef, uploadBytes } from "firebase/storage";
import sanitizeHtml from "sanitize-html";
import { useQuasar } from "quasar";

const imageRef = ref(null);
const imageUrlRef = ref("");
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
    },
    pickFile() {
      this.$refs.files.pickFiles();
    },
    async onFilePicked(e) {
      this.imageUrl = URL.createObjectURL(this.image);
      this.imageShow = true;
    },
    handleRedirect(post) {
      this.$router.push("/profile/" + post.creatorUsername);
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
      };
      // this.posts.unshift(newPost);
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

        const uploadTask = await uploadBytes(fileRef, this.image, metadata);
      }
      this.imageShow = false;
      this.imageUrl = "";
      this.image = null;
      this.newStarshiftingPost = "";
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

      const q = query(collection(db, "posts"), orderBy("date"));
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
            this.postID = postChange.id;
            this.creatorID = postChange.creatorId;
            this.myPosts.unshift(postChange.id);
            this.posts.unshift(postChange);

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
    this.getPosts();
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
.deleteHidden {
  display: none;
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
  .postLikes {
    display: flex;
    position: absolute;
    font-size: 16px;
    color: grey;
    margin-left: 60px;
  }
}
.postavatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.post-content {
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
  max-height: 500px;
  margin-bottom: 15px;
  padding-right: 35px;
  margin-top: 10px;
  display: flex;
}

img[src=""] {
  display: none;
}
</style>
