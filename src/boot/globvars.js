import { boot } from "quasar/wrappers";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
  app.config.globalProperties.APP_NAME = "Starshifted";
  app.config.globalProperties.globalLikeVariable = 1;
  app.config.globalProperties.globalTrendingTopicThreshold = 2;

  app.config.globalProperties.getThemeColour = function (theme) {
    switch (theme) {
      case "red":
        return { bg: "#ff6650", txt: "#ffffff", mild: "#ff4a4a" };
      case "blue":
        return { bg: "#2255ff", txt: "#ffffff", mild: "#92b9e4" };
      case "purple":
        return { bg: "#aa22ff", txt: "#ffffff", mild: "#d085fe" };
      case "yellow":
        return { bg: "#ffee22", txt: "#000000", mild: "#ffff64" };
      case "green":
        return { bg: "#22ff55", txt: "#000000", mild: "#b0ff62" };
      case "pink":
        return { bg: "#ff88b1", txt: "#ffffff", mild: "#ffb2cc" };
      default:
        return "";
    }
  };

  app.config.globalProperties.getThemeOptions = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "pink", label: "Pink" },
    { value: "purple", label: "Purple" },
    { value: "", label: "None (default, need refresh after change)" },
  ];

  app.config.globalProperties.getTopicPosts = function (text) {
    if (text.toLowerCase() === "toodaloo") {
      return "Toodaloo you say?";
    }
  };
});
