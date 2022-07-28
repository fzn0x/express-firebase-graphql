import { createApp } from "vue";
import { initializeApp } from "firebase/app";
import App from "./App.vue";

import projectConfig from "./config/firebase.json";

createApp(App).mount("#app");

initializeApp(projectConfig);
