// If you are using the GCP API Gateway you can do the authentication part in infrastructure level.
// no need to using firebase in cloud run business logic layer
module.exports = (firebase) => {
  return function firebaseAuthMiddleware(req, res, next) {
    const authorization =
      req.header("x-forwarded-authorization") ||
      req.header("Authorization") ||
      req.header("authorization");
    if (authorization) {
      let token = authorization.split(" ");
      firebase
        .auth()
        .verifyIdToken(token[1])
        .then((decodedToken) => {
          res.locals.user = decodedToken;
          next();
        })
        .catch((err) => {
          res.status(401).json({
            message: "Token is invalid.",
            error: err,
          });
        });
    } else {
      res.status(401).json({
        message: "Authorization header is not found.",
      });
    }
  };
};
