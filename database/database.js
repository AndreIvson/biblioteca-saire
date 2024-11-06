const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/biblioteca.db');
const { v4: uuidv4 } = require('uuid');

// Criação da tabela
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

// Função para adicionar um usuário
function adicionarUsuario(dados) {
  return new Promise((resolve, reject) => {
    const id = uuidv4(); // Gera o UUID
    const query = `INSERT INTO fichas (id, fullName, emailAddress, phoneNumber, profilePic, school, address, bookName, loanBookDate, returnBookDate) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [id, dados.fullName, dados.emailAddress, dados.phoneNumber, dados.profilePic, dados.school, dados.address, dados.bookName, dados.loanBookDate, dados.returnBookDate], function (err) {
      if (err) reject(err);
      else resolve({ id, ...dados });
    });
  });
}

// Função para editar um usuário
function editarUsuario(id, dados) {
  return new Promise((resolve, reject) => {
    const query = `UPDATE fichas SET fullName = ?, emailAddress = ?, phoneNumber = ?, profilePic = ?, school = ?, address = ?, bookName = ?, loanBookDate = ?, returnBookDate = ? WHERE id = ?`;
    db.run(query, [dados.fullName, dados.emailAddress, dados.phoneNumber, dados.profilePic, dados.school, dados.address, dados.bookName, dados.loanBookDate, dados.returnBookDate, id], function (err) {
      if (err) reject(err);
      else resolve({ id, ...dados });
    });
  });
}

// Função para excluir um usuário
function excluirUsuario(id) {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM fichas WHERE id = ?`;
    db.run(query, [id], function (err) {
      if (err) reject(err);
      else resolve({ id });
    });
  });
}

module.exports = {
  adicionarUsuario,
  editarUsuario,
  excluirUsuario,
};
