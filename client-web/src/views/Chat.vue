<template>
  <div class="chat">
    <div class="messages">
      <div v-for="(history, index) in histories" v-bind:key="index">
        <div
          class="border rounded-2 my-2 p-2"
          v-bind:class="{
            self: history.user == router.currentRoute.params.name,
            'not-self': history.user != router.currentRoute.params.name && history.user !== '', system: history.user == ''
          }"
        >
          <div
            class="small text-capitalize"
            v-bind:class="{
              'text-right': history.user == router.currentRoute.params.name,
              'text-left': history.user != router.currentRoute.params.name && history.user !== '', system: history.user == ''
            }"
          >
            {{ history.user }}
          </div>
          <div
            class="message"
            v-bind:class="{
              'text-right': history.user == router.currentRoute.params.name,
              'text-left': history.user != router.currentRoute.params.name && history.user !== '', system: history.user == '',
            }"
          >
            {{ history.text }}
          </div>
          <div
            class="small"
            v-bind:class="{
              'text-right': history.user == router.currentRoute.params.name,
              'text-left': history.user != router.currentRoute.params.name && history.user !== '', system: history.user == ''
            }"
          >
            {{ history.timestamp }}
          </div>
        </div>
      </div>
    </div>
    <div class="chat-box fixed-bottom py-2">
      <b-form @submit="onSubmit">
        <b-container fluid>
          <b-row align-v="stretch">
            <b-col>
              <b-button
                v-b-toggle.searchSidebar
                class="send-btn"
                variant="outline-light"
              >
                <b-icon-list></b-icon-list>
              </b-button>
            </b-col>
            <b-col cols="10">
              <b-form-textarea
                id="input-message"
                v-model="message"
                placeholder="Type something..."
                required
                autofocus
                size="sm"
              ></b-form-textarea>
            </b-col>
            <b-col>
              <b-button
                class="send-btn"
                type="submit"
                variant="outline-light"
                block
              >
                <b-icon-arrow-return-left></b-icon-arrow-return-left>
              </b-button>
            </b-col>
          </b-row>
        </b-container>
      </b-form>
      <b-sidebar id="searchSidebar" title="Search history" shadow>
        <div class="px-2">
          <b-form @submit="searchMesage">
            <b-container fluid>
              <b-row align-v="stretch">
                <b-col cols="9">
                  <b-form-input
                    class="mb-2 mr-sm-2 mb-sm-0"
                    id="searchInput"
                    v-model="searchParam"
                    placeholder="Search by message"
                    required
                  ></b-form-input>
                </b-col>
                <b-col>
                  <b-button type="submit" variant="outline-success" block>
                    <b-icon-search></b-icon-search>
                  </b-button>
                </b-col>
              </b-row>
            </b-container>
          </b-form>
        </div>
        <div class="px-2">
          <div
            class="text-left"
            v-for="(result, index) in searchResults"
            v-bind:key="index"
          >
            <hr />
            <p class="small">{{ result.user }} - {{ result.timestamp }}</p>
            <p class="message">{{ result.text }}</p>
            <hr />
          </div>
        </div>
        <template #footer>
          <b-button class="mx-auto my-2 w-75" type="submit" variant="outline-danger" block v-on:click="leaveChat">
            Leave chat</b-button
          >
          <b-button class="mx-auto my-2 w-75" type="submit" variant="outline-danger" block v-on:click="clearHistory">
            <b-icon-trash></b-icon-trash>
            Clear History</b-button
          >
        </template>
      </b-sidebar>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import router from "../router";
import history from "../../../data/history.json";

const socket = io("http://localhost:3000", {
  extraHeaders: {
    "chat-tunnel": "chat",
  },
});

const callback = (err) => alert(err);

socket.on("connect", () => {
  socket.emit("check", router.currentRoute.params.name, (response) => {
    // redirect to Join view if not valid
    if (!response) {
      router.push("/", (err) => console.error(err));
    }
  });
});

export default {
  name: "Chat",
  data() {
    return {
      message: "",
      histories: history,
      router,
      searchParam: "",
      searchResults: [],
    };
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();
      // send message
      const form = {
        userName: router.currentRoute.params.name,
        message: this.message,
      };
      socket.emit("chatMessage", form, callback);
    },
    searchMesage(event) {
      event.preventDefault();
      this.searchResults = this.histories.filter((history) => {
        const text = history.text || "";
        return text.includes(this.searchParam);
      });
    },
    leaveChat() {
      socket.emit('manual-disconnect', router.currentRoute.params.name);
      router.push('/', (err) => console.error(err))
    },
    clearHistory() {
      socket.emit('clearHistory')
    }
  },
};
</script>

<style>
.chat-box {
  background-color: #adb4cc;
}
.system {
  float: left;
  clear: both;
  background-color: #9be0ad;
  margin-left: 10px;
}
.not-self {
  float: left;
  clear: both;
  background-color: #fff6a8;
  margin-left: 10px;
}
.self {
  float: right;
  clear: both;
  background-color: #d8d7de;
  margin-right: 10px;
}
.messages {
  width: 100%;
  position: fixed;
  overflow-y: scroll;
  top: 0;
  left: 0;
  bottom: 75px;
}
.small {
  font-size: smaller;
}
.message {
  font-size: 1.2em;
  white-space: pre-line;
}
.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}
.chat-bar {
  box-sizing: border-box;
}
.send-btn {
  height: 100%;
  width: 100%;
}
</style>
