const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists and is verified
  if (token) {
    jwt.verify(token, "mediconnect sneaky secret", (err, decodedToken) => {
      if (err) {
        // console.log(err.message);
        res.status(400).json({ message: "Token not valid" });
      } else {
        // console.log(decodedToken);
        next();
      }
    });
  } else {
    res.status(400).json({ message: "Token not valid" });
  }
};

// // check current user
// const checkUser = (req, res, next) => {
//   const token = req.cookies.jwt;

//   if (token) {
//     jwt.verify(
//       token,
//       "mediconnect sneaky secret",
//       async (err, decodedToken) => {
//         if (err) {
//           console.log(err.message);
//           res.locals.user = null;
//           next();
//         } else {
//           console.log(decodedToken);
//           let user = await User.findById(decodedToken.id);
//           res.locals.user = user;
//           next();
//         }
//       }
//     );
//   } else {
//     res.locals.user = null;
//     next();
//   }
// };

module.exports = { requireAuth };
