<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p class="lead mt-2">{{ authStatus }}</p>
    <div class="d-flex my-4 justify-content-center">
      <input type="email" v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
    </div>
    <div class="d-flex my-4 justify-content-center">
      <button @click="signIn" class="btn btn-outline-primary mx-4">
        Sign In >
      </button>
      <button @click="signUp" class="btn btn-outline-primary mx-4">
        Sign Up >
      </button>
      <button @click="sendRequest" class="btn btn-outline-success mx-4">
        Send Request >
      </button>
      <button @click="signOut" class="btn btn-outline-danger mx-4">
        Sign Out >
      </button>
      <button @click="ping" class="btn btn-outline-danger mx-4">PING ></button>
    </div>
    <p class="lead">{{ response }}</p>
  </div>
</template>

<script>
import axios from "axios";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

const client = axios.create({
  baseURL: "https://kozo-api-96qz20bh.uc.gateway.dev",
  json: true,
});

export default {
  name: "HelloWorld",
  data: function () {
    return {
      response: "No data yet...",
      authStatus: "No Auth Status",
      email: "wow@gmail.com",
      password: "wow123",
    };
  },
  props: {
    msg: String,
  },
  methods: {
    ping() {
      client({
        method: "post",
        url: "/ping",
      })
        .then((res) => {
          this.response = res.data;
        })
        .catch((error) => {
          this.response = error;
        });
    },
    sendRequest() {
      const auth = getAuth();
      if (auth.currentUser) {
        auth.currentUser
          .getIdToken(true)
          .then((idToken) => {
            client({
              method: "POST",
              url: "/graphql",
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              data: JSON.stringify({
                operationName: "GetRawAxies",
                variables: {
                  source: "bot",
                  from: 0,
                  limit: 20,
                },
                query:
                  "query GetRawAxies (    $source: String    $from: Int    $limit: Int    ) { axies (    source: $source        from: $from    limit: $limit) {    axie_account_address    } }",
              }),
            })
              .then((res) => {
                this.response = res.data;
              })
              .catch((error) => {
                this.response = error;
              });
          })
          .catch((error) => {
            this.response = "Error getting auth token";
          });
      }
    },
    signIn() {
      const auth = getAuth();

      signInWithEmailAndPassword(auth, this.email, this.password)
        .then(() => {
          this.authStatus = "Authorized";
        })
        .catch((err) => {
          this.authStatus = err;
        });
    },
    signUp() {
      client({
        method: "POST",
        url: "/signup",
        headers: {
          "content-type": "application/json",
        },
        data: {
          email: this.email,
          password: this.password,
        },
      })
        .then((res) => {
          this.response = "Sign up successful!";
        })
        .catch((error) => {
          this.response = error.response.data;
        });
    },
    signOut() {
      const auth = getAuth();

      signOut(auth)
        .then(() => {
          this.authStatus = "Unauthorized";
        })
        .catch((err) => {
          this.authStatus = err;
        });
    },
  },
};
</script>
