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
    <div :class="isYourProfile ? 'showIfYours' : 'hideIfNotYours'">
      <q-btn
        label="Edit profile"
        :class="$q.dark.isActive ? 'editProfileDark' : 'editProfileLight'"
        @click="prompt = true"
      />
      <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 450px; min-height: 300px">
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
    <div class="fields">
      Upload a new profile picture by clicking the image!
      <br />
      <span class="fileTypesSpan">(Supported file types: jpg, png, jpeg)</span>
      <br />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
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
      userId: "",
      isUserVerified: false,
      imageURL: "",
      prompt: prompt,
      merged: [],
      isYourProfile: false,
    };
  },
  methods: {
    pickFile() {
      this.$refs.fileInput.click();
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
  mounted() {
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
        get(child(dbReff, `users/${key}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              this.currUsername = snapshot.val().username;
              this.profileName = snapshot.val().displayName;
              this.image = snapshot.val().image;
              this.isUserVerified = snapshot.val().verified;
              this.bio = snapshot.val().bio;
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
  margin-left: 50px;
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
