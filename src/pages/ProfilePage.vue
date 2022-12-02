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
  orderByChild,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import db, { auth, database, storage } from "../boot/firebase";
import { getDownloadURL, ref as stRef, uploadBytes } from "firebase/storage";

const inputRef = ref(null);
const fileInput = ref(null);

export default defineComponent({
  name: "ProfilePage",
  data() {
    return {
      profileName: "",
      currUsername: "",
      image:
        "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg",
      userId: "",
      isUserVerified: false,
      imageURL: "",
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
  },
  mounted() {
    const userId = auth.currentUser.uid;

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const dbReff = dbRef(getDatabase());

        const db2 = getDatabase();
        const usernameRef = dbRef(db2, "users/");
        onValue(usernameRef, (snapshot) => {
          snapshot
            .forEach((child) => {
              const data = child.val();
              this.currUsername = data.username;
              console.log(child.val());
              // update(dbRef(database, "users/" + userId), {
              //   username: this.currUsername,
              // })
              //   .then(() => {
              //     // Data saved successfully!
              //   })
              //   .catch((error) => {
              //     // The write failed...
              //     alert(error);
              //   });
            })
            .then((id) => {
              console.log(id);
            });
          get(child(dbReff, `users/${userId}`))
            .then((snapshot) => {
              if (snapshot.exists()) {
                this.currUsername = snapshot.val().username;
                this.profileName = snapshot.val().displayName;
                this.image = snapshot.val().image;
                this.userId = snapshot.val().id;
                this.isUserVerified = snapshot.val().verified;
                if (this.userId === this.myID) {
                  this.isYourProfile = true;
                }
              } else {
                console.log("No data available");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        });
      }
    });
  },
});
</script>
<style>
.flexy {
  display: flex;
}
.hideWhenNotVerified {
  width: 0;
}
.showWhenVerified {
  width: 20px;
  margin-left: 2px;
  margin-top: -2.5px;
}
.names {
  margin: 40px 0 0 60px;
}
.fields {
  margin-left: 30px;
}
.avatar {
  margin: 15px;
  margin-left: 50px;
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
</style>
