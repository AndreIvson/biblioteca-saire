const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(process.resourcesPath, 'database', 'biblioteca.db')
  : path.join(__dirname, '..', 'database', 'biblioteca.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso!");
  }
});
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

function adicionarUsuario(dados) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const query = `INSERT INTO fichas (id, fullName, emailAddress, phoneNumber, profilePic, school, address, bookName, loanBookDate, returnBookDate) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [id, dados.fullName, dados.emailAddress, dados.phoneNumber, dados.profilePic, dados.school, dados.address, dados.bookName, dados.loanBookDate, dados.returnBookDate], function (err) {
      if (err) reject(err);
      else resolve({ id, ...dados });
    });
  });
}

function editarUsuario(updatedUser) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE fichas 
      SET 
        fullName = ?, 
        emailAddress = ?, 
        phoneNumber = ?, 
        school = ?, 
        address = ?, 
        bookName = ?, 
        loanBookDate = ?, 
        returnBookDate = ? 
      WHERE id = ?
    `;
    const params = [
      updatedUser.fullName,
      updatedUser.emailAddress,
      updatedUser.phoneNumber,
      updatedUser.school,
      updatedUser.address,
      updatedUser.bookName,
      updatedUser.loanBookDate,
      updatedUser.returnBookDate,
      updatedUser.id,
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('Erro ao atualizar usuário:', err);
        reject({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

function excluirUsuario(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM fichas WHERE id = ?`;
    db.run(sql, [id], function (err) {
      if (err) {
        console.error('Erro ao excluir usuário:', err);
        reject({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

function listarUsuarios() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, fullName, emailAddress FROM fichas`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function obterDetalhesUsuario(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM fichas WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

module.exports = {
  adicionarUsuario,
  editarUsuario,
  excluirUsuario,
  listarUsuarios,
  obterDetalhesUsuario,
  db,
};