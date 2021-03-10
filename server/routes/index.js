const express = require("express");
const router = express.Router();

// get home page
router.get("/", (req, res, next) => {
  res.send("Hello world");
});

module.exports = router;
