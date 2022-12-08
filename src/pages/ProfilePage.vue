<template>
  <q-page>
    <div class="flexy">
      <div class="image-upload">
        <label for="actual-btn">
          <img
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
          :name="isUserVerified ? 'verified' : ''"
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
    <div :class="isYourProfile ? 'showIfYours' : 'hideIfNotYours'">
      <div class="fields">
        Upload a new profile picture by clicking the image!
        <br />
        <span class="fileTypesSpan"
          >(Supported file types: jpg, png, jpeg)</span
        >
        <br />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, toRaw } from "vue";
import {
  ref as dbRef,
  get,
  getDatabase,
  child,
  onValue,
  update,
  query,
  equalTo,
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import db, { auth, database, storage } from "../boot/firebase";
import { getDownloadURL, ref as stRef, uploadBytes } from "firebase/storage";

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
      image:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      myImage:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      userID: "",
      theirID: "",
      isUserVerified: false,
      imageURL: "",
      prompt: prompt,
      merged: [],
      isYourProfile: false,
      followed: false,
      followingCount: 0,
      followerCount: 0,
      followerID: "",
      theyFollowed: false,
      receiverList: false,
      chatIDList: [],
      senderList: false,
    };
  },
  methods: {
    async handleRedirect() {
      const myID = auth.currentUser.uid;

      const receiverList = await getDocs(
        fsQuery(
          collection(db, "chats/"),
          where("receiverID", "in", [this.userID, myID])
        )
      );

      if (!receiverList.empty) {
        receiverList.forEach(async (receiver) => {
          const receiverID = receiver.data().receiverID;
          const senderID = receiver.data().senderID;
          const id = receiver.id;
          console.log(id);
          if (receiverID === myID) {
            if (senderID === this.userID) {
              this.$router.push("/messages/" + id);
            } else {
              await addDoc(collection(db, "chats"), {
                lastMessage: "",
                receiverID: this.userID,
                senderID: myID,
                theirImage: this.image,
                myImage: this.myImage,
                lastMessageAt: Date.now(),
              }).then(async (docRef) => {
                await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
                this.$router.push("/messages/" + docRef.id);
              });
            }
          } else if (receiverID === this.userID) {
            if (senderID === myID) {
              this.$router.push("/messages/" + id);
            } else {
              await addDoc(collection(db, "chats"), {
                lastMessage: "",
                receiverID: this.userID,
                senderID: myID,
                theirImage: this.image,
                myImage: this.myImage,
                lastMessageAt: Date.now(),
              }).then(async (docRef) => {
                await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
                this.$router.push("/messages/" + docRef.id);
              });
            }
          } else {
            console.log("No chats with these ID's yet made.");
          }
        });
      } else {
        console.log("No data yet, creating...");
        await addDoc(collection(db, "chats"), {
          lastMessage: "",
          receiverID: this.userID,
          senderID: myID,
          theirImage: this.image,
          myImage: this.myImage,
          lastMessageAt: Date.now(),
        }).then(async (docRef) => {
          await updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
          this.$router.push("/messages/" + docRef.id);
        });
      }
    },
    pickFile() {
      this.$refs.fileInput.click();
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
            (snapshot) => {
              const info = snapshot.val();

              const myRef = dbRef(database, "users/" + followerID);
              onValue(
                myRef,
                (snapshot) => {
                  const myInfo = snapshot.val();
                  if (info.followers === undefined) {
                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: !info.followed,
                    });
                    return;
                  }
                  if (this.userID === "") {
                    return;
                  }

                  if (isNaN(info.followerCount)) {
                    update(dbRef(database, "users/" + key), {
                      followerCount: 0,
                    });
                  }
                  if (isNaN(info.followingCount)) {
                    update(dbRef(database, "users/" + key), {
                      followingCount: 0,
                    });
                  }

                  if (!this.followed) {
                    this.followed = true;
                    this.followerCount = info.followerCount;
                    this.followingCount = info.followingCount;
                    this.theyFollowed = info.followers[followerID];

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: !info.followed,
                      followed: !info.followed,
                      followerCount: info.followerCount + 1,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      followingCount: myInfo.followingCount + 1,
                    });
                  } else {
                    this.followed = false;
                    this.followerCount = info.followerCount;
                    this.followingCount = info.followingCount;
                    this.theyFollowed = info.followers[followerID];

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: !info.followed,
                      followed: !info.followed,
                      followerCount: Math.max(0, info.followerCount - 1),
                    });

                    update(dbRef(database, "users/" + followerID), {
                      followingCount: Math.max(0, myInfo.followingCount - 1),
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
          onValue(userFollowRef, (snapshot) => {
            const info = snapshot.val();
            this.followerCount = info.followerCount;
            this.followed = info.followed;
            this.followingCount = info.followingCount;

            if (isNaN(info.followerCount)) {
              update(dbRef(database, "users/" + key), {
                followerCount: 0,
              });
            }
            if (isNaN(info.followingCount)) {
              update(dbRef(database, "users/" + key), {
                followingCount: 0,
              });
            }
            if (info.following === undefined) {
              update(dbRef(database, "users/" + key), {
                [`following/${followerID}`]: false,
              });
            }

            const myRef = dbRef(database, "users/" + followerID);
            onValue(
              myRef,
              (snapshot) => {
                const myInfo = snapshot.val();
                this.theyFollowed = myInfo.following[key];
                this.myImage = myInfo.image;
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

            this.$router.go();
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
            this.$router.go();
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
            this.$router.go();
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

        const userFollowRef = dbRef(database, "users/" + key);
        onValue(userFollowRef, (snapshot) => {
          const info = snapshot.val();
          this.followerCount = info.followerCount;
          this.followed = info.followed;
          this.followingCount = info.followingCount;
        });
        get(child(dbReff, `users/${key}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.currUsername = snapshot.val().username;
              this.profileName = snapshot.val().displayName;
              this.image = snapshot.val().image;
              this.isUserVerified = snapshot.val().verified;
              this.bio = snapshot.val().bio;
              if (snapshot.val().followerCount > 0) {
                this.followerCount = snapshot.val().followerCount;
              } else {
                this.followerCount = 0;
              }
              if (snapshot.val().followingCount > 0) {
                this.followingCount = snapshot.val().followingCount;
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

    this.getFollows();
  },
});
</script>
<style lang="scss">
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
  margin: 40px 0 0 50px;
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
  right: 150px;
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
.avatar {
  margin: 15px;
  margin-left: 40px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border-width: 1px;
  border-color: black;
  border-style: outset;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.notYourAvatar {
  margin: 15px;
  width: 80px;
  height: 80px;
  margin-left: 40px;
  border-radius: 50%;
  border-width: 1px;
  border-color: black;
  border-style: outset;
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
</style>
