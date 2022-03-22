<template>
  <div class="join-form h-100">
    <b-form @submit="onSubmit">
      <h2>お名前をご入力ください</h2>
      <div class="mb-3">
        <input
          class="form-control"
          type="text"
          id="nameInput"
          placeholder="お名前をご入力ください"
          v-model="form.name"
          required
        />
      </div>
      <b-button class="w-100" variant="outline-success" type="submit"
        >入る</b-button
      >
    </b-form>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import router from "../router"

const socket = io("http://localhost:3000", {
  extraHeaders: {
    "chat-tunnel": "connect"
  }
});

export default {
  name: "Landing",
  data() {
    return {
      form: {
        name: "",
      },
    };
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();
      socket.emit('join', this.form, response => {
        if (response.error) {
          alert(response.error)
        } else {
          router.push(`/${response.name}`);
        }
      });
    },
  },
};
</script>
<style>
.join-form {
  display: flex;
  align-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  justify-content: center;
}
</style>
