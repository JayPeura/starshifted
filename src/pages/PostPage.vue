<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <transition-group
        appear
        enter-active-class="animated fadeIn slow"
        leave-active-class="animated fadeOut slow"
      >
        <q-item :key="this.postID" class="q-py-md">
          <q-item-section avatar top>
            <q-avatar size="xl">
              <img v-bind:src="posterImage" class="avatar" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1"
              ><strong>{{ posterName }}</strong>
              <span class="text-grey-7">
                @{{ posterUsername }} &bull; <br class="lt-md" />
                {{ formatDistance(posterDate, new Date()) }}
              </span>
            </q-item-label>
            <q-item-label class="post-content text-body1">
              {{ posterContent }}
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
                @click="toggleLikedPost"
                :color="postLiked ? 'red' : 'grey'"
                :icon="postLiked ? 'favorite' : 'favorite_border'"
                size="sm"
              />
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
                />
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
  getDoc,
} from "firebase/firestore";
import db, { auth, storage } from "../../firebase";
import { ref as dbRef, get, getDatabase, child } from "firebase/database";
import { defineComponent, ref } from "vue";
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
      myComments: [],
      creatorID: "",
      postID: window.location.href.split("post/")[1],
      commentID: "",
      posterName: "",
      posterUsername: "",
      posterImage: "",
      posterContent: "",
      postLiked: false,
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
      if (comment) {
        updateDoc(doc(db, `posts/${this.postID}/comments`, comment.id), {
          liked: !comment.liked,
        });
      }
    },
    toggleLikedPost() {
      this.postLiked = !this.postLiked;
      updateDoc(doc(db, `posts`, this.postID), {
        liked: this.postLiked,
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
.replyingTo {
  display: flex;
  margin-bottom: -5px;
  margin-left: 58px;
  color: $grey-6;
}
.avatar {
  object-fit: cover;
}
.post-icons {
  margin-left: -5px;
}

.post-content {
  white-space: pre-line;
}
</style>
