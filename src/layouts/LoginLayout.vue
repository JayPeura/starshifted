<template>
  <q-layout view="lHh Lpr fFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <div class="leftDrawerBtn">
          <q-btn
            dense
            flat
            round
            icon="menu"
            class="leftDrawerBtn"
            @click="toggleLeftDrawer"
          />
        </div>

        <q-toolbar-title class="text-weight-bold">
          <span class="gt-sm">{{ $route.name }}</span>
          <img
            class="q-pa-md logo-middle header-icon lt-md"
            src="~assets/starshifted.png"
          />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="323"
    >
      <img
        v-if="$q.dark.isActive"
        class="logo-left"
        src="~assets/starshiftedWhite.png"
      />
      <img
        v-if="!$q.dark.isActive"
        class="logo-left"
        src="~assets/starshifted.png"
      /><q-badge outline color="blue" align="top" style="margin-top: 10px"
        >APLHA</q-badge
      >

      <q-list>
        <q-item to="/login/about" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="info"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">About & Rules</q-item-section>
        </q-item>
        <q-item @click="modeHandler()" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              size="md"
            />
          </q-item-section>

          <q-item-section class="text-h6">{{
            $q.dark.isActive ? "Light mode" : "Dark mode"
          }}</q-item-section>
        </q-item>
        <q-item to="/login" clickable v-ripple exact>
          <q-item-section avatar>
            <q-icon
              :color="$q.dark.isActive ? 'secondary' : 'primary'"
              name="lock"
              size="md"
            />
          </q-item-section>
          <q-item-section class="text-h6">Log in / Sign in</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import { useQuasar } from "quasar";
export default {
  // name: 'LayoutName',

  setup() {
    const leftDrawerOpen = ref(false);
    const $q = useQuasar();

    let value = localStorage.getItem("darkMode");
    $q.dark.set(JSON.parse(value) === true);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      modeHandler() {
        $q.dark.toggle();
        localStorage.setItem("darkMode", $q.dark.isActive);
      },
    };
  },
};
</script>
<style lang="scss">
a.q-router-link--active {
  color: inherit !important;
}

.logo-left {
  width: 4.5em;
  padding: 0.4em;
  margin-bottom: 2em;
}
.logo-middle {
  width: 3.5em;
  background-color: white;
  background-clip: content-box;
  border: 1 solid;
  border-radius: 2em;
}
.header-icon {
  position: absolute;
  top: -13px;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
}
@media screen and (min-width: 1024px) {
  .leftDrawerBtn {
    display: none;
  }
}
</style>
