require("dotenv").config();
const cors = require("cors");
const express = require("express");
const expressRateLimit = require("express-rate-limit");
const rateLimit = expressRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: async (req, res) => {
    return 100;
  },
  message: "You have exceeded the 100 requests in 24 hrs limit!",
  standardHeaders: true,
  legacyHeaders: false,
});
const { graphqlHTTP } = require("express-graphql");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./api.yaml");

const firebase = require("./infra/firebase");
const schema = require("./src/schema");
const firebaseAuthMiddleware = require("./middleware/firebase-auth.middleware")(
  firebase
);

app.get("/api-user", rateLimit, (req, res) => {
  // fix error from ?next[]= and ?next[length]=
  req.query.next = (req.query.next || "").toString();

  firebase
    .auth()
    .listUsers(25, req.query.next || undefined)
    .then((listUsersResult) => {
      if (listUsersResult.users.length)
        return res.json({
          data: {
            previousPageToken: req.query.next || null,
            users: listUsersResult.users.map((user) => {
              return {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                passwordHash: user.passwordHash,
                metadata: user.metadata,
              };
            }),
            nextPageToken: listUsersResult.pageToken || null,
          },
        });

      return res.json({
        data: {
          previousPageToken: null,
          users: [],
          nextPageToken: null,
        },
      });
    })
    .catch((error) => {
      console.log("Error listing users:", error);
    });
});

// CORS
const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Swagger Based API Docs
app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/ping", (_, res) => {
  res.send(`PONG`);
});

app.post("/signup", async (req, res) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password,
    };
    const userResponse = await firebase.auth().createUser({
      email: user?.email,
      password: user?.password,
      emailVerified: false,
      disabled: false,
    });
    res.json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message, error: err });
  }
});

app.use("/", firebaseAuthMiddleware);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

const port = parseInt(process?.env?.PORT) || 8000;
app.listen(port, () => {
  console.log(`Backend API: Listening on port ${port}`);
});
