const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/biblioteca.db');
const { v4: uuidv4 } = require('uuid');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS fichas (
    id TEXT PRIMARY KEY,
    fullName TEXT,
    emailAddress TEXT,
    phoneNumber TEXT,
    profilePic TEXT,
    school TEXT,
    address TEXT,
    bookName TEXT,
    loanBookDate TEXT,
    returnBookDate TEXT
  )`);
});

module.exports = db;