import { createStore } from "vuex";

import global from "./global";
import sdk from "./sdk";
import server from "./server";
import channel from "./channel";
import user from "./user";

const store = createStore({
  ...global,
  modules: {
    sdk,
    server,
    channel,
    user,
  },
});

export default store;
