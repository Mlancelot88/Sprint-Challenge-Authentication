// ---- Node Dependencies ----
const axios = require("axios");
const bcrypt = require("bcryptjs");
const db = require("../database/dbConfig.js");
const { authenticate, generateToken } = require("./middlewares");

// ---- API Endoints for Testing ----
module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

// ---- User Registration ----
function register(req, res) {
  // implement user registration
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 14);
  user.password = hash;
  db("users")
    .insert(user)
    .then(ids => {
      const id = ids[0];
      return res.status(201).json({ newUserId: id });
    })
    .catch(err =>
      res
        .status(500)
        .json({ Error: "Server can not process registration request." })
    );
}

// ---- User Login ----
function login(req, res) {
  // implement user login
  const credentials = req.body;
  db("users")
    .where({ username: credentials.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(credentials.password, user.password)) {
        const token = generateToken({ username: user.username });
        return res.status(200).json({ Welcome: user.username, token });
      }
      return res.status(401).json({ Message: "You shall not pass!" });
    })
    .catch(err =>
      res.status(500).json({ Error: "Server timeout. Unable to login." })
    );
}

function getJokes(req, res) {
  axios
    .get(
      "https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten"
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
