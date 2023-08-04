<template>
  <q-page>
    <q-scroll-area
      v-if="!banned"
      :visible="false"
      class="absolute full-width full-height"
      :style="
        'background-color: ' +
        getThemeColour(theme.value).mild +
        '; color: ' +
        getThemeColour(theme.value).txt
      "
    >
      <div class="userInfo" v-for="user in users" :key="user.id">
        <div class="flexy">
          <div class="image-upload">
            <label for="actual-btn">
              <q-img
                :key="$route.fullPath"
                :src="user.image"
                alt="avatar"
                :class="user.id === myID ? 'profileAvatar' : 'notYourAvatar'"
                for="actual-btn"
                title="Change your profile avatar by clicking here!"
            /></label>

            <input
              type="file"
              :id="user.id === myID ? 'actual-btn' : ''"
              @change="handleFileSelect"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <q-dialog v-model="dialogVisible" full-width>
              <div style="position: relative; height: 90%; width: 614px">
                <vue-cropper
                  ref="cropper"
                  :aspect-ratio="1"
                  :src="imgUrl"
                  alt="Uploaded image"
                >
                </vue-cropper>
              </div>
              <q-card-actions align="right">
                <q-btn label="Cancel" color="red" @click="cancelCrop" />
                <q-btn label="Crop" color="green" @click="onFilePicked" />
              </q-card-actions>
            </q-dialog>
          </div>

          <h5 class="names">
            <strong>{{ user.displayName }}</strong>
            <q-icon
              :name="
                user.verified !== undefined && user.verified
                  ? 'bi-moon-stars-fill'
                  : ''
              "
              :class="
                user.verified !== undefined && user.verified
                  ? 'showWhenVerified'
                  : 'hideWhenNotVerified'
              "
            />
            {{ " " }}
            <span class="username">@{{ user.username }}</span>
          </h5>
        </div>
        <q-item-section>
          <q-item-label class="rounded-borders bio-content text-body1">
            <span>{{ user.bio }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <span
              @click="
                followingPrompt = true;
                selectedFollowing();
              "
              style="margin-right: 25px; margin-left: 20px"
              >{{ followingCount }}
              <span style="margin-left: 5px; color: grey">Following</span></span
            >

            <span
              @click="
                followerPrompt = true;
                selectedFollowers();
              "
              >{{ followerCount }}
              <span style="margin-left: 5px; color: grey">Followers</span></span
            >
          </q-item-label>
        </q-item-section>
        <div :class="user.id === myID ? 'showIfYours' : 'hideIfNotYours'">
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
        <div :class="user.id !== myID ? 'showIfNotYours' : 'hideIfYours'">
          <q-btn
            icon="mail"
            round
            :class="$q.dark.isActive ? 'messageDark' : 'messageLight'"
            @click="handleRedirect"
          />
          <q-btn
            :label="followLabel(user)"
            :key="componentKey"
            :class="$q.dark.isActive ? 'editProfileDark' : 'editProfileLight'"
            @click="toggleFollow"
          />
        </div>
      </div>
      <q-separator
        class="q-mt-xl q-mb-sm q-py-xs"
        :style="
          'background-color: ' +
          getThemeColour(theme.value).bg +
          '; color: ' +
          getThemeColour(theme.value).txt
        "
      />

      <q-card
        :style="
          'background-color: ' +
          getThemeColour(theme.value).mild +
          '; color: ' +
          getThemeColour(theme.value).txt
        "
      >
        <q-tabs
          v-model="tab"
          dense
          :style="
            'background-color: ' +
            getThemeColour(theme.value).mild +
            '; color: ' +
            getThemeColour(theme.value).txt
          "
          :active-color="$q.dark.isActive ? 'secondary' : 'primary'"
          :active-bg-color="$q.dark.isActive ? 'grey-10' : 'secondary'"
          :indicator-color="$q.dark.isActive ? 'secondary' : 'primary'"
          align="justify"
          narrow-indicator
        >
          <q-tab name="ownPosts" label="My posts" />
          <q-tab name="likedPosts" label="Liked Posts" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel
            name="ownPosts"
            :style="
              'background-color: ' +
              getThemeColour(theme.value).mild +
              '; color: ' +
              getThemeColour(theme.value).txt
            "
          >
            <q-list separator>
              <transition-group
                appear
                enter-active-class="animated fadeIn slow"
                leave-active-class="animated fadeOut slow"
              >
                <q-item
                  v-for="ownPost in profilePosts"
                  :key="ownPost.id"
                  class="q-py-md"
                  :style="
                    'background-color: ' +
                    getThemeColour(theme.value).mild +
                    '; color: ' +
                    getThemeColour(theme.value).txt
                  "
                >
                  <q-item-section avatar top>
                    <label
                      for="actual-btn"
                      class="clickableLabel"
                      @click="handleRedirect(ownPost)"
                    >
                      <q-avatar round size="xl">
                        <q-img
                          v-bind:src="ownPost.creatorImage"
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
                        @click="handleRedirect(ownPost)"
                        class="clickableLabel"
                        >{{ ownPost.creatorDisplayname }}</strong
                      >
                      <q-icon
                        :name="
                          ownPost.isUserVerified ? 'bi-moon-stars-fill' : ''
                        "
                        :class="
                          ownPost.isUserVerified
                            ? 'showWhenVerified'
                            : 'hideWhenNotVerified'
                        "
                      />
                      <span class="text-grey-7 usernameStyle">
                        @{{ ownPost.creatorUsername }}
                        &bull;
                      </span>
                      <span
                        class="text-grey-7"
                        style="position: relative; padding-right: 50px"
                      >
                        {{
                          ownPost.date > Date.now() - 35 * 60 * 60 * 1000
                            ? formatDistanceStrict(ownPost.date, new Date())
                            : format(ownPost.date, "d MMM")
                        }}</span
                      >
                      <span
                        v-if="ownPost.NSFW"
                        style="color: red; margin-left: 5px"
                        >NSFW</span
                      >
                    </q-item-label>
                    <q-item-label class="post-content text-body1">
                      <span v-html="linkifyText(ownPost)"></span>
                      <img
                        v-if="ownPost.NSFW"
                        @click="
                          imageShower = true;
                          openImage = ownPost.postImg;
                        "
                        :src="ownPost.postImg"
                        class="postImage blur"
                      />
                      <img
                        v-else
                        @click="
                          imageShower = true;
                          openImage = ownPost.postImg;
                        "
                        :src="ownPost.postImg"
                        class="postImage"
                      />
                      <div v-for="repost in repostedPosts" :key="repost.id">
                        <q-item
                          v-if="
                            ownPost.repostID !== undefined &&
                            repost.id === ownPost.repostID &&
                            !repost.deleted
                          "
                          style="
                            border: 1px solid grey;
                            border-radius: 5px;
                            padding: 15px;
                            margin-top: 10px;
                            margin-right: 20px;
                          "
                          clickable
                          :to="'/post/' + ownPost.repostID"
                        >
                          <q-item-section avatar top>
                            <label
                              for="actual-btn"
                              class="clickableLabel"
                              @click="handleRedirect(repost)"
                            >
                              <q-avatar round size="lg">
                                <q-img
                                  v-bind:src="repost.creatorImage"
                                  class="homeRepostAvatar"
                                /> </q-avatar
                            ></label>

                            <button id="actual-btn" hidden></button>
                          </q-item-section>
                          <q-item-label class="text-subtitle1"
                            ><strong
                              @click="handleRedirect(repost)"
                              class="clickableLabel"
                              :style="
                                'color: ' + getThemeColour(theme.value).txt
                              "
                              >{{ repost.creatorDisplayname }}</strong
                            >
                            <q-icon
                              :name="
                                ownPost.isUserVerified
                                  ? 'bi-moon-stars-fill'
                                  : ''
                              "
                              :style="
                                'color: ' + getThemeColour(theme.value).txt
                              "
                              :class="
                                repost.isUserVerified
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
                              @{{ repost.creatorUsername }}
                              ─
                            </span>
                            <span class="text-grey-7">
                              {{
                                repost.date > Date.now() - 35 * 60 * 60 * 1000
                                  ? formatDistanceStrict(
                                      repost.date,
                                      new Date()
                                    ) + " ago"
                                  : format(repost.date, "d MMM")
                              }}</span
                            >
                            <span
                              v-if="repost.NSFW"
                              style="color: red; margin-left: 5px"
                              >NSFW</span
                            >
                            <q-item-label class="homePostContent text-body2">
                              <span
                                v-html="linkifyText(repost)"
                                :style="
                                  'background-color: ' +
                                  getThemeColour(theme.value).mild +
                                  '; color: ' +
                                  getThemeColour(theme.value).txt
                                "
                              ></span>
                              <img
                                v-if="repost.NSFW"
                                :src="repost.postImg"
                                class="postImage blur"
                              />
                              <img
                                v-else
                                :src="repost.postImg"
                                class="postImage"
                              />
                            </q-item-label>
                          </q-item-label>
                        </q-item>
                        <q-item
                          v-if="
                            repost.deleted && repost.id === ownPost.repostID
                          "
                          style="
                            border: 2px solid grey;
                            padding: 15px;
                            color: red;
                          "
                          >DELETED POST</q-item
                        >
                      </div>
                    </q-item-label>
                    <q-dialog
                      v-for="post in posts"
                      :key="post.id"
                      v-model="post.imageShower"
                    >
                      <q-card>
                        <img :src="post.postImg" />
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="repostPrompt" persistent>
                      <q-card style="padding: 10px; width: 700px">
                        <q-card-section>
                          <div class="text-h5">Want to repost this?</div>
                          <span class="text-body1 text-red"
                            >@{{ selectedPost.creatorUsername }}:</span
                          >
                          <p>{{ selectedPost.content }}</p>
                          <q-img
                            v-if="selectedPost.postImg"
                            :src="selectedPost.postImg"
                            style="height: 300px; width: 300px"
                          />
                        </q-card-section>
                        <q-separator />
                        <div
                          class="q-pt-lg q-pb-sm q-px-md row items-end q-col-gutter-sm"
                        >
                          <div class="col">
                            <q-input
                              bottom-slots
                              v-model="repostPost"
                              placeholder="Repost content here"
                              autogrow
                              borderless
                              :counter="repostPost ? true : false"
                              maxlength="680"
                              class="new-post"
                            >
                              <template v-slot:before>
                                <q-avatar round size="xl">
                                  <q-img
                                    v-bind:src="myImage"
                                    class="myPostAvatar"
                                  />
                                </q-avatar>
                              </template>
                            </q-input>
                          </div>

                          <div class="col col-shrink">
                            <span class="isNSFW">NSFW?</span>
                            <q-toggle
                              v-model="isNSFW"
                              color="red"
                              keep-color
                              title="Is your post NSFW? Toggle this if yes (:"
                            />
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
                              v-model="repostImage"
                              accept=".jpg, image/*"
                              @update:model-value="onFilePickedRepost(e)"
                              ref="files"
                            >
                            </q-file>
                            <q-btn
                              round
                              dense
                              flat
                              @click="repostThis(selectedPost, repostPost)"
                              icon="send"
                              class="q-mb-lg"
                              :disable="!repostPost && !repostImage"
                              v-close-popup
                            />
                          </div>
                        </div>
                        <div
                          :class="
                            imageRepostShow ? 'showwhenimage' : 'hidewhenimage'
                          "
                        >
                          <q-img
                            :src="repostImageUrl"
                            class="imagePreview"
                            ratio="1"
                          />
                          <q-btn
                            round
                            dense
                            flat
                            icon="close"
                            :class="
                              imageRepostShow
                                ? 'showwhenimagebtn'
                                : 'hidewhenimagebtn'
                            "
                            @click="cancelFileUpload"
                          ></q-btn>
                        </div>
                        <q-card-actions>
                          <q-btn v-close-popup label="Close" />
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <div class="postMenu row justify-between q-mt-sm">
                      <q-btn
                        flat
                        round
                        icon="more_vert"
                        size="13px"
                        @click="getFollowed(ownPost)"
                      >
                        <q-menu auto-close>
                          <q-list style="min-width: 240px">
                            <q-item
                              v-if="ownPost.creatorId !== myID"
                              clickable
                              @click="followFromownPost(ownPost)"
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
                                  ownPost.creatorUsername
                                }}</q-item-section
                              >
                            </q-item>
                            <q-item
                              v-if="ownPost.creatorId === myID || admin"
                              clickable
                              @click="confirm(ownPost)"
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
                            <q-separator
                              v-if="ownPost.creatorId !== myID && admin"
                              color="grey-9"
                            />
                            <q-item
                              v-if="ownPost.creatorId !== myID && admin"
                              clickable
                              outline
                              @click="banUser(ownPost)"
                            >
                              <q-item-section avatar>
                                <q-icon
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
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
                        :to="'/post/' + ownPost.id"
                      />
                      <q-btn flat round color="grey" icon="cached" size="sm" />
                      <q-btn
                        flat
                        round
                        @click="toggleLiked(ownPost)"
                        :color="checkColor(ownPost)"
                        :icon="checkIcon(ownPost)"
                        size="sm"
                      >
                      </q-btn
                      ><span
                        class="postLikes"
                        @click="
                          likePrompt = true;
                          selectedPost = ownPost;
                          selectedLikes();
                        "
                      >
                        {{
                          ownPost.whoLiked !== undefined
                            ? new Intl.NumberFormat("en-GB", {
                                notation: "compact",
                              }).format(Object.keys(ownPost.whoLiked).length)
                            : 0
                        }}
                      </span>
                    </div>
                  </q-item-section>
                </q-item>
              </transition-group>
            </q-list></q-tab-panel
          >

          <q-tab-panel
            name="likedPosts"
            :style="
              'background-color: ' +
              getThemeColour(theme.value).mild +
              '; color: ' +
              getThemeColour(theme.value).txt
            "
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
                      <div v-for="repost in repostedPosts" :key="repost.id">
                        <q-item
                          v-if="
                            post.repostID !== undefined &&
                            repost.id === post.repostID &&
                            !repost.deleted
                          "
                          style="
                            border: 1px solid grey;
                            border-radius: 5px;
                            padding: 15px;
                            margin-top: 10px;
                            margin-right: 20px;
                          "
                          clickable
                          :to="'/post/' + post.repostID"
                        >
                          <q-item-section avatar top>
                            <label
                              for="actual-btn"
                              class="clickableLabel"
                              @click="handleRedirect(repost)"
                            >
                              <q-avatar round size="lg">
                                <q-img
                                  v-bind:src="repost.creatorImage"
                                  class="homeRepostAvatar"
                                /> </q-avatar
                            ></label>

                            <button id="actual-btn" hidden></button>
                          </q-item-section>
                          <q-item-label class="text-subtitle1"
                            ><strong
                              @click="handleRedirect(repost)"
                              class="clickableLabel"
                              :style="
                                'color: ' + getThemeColour(theme.value).txt
                              "
                              >{{ repost.creatorDisplayname }}</strong
                            >
                            <q-icon
                              :name="
                                post.isUserVerified ? 'bi-moon-stars-fill' : ''
                              "
                              :style="
                                'color: ' + getThemeColour(theme.value).txt
                              "
                              :class="
                                repost.isUserVerified
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
                              @{{ repost.creatorUsername }}
                              ─
                            </span>
                            <span class="text-grey-7">
                              {{
                                repost.date > Date.now() - 35 * 60 * 60 * 1000
                                  ? formatDistanceStrict(
                                      repost.date,
                                      new Date()
                                    ) + " ago"
                                  : format(repost.date, "d MMM")
                              }}</span
                            >
                            <span
                              v-if="repost.NSFW"
                              style="color: red; margin-left: 5px"
                              >NSFW</span
                            >
                            <q-item-label class="homePostContent text-body2">
                              <span
                                v-html="linkifyText(repost)"
                                :style="
                                  'background-color: ' +
                                  getThemeColour(theme.value).mild +
                                  '; color: ' +
                                  getThemeColour(theme.value).txt
                                "
                              ></span>
                              <img
                                v-if="repost.NSFW"
                                :src="repost.postImg"
                                class="postImage blur"
                              />
                              <img
                                v-else
                                :src="repost.postImg"
                                class="postImage"
                              />
                            </q-item-label>
                          </q-item-label>
                        </q-item>
                        <q-item
                          v-if="repost.deleted && repost.id === post.repostID"
                          style="
                            border: 2px solid grey;
                            padding: 15px;
                            color: red;
                          "
                          >DELETED POST</q-item
                        >
                      </div>
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
                              v-if="post.creatorId !== myID && !admin"
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
                              v-if="post.creatorId === myID || admin"
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
                                  :color="
                                    $q.dark.isActive ? 'secondary' : 'primary'
                                  "
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
                      </q-btn
                      ><span
                        class="postLikes"
                        @click="
                          likePrompt = true;
                          selectedPost = post;
                          selectedLikes();
                        "
                      >
                        {{
                          post.whoLiked !== undefined
                            ? new Intl.NumberFormat("en-GB", {
                                notation: "compact",
                              }).format(Object.keys(post.whoLiked).length)
                            : 0
                        }}
                      </span>
                    </div>
                  </q-item-section>
                </q-item>
              </transition-group>
            </q-list></q-tab-panel
          >
        </q-tab-panels>
      </q-card>
    </q-scroll-area>
    <div class="isBanned" v-else>
      <div class="userInfo" v-for="user in users" :key="user.id">
        <div class="flexy">
          <div class="image-upload">
            <label for="actual-btn">
              <q-img
                :key="$route.fullPath"
                :src="user.image"
                alt="avatar"
                :class="user.id === myID ? 'avatar' : 'notYourAvatar'"
                for="actual-btn"
            /></label>

            <input
              type="file"
              ref="fileInput"
              :id="user.id === myID ? 'actual-btn' : ''"
              @change="onFilePicked"
              accept=".jpg, .png, .jpeg"
              hidden
            />
          </div>

          <h5 class="names">
            <strong>{{ user.displayName }}</strong>
            <q-icon
              :name="
                user.verified !== undefined && user.verified
                  ? 'bi-moon-stars-fill'
                  : ''
              "
              :class="
                user.verified !== undefined && user.verified
                  ? 'showWhenVerified'
                  : 'hideWhenNotVerified'
              "
            />
            {{ " " }}
            <span class="username">@{{ user.username }}</span>
          </h5>
        </div>
        <q-item-section>
          <q-item-label class="rounded-borders bio-content text-body1">
            <h5 style="display: flex; justify-content: center">
              This user has been permanently suspended.
            </h5>
          </q-item-label>
        </q-item-section>
      </div>
    </div>
    <!-- LIKERS -->
    <q-dialog v-model="likePrompt" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">People who liked this post</div>
        </q-card-section>
        <q-separator />

        <q-card-section style="max-height: 35vh" class="scroll"
          ><q-list v-if="!noLikes" separator>
            <q-item class="likers" v-for="liker in likers" :key="liker.id">
              <q-item-section avatar>
                <label
                  for="actual-btn"
                  class="clickableLabel"
                  @click="handleRedirectLikes(liker)"
                >
                  <q-avatar round size="xl">
                    <q-img
                      :src="liker.image"
                      class="homePostAvatar"
                    /> </q-avatar
                ></label>

                <button id="actual-btn" hidden></button>
              </q-item-section>
              <q-item-label
                class="text-subtitle1"
                style="display: flex; align-items: center"
                ><strong
                  @click="handleRedirectLikes(liker)"
                  class="clickableLabel"
                  >{{ liker.displayName }}</strong
                >
                <q-icon
                  :name="liker.verified ? 'bi-moon-stars-fill' : ''"
                  :class="
                    liker.verified ? 'showWhenVerified' : 'hideWhenNotVerified'
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
                  @{{ liker.username }}
                  <br />
                </span>
                <br />
                <br />
                <br /> </q-item-label></q-item
          ></q-list>
        </q-card-section>
        <div v-if="noLikes" align="center">No one liked this post yet.</div>
        <br />

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Close"
            :color="$q.dark.isActive ? 'secondary' : 'primary'"
            v-close-popup
            @click="likers = []"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- FOLLOWING -->

    <q-dialog v-model="followingPrompt" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">This account is following:</div>
        </q-card-section>
        <q-separator />

        <q-card-section style="max-height: 35vh" class="scroll"
          ><q-list v-if="!noFollowing" separator>
            <q-item
              class="following"
              v-for="following in followings"
              :key="following.id"
            >
              <q-item-section avatar>
                <label
                  for="actual-btn"
                  class="clickableLabel"
                  @click="handleRedirectLikes(following)"
                >
                  <q-avatar round size="xl">
                    <q-img
                      :src="following.image"
                      class="homePostAvatar"
                    /> </q-avatar
                ></label>

                <button id="actual-btn" hidden></button>
              </q-item-section>
              <q-item-label
                class="text-subtitle1"
                style="display: flex; align-items: center"
                ><strong
                  @click="handleRedirectLikes(following)"
                  class="clickableLabel"
                  >{{ following.displayName }}</strong
                >
                <q-icon
                  :name="following.verified ? 'bi-moon-stars-fill' : ''"
                  :class="
                    following.verified
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
                  @{{ following.username }}
                  <br />
                </span>
                <br />
                <br />
                <br /> </q-item-label></q-item
          ></q-list>
        </q-card-section>
        <div v-if="noFollowing" align="center">
          This account hasn't followed anyone yet.
        </div>
        <br />

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Close"
            :color="$q.dark.isActive ? 'secondary' : 'primary'"
            v-close-popup
            @click="followings = []"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- FOLLOWERS -->

    <q-dialog v-model="followerPrompt" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">This account is followed by:</div>
        </q-card-section>
        <q-separator />

        <q-card-section style="max-height: 35vh" class="scroll"
          ><q-list v-if="!noFollowers" separator>
            <q-item
              class="followers"
              v-for="follower in followers"
              :key="follower.id"
            >
              <q-item-section avatar>
                <label
                  for="actual-btn"
                  class="clickableLabel"
                  @click="handleRedirectLikes(follower)"
                >
                  <q-avatar round size="xl">
                    <q-img
                      :src="follower.image"
                      class="homePostAvatar"
                    /> </q-avatar
                ></label>

                <button id="actual-btn" hidden></button>
              </q-item-section>
              <q-item-label
                class="text-subtitle1"
                style="display: flex; align-items: center"
                ><strong
                  @click="handleRedirectLikes(follower)"
                  class="clickableLabel"
                  >{{ follower.displayName }}</strong
                >
                <q-icon
                  :name="follower.verified ? 'bi-moon-stars-fill' : ''"
                  :class="
                    follower.verified
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
                  @{{ follower.username }}
                  <br />
                </span>
                <br />
                <br />
                <br /> </q-item-label></q-item
          ></q-list>
        </q-card-section>
        <div v-if="noFollowers" align="center">
          No one has followed this account yet.
        </div>
        <br />

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Close"
            :color="$q.dark.isActive ? 'secondary' : 'primary'"
            v-close-popup
            @click="followers = []"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  query as pFsQuery,
  getDoc,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
  deleteField,
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
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

