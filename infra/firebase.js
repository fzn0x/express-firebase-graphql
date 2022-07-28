const firebase = require("firebase-admin");

if (
  process?.env?.APP_MODE?.toString()?.toLowerCase() === "dev" ||
  process?.env?.APP_MODE?.toString()?.toLowerCase() == "development"
) {
  firebase.initializeApp({
    credential: firebase.credential.cert(
      require(process?.env?.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
    ),
  });
} else {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: process?.env?.FIREBASE_PROJECT_ID,
      clientEmail: process?.env?.FIREBASE_CLIENT_EMAIL,
      privateKey: process?.env?.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
    databaseURL: process?.env?.FIREBASE_DATABASE_URL,
  });
}

module.exports = firebase;
