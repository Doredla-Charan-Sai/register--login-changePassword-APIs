const express = require("express");
const app = express();

app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const path = require("path");
const dbpath = path.join(__dirname, "userData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDBAndServer();

// API 1

// scenario 1

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;

  const getQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbgetResponse = await db.get(getQuery);
  if (dbgetResponse === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const postQuery = `INSERT INTO user (username, name, password, gender, location) VALUES ('${username}', '${name}', '${hashPassword}', '${gender}', '${location}');`;
      await db.run(postQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// API 2

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const getAPI2Query = `SELECT * FROM user WHERE username LIKE '${username}';`;
  const dbAPI2User = await db.get(getAPI2Query);
  if (dbAPI2User === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      dbAPI2User.password
    );
    if (isPasswordMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// API 3

app.put("/change-password/", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const getUserQuery = `SELECT * FROM user WHERE username LIKE '${username}';`;
  const dbUserQuery = await db.get(getUserQuery);
  const oldPassMatched = await bcrypt.compare(
    oldPassword,
    dbUserQuery.password
  );
  if (oldPassMatched === true) {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const newPassEnc = await bcrypt.hash(newPassword, 10);
      const updateQuery = `UPDATE user SET password = '${newPassEnc}' WHERE username LIKE '${username}';`;
      await db.run(updateQuery);
      response.status(200);
      response.send("Password updated");
    }
  } else {
    response.status(400);
    response.send("Invalid current password");
  }
});

module.exports = app;
