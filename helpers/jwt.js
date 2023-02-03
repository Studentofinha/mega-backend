const expressJwt = require("express-jwt");

function authJwt(roles = []) {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  if (typeof roles === "string") {
    roles = [roles];
  }

  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      
      `${api}/users/login`,
      `${api}/users/register`,
    
      // {url:/(.*)/}
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!(payload.isAdmin)) {
    done(null, true);
  }
  done();
}

module.exports = authJwt;