const inputRef = ref(null);
const fileInput = ref(null);
const prompt = ref(false);

export default defineComponent({
  name: "ProfilePage",
  components: { VueCropper },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.users = [];
      vm.profilePosts = [];
      vm.likedPosts = [];
      vm.getProfileInfo();

      vm.getOwnPosts();
      vm.getLikedPosts();
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.users = [];
    this.profilePosts = [];
    this.likedPosts = [];
    this.getProfileInfo();

    this.getOwnPosts();
    this.getLikedPosts();
    next();
  },
  data() {
    return {
      profileName: "",
      currUsername: "",
      newName: "",
      bio: "",
      newBio: "",
      tab: ref("ownPosts"),
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
      users: [],
      isYourProfile: false,
      followed: false,
      followingCount: 0,
      followerCount: 0,
      componentKey: 0,
      following: "Follow",
      myData: "",
      theirData: "",
      followerID: "",
      theyFollowed: false,
      receiverList: false,
      chatIDList: [],
      profilePosts: [],
      likedPosts: [],
      senderList: false,
      admin: false,
      banned: false,
      likePrompt: false,
      selectedPost: {},
      likers: [],
      noLikes: true,
      noFollowers: true,
      noFollowing: true,
      followers: [],
      followings: [],
      followerPrompt: false,
      followingPrompt: false,
      selectedUser: {},
      theme: "",
      imgUrl: "",
      cropImg: "",
      cropper: null,
      dialogVisible: false,
      repostPrompt: false,
      repostPost: "",
      repostImageUrl: "",
      repostImage: null,
      imageRepostShow: false,
      repostedPosts: [],
      repostID: [],
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
    async repostThis(post, repost) {
      const creatorID = auth.currentUser.uid;
      let newPost = {
        content: repost,
        date: Date.now(),
        whoLiked: [],
        isUserVerified: this.userVerified,
        creatorUsername: this.currUsername,
        creatorDisplayname: this.currName,
        creatorImage: this.myImage,
        creatorId: creatorID,
        postImg: this.repostImageUrl,
        hashtags: this.createHashtags(repost),
        NSFW: this.isNSFW,
        repostID: post.id,
      };
      addDoc(collection(db, "posts"), newPost);
      if (this.repostImage !== null) {
        let uidDate = new Date().getTime();
        const currentUser = auth.currentUser;

        const metadata = {
          contentType: this.repostImage.type,
        };

        const fileRef = stRef(
          storage,
          "images/posts/" + currentUser.uid + uidDate
        );

        await uploadBytes(fileRef, this.repostImage, metadata);
      }
      this.imageRepostShow = false;
      this.repostImageUrl = "";
      this.repostImage = null;
      this.hashtags = [];
    },
    handleRedirectFollowing(follower) {
      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${follower.id}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.$router.push("/profile/" + snapshot.val().username);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    selectedFollowing() {
      if (this.selectedUser.following !== undefined) {
        this.noFollowing = true;
      }
      const following = Object.keys(this.selectedUser.following);
      console.log(following);
      following.forEach((followingID) => {
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${followingID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              let following = snapshot.val();
              following.id = snapshot.key;
              this.followings.push(following);
              console.log(toRaw(this.followings));
              this.noFollowing = false;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    handleRedirectFollower(follower) {
      console.log(follower);
      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${liker.id}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.$router.push("/profile/" + snapshot.val().username);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    selectedFollowers() {
      if (this.selectedUser.followers !== undefined) {
        this.noFollowers = true;
      }
      const followers = Object.keys(this.selectedUser.followers);
      followers.forEach((followerID) => {
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${followerID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              let followers = snapshot.val();
              followers.id = snapshot.key;
              this.followers.push(followers);
              this.noFollowers = false;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    handleRedirectLikes(liker) {
      console.log(liker);
      const dbReff = dbRef(getDatabase());
      get(child(dbReff, `users/${liker.id}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            this.$router.push("/profile/" + snapshot.val().username);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    selectedLikes() {
      if (this.selectedPost.whoLiked !== undefined) {
        this.noLikes = true;
      }
      const likes = Object.keys(this.selectedPost.whoLiked);
      likes.forEach((likerID) => {
        const dbReff = dbRef(getDatabase());
        get(child(dbReff, `users/${likerID}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              let likers = snapshot.val();
              likers.id = snapshot.key;
              this.likers.push(likers);
              this.noLikes = false;
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
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
      const db2 = getDatabase();
      const qProfile = query(
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
        return "star_border";
      } else if (post.whoLiked[myID]) {
        return "star";
      } else if (!post.whoLiked[myID]) {
        return "star_border";
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

      const pattern3 = /#(\w+)/g;
      text = text.replace(
        pattern3,
        '<a class="hashtag" href="/#/topic/$1">#$1</a>'
      );

      return sanitizeHtml(text, {
        allowedTags: ["b", "i", "em", "strong", "a"],
        allowedAttributes: {
          a: ["href", "class"],
        },
        allowedIframeHostnames: ["www.youtube.com"],
      });
    },
    async handleRedirect() {
      const myID = auth.currentUser.uid;

      const IDs = [myID, this.userID];
      const IDs2 = [this.userID, myID];

      const participantList = await getDocs(
        pFsQuery(collection(db, "chats"), where("participants", "==", IDs))
      );

      if (!participantList.empty) {
        participantList.forEach(async (receiver) => {
          const pList = receiver.data();
          this.$router.push("/messages/" + pList.id);
        });
      } else {
        const theirList = await getDocs(
          pFsQuery(collection(db, "chats"), where("participants", "==", IDs2))
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
    getOwnPosts() {
      const myID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const dbProfile = getDatabase();
      const qProfile = query(
        dbRef(dbProfile, "users"),
        orderByChild("username"),
        equalTo(username)
      );
      get(qProfile).then((profileOwnSS) => {
        if (profileOwnSS.exists()) {
          const key = Object.keys(profileOwnSS.val())[0];
          const dbReff = dbRef(getDatabase());
          const ownQ = pFsQuery(
            collection(db, "posts"),
            where("creatorId", "==", this.userID),
            orderBy("date")
          );
          const unsubscribe = onSnapshot(ownQ, (postSS) => {
            postSS.docChanges().forEach((profileChange) => {
              let ownPosts = profileChange.doc.data();
              ownPosts.id = profileChange.doc.id;
              this.postID = ownPosts.id;
              this.creatorID = ownPosts.creatorId;

              if (profileChange.type === "added") {
                this.creatorUsername = ownPosts.creatorUsername;
                this.creatorDisplayname = ownPosts.creatorDisplayname;
                this.creatorImage = ownPosts.creatorImage;
                this.creatorVerified = ownPosts.isUserVerified;
                this.postImage = ownPosts.postImg;
                this.postLikes = ownPosts.likes;
                this.postID = ownPosts.id;
                this.creatorID = ownPosts.creatorId;
                this.profilePosts.unshift(ownPosts);
                if (ownPosts.repostID !== undefined) {
                  const newSub = onSnapshot(
                    doc(db, "posts", ownPosts.repostID),
                    (prevPoster) => {
                      if (prevPoster.exists()) {
                        let prevPost = prevPoster.data();
                        prevPost.id = prevPoster.id;

                        const existingPostIndex = this.repostedPosts.findIndex(
                          (post) => post.id === ownPosts.repostID
                        );

                        if (existingPostIndex === -1) {
                          this.repostedPosts.push(prevPost);
                        }
                      } else {
                        const deletedPostIndex = this.repostedPosts.findIndex(
                          (post) => post.id === ownPosts.repostID
                        );

                        if (deletedPostIndex !== -1) {
                          this.repostedPosts[deletedPostIndex].deleted = true;
                        } else {
                          this.repostedPosts.push({
                            deleted: true,
                            id: ownPosts.repostID,
                          });
                        }
                      }
                    }
                  );
                }
              }

              if (profileChange.type === "modified") {
                let index = this.profilePosts.findIndex(
                  (post) => post.id === ownPosts.id
                );
                Object.assign(this.profilePosts[index], ownPosts);
              }
              if (profileChange.type === "removed") {
                let index = this.profilePosts.findIndex(
                  (post) => post.id === ownPosts.id
                );
                this.profilePosts.splice(index, 1);
              }
            });
          });
        }
      });
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
    getLikedPosts() {
      const myID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const dbProfile = getDatabase();
      const qProfile = query(
        dbRef(dbProfile, "users"),
        orderByChild("username"),
        equalTo(username)
      );
      get(qProfile).then((profileLikedSS) => {
        if (profileLikedSS.exists()) {
          const key = Object.keys(profileLikedSS.val())[0];
          const dbReff = dbRef(getDatabase());
          const likedQ = pFsQuery(
            collection(db, "posts"),
            orderBy(`whoLiked.${key}.dateLiked`)
          );
          const unsubscribe = onSnapshot(likedQ, (profileLiked) => {
            profileLiked.docChanges().forEach((likedChange) => {
              let likedPostChange = likedChange.doc.data();
              likedPostChange.id = likedChange.doc.id;
              this.postID = likedPostChange.id;
              this.creatorID = likedPostChange.creatorId;

              if (likedChange.type === "added") {
                this.creatorUsername = likedPostChange.creatorUsername;
                this.creatorDisplayname = likedPostChange.creatorDisplayname;
                this.creatorImage = likedPostChange.creatorImage;
                this.creatorVerified = likedPostChange.isUserVerified;
                this.postImage = likedPostChange.postImg;
                this.postLikes = likedPostChange.likes;
                this.postID = likedPostChange.id;
                this.creatorID = likedPostChange.creatorId;
                this.likedPosts.unshift(likedPostChange);
                if (likedPostChange.repostID !== undefined) {
                  const newSub = onSnapshot(
                    doc(db, "posts", likedPostChange.repostID),
                    (prevPoster) => {
                      if (prevPoster.exists()) {
                        let prevPost = prevPoster.data();
                        prevPost.id = prevPoster.id;

                        const existingPostIndex = this.repostedPosts.findIndex(
                          (post) => post.id === likedPostChange.repostID
                        );

                        if (existingPostIndex === -1) {
                          this.repostedPosts.push(prevPost);
                        }
                      } else {
                        const deletedPostIndex = this.repostedPosts.findIndex(
                          (post) => post.id === likedPostChange.repostID
                        );

                        if (deletedPostIndex !== -1) {
                          this.repostedPosts[deletedPostIndex].deleted = true;
                        } else {
                          this.repostedPosts.push({
                            deleted: true,
                            id: likedPostChange.repostID,
                          });
                        }
                      }
                    }
                  );
                }
              }

              if (likedChange.type === "modified") {
                let index = this.likedPosts.findIndex(
                  (post) => post.id === likedPostChange.id
                );
                Object.assign(this.likedPosts[index], likedPostChange);
              }
              if (likedChange.type === "removed") {
                let index = this.likedPosts.findIndex(
                  (post) => post.id === likedPostChange.id
                );
                this.likedPosts.splice(index, 1);
              }
            });
          });
        }
      });
    },
    followLabel(user) {
      if (user.following === undefined) {
        return "Follow";
      }
      if (user.followers === undefined) {
        return "Follow";
      }

      if (user.following[this.myID] && !user.followers[this.myID]) {
        return "Follow back";
      } else if (user.followers[this.myID]) {
        return "Unfollow";
      } else if (user.following[this.myID] === undefined) {
        return "Follow";
      } else if (user.followers[this.myID] === undefined) {
        return "Follow";
      } else {
        return "Follow";
      }
    },
    toggleFollow() {
      const followerID = auth.currentUser.uid;

      const username = window.location.href.split("profile/")[1];

      const dbProfile = getDatabase();
      const q = query(
        dbRef(dbProfile, "users"),
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
                    this.followed = !this.followed;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: true,
                    });
                    this.getFollows();
                  } else if (!info.followers[followerID]) {
                    this.followed = !this.followed;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: true,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: true,
                    });
                    this.getFollows();
                  } else {
                    this.followed = !this.followed;
                    this.followerCount = theirSnapshot.child("followers").size;
                    this.followingCount = theirSnapshot.child("following").size;

                    update(dbRef(database, "users/" + key), {
                      [`followers/${followerID}`]: null,
                    });

                    update(dbRef(database, "users/" + followerID), {
                      [`following/${key}`]: null,
                    });
                    this.getFollows();
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

      const dbProfile = getDatabase();
      const q = query(
        dbRef(dbProfile, "users"),
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
    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file.type.indexOf("image/") === -1) {
        alert("Please select an image file");
        return;
      }
      if (typeof FileReader === "function") {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.imgUrl = event.target.result;
          // rebuild cropperjs with the updated source
          this.dialogVisible = true;
        };
        reader.readAsDataURL(file);
      } else {
        alert("Sorry, FileReader API not supported");
      }
    },
    async onFilePicked() {
      const croppedCanvas = this.$refs.cropper[0]
        .getCroppedCanvas()
        .toDataURL();
      const currentUser = auth.currentUser;

      const fileRef = stRef(storage, "images/" + currentUser.uid);

      const snapshot = await uploadBytes(
        fileRef,
        this.dataURLtoBlob(croppedCanvas),
        { contentType: "image/png" }
      );

      const image = await getDownloadURL(fileRef);
      update(dbRef(database, "users/" + currentUser.uid), {
        image: image,
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
    cancelCrop() {
      this.dialogVisible = false;
    },
    dataURLtoBlob(dataURL) {
      const arr = dataURL.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch || mimeMatch.length < 2) {
        throw new Error("Invalid data URL format");
      }
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
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
    getProfileInfo() {
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
            this.admin = info.admin;
            this.theme = info.theme;
          });
          get(child(dbReff, `users/${key}`))
            .then((snapshotUser) => {
              if (snapshotUser.exists()) {
                let theUser = snapshotUser.val();
                theUser.id = snapshotUser.key;
                this.users.push(theUser);
                this.selectedUser = theUser;

                this.currUsername = snapshotUser.val().username;
                this.profileName = snapshotUser.val().displayName;
                this.image = snapshotUser.val().image;
                if (snapshotUser.val().verified !== undefined) {
                  this.isUserVerified = snapshotUser.val().verified;
                } else {
                  this.isUserVerified = false;
                }
                this.bio = snapshotUser.val().bio;
                if (snapshotUser.child("followers").size > 0) {
                  this.followerCount = snapshotUser.child("followers").size;
                } else {
                  this.followerCount = 0;
                }
                if (snapshotUser.child("following").size > 0) {
                  this.followingCount = snapshotUser.child("following").size;
                } else {
                  this.followingCount = 0;
                }
                if (theUser.status !== undefined) {
                  this.banned = theUser.status.banned;
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
    },
  },
});
</script>
<style lang="scss">
.postMenu {
  position: absolute;
  right: 10px;
  top: 0;
}

.postImage {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 300px;
  margin-bottom: 15px;
  padding-right: 35px;
  margin-top: 10px;
  display: flex;
}
.post-icons {
  align-items: center;
  padding: 0;
}
.postLikes {
  display: flex;
  position: absolute;
  font-size: 16px;
  color: grey;
  right: 35%;
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
  margin: 50px 0 0 30px;
}
.fields {
  margin-left: 30px;
  font-size: 12px;
}
.showIfNotYours {
  display: flex;
  height: 0;
  position: absolute;
  align-items: center;
  right: 7px;
  top: 27px;
}
.hideIfYours {
  display: none;
}
.showIfYours {
  display: flex;
  height: 0;
  position: absolute;
  align-items: center;
  right: 7px;
  top: 27px;
}
.hideIfNotYours {
  display: none;
}
.editProfileDark {
  color: $secondary;
  background-color: $grey-10;
}
.editProfileLight {
  color: $primary;
  background-color: $grey-11;
}
.messageDark {
  color: $secondary;
  background-color: $grey-10;
  margin-right: 5px;
}
.messageLight {
  color: $primary;
  background-color: $grey-11;
}
.postavatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.homePostAvatar {
  width: 50px;
  height: 50px;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.profileAvatar {
  margin: 15px;
  margin-left: 20px;
  margin-top: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  cursor: pointer;
  object-fit: cover;
}
.notYourAvatar {
  margin: 15px;
  margin-top: 20px;
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

.hashtag {
  color: rgb(255, 95, 95);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.blur {
  filter: blur(15px);
}
</style>
