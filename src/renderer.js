const { ipcRenderer } = require('electron');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

let books = [];
const itemsPerPage = 12;
let currentPage = 1;
let totalPages = 0;
const maxPagesToShow = 10;

document.addEventListener('DOMContentLoaded', () => {
  setupNavigationButtons();
  setupLoadBooksButton();
  listarUsuarios();
});

function setupNavigationButtons() {
  document.getElementById('go-to-cadastro')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'cadastro.html');
  });

  document.getElementById('go-to-lista')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'lista.html');
  });

  document.getElementById('go-to-livros')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'livros.html');
  });
}

function setupLoadBooksButton() {
  const loadBooksButton = document.getElementById('loadBooks');
  if (loadBooksButton) {
    loadBooksButton.addEventListener('click', () => {
      loadBooksFromFile();
    });
  }
}

function listarUsuarios() {
  const lista = document.getElementById('listaUsuarios');
  lista.innerHTML = ''; 

  usuarios.forEach((usuario) => {
    const li = document.createElement('li');
    li.textContent = `ID: ${usuario.id}, Nome: ${usuario.fullName}, Email: ${usuario.emailAddress}`;
    li.addEventListener('click', () => mostrarDetalhesUsuario(usuario.id));
    lista.appendChild(li);
  });
}

function loadBooksFromFile() {
  const booksDir = path.join(__dirname, '..', 'lista');
  const filePath = path.join(booksDir, 'livros.xlsx');

  if (!fs.existsSync(filePath)) {
    alert('Arquivo de livros não encontrado!');
    return;
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData || sheetData.length === 0) {
      alert('Não há livros para carregar.');
      return;
    }

    books = sheetData;
    totalPages = Math.ceil(books.length / itemsPerPage);
    displayBooks(currentPage);
  } catch (error) {
    console.error('Erro ao carregar o arquivo Excel:', error);
    alert('Erro ao processar o arquivo Excel.');
  }
}

function excelDateToJSDate(excelDate) {
  const baseDate = new Date(1899, 11, 31);
  const jsDate = new Date(baseDate.getTime() + excelDate * 24 * 60 * 60 * 1000);
  
  const day = String(jsDate.getDate()).padStart(2, '0');
  const month = String(jsDate.getMonth() + 1).padStart(2, '0');
  const year = jsDate.getFullYear();
  
  return `${day}/${month}/${year}`;
}

const valorOuVazio = (valor) => valor == null ? '' : valor;

function displayBooks(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const booksToDisplay = books.slice(startIndex, endIndex);

  const bookListElement = document.getElementById('bookList');
  bookListElement.innerHTML = '';

  booksToDisplay.forEach(book => {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.innerHTML = `
      <span class="book-data">Data: ${valorOuVazio(isNaN(book.Data) ? book.Data : excelDateToJSDate(book.Data))}</span><br>
      <span class="book-id">Id: ${valorOuVazio(book.id)}</span><br>
      <span class="book-autor">Autor: ${valorOuVazio(book.Autor)}</span><br>
      <span class="book-titulo">Titulo: ${valorOuVazio(book.Titulo)}</span><br>
      <span class="book-volume">Volume: ${valorOuVazio(book.Volume)}</span><br>
      <span class="book-editora">Editora: ${valorOuVazio(book.Editora)}</span><br>
      <span class="book-local">Local: ${valorOuVazio(book.Local)}</span><br>
      <span class="book-ano">Ano: ${valorOuVazio(book.Ano)}</span><br>
      <span class="book-origem">Origem: ${valorOuVazio(book.Origem)}</span><br>
      <span class="book-obs">Obs: ${valorOuVazio(book.Obs)}</span>
    `;
    bookListElement.appendChild(bookItem);
  });

  updatePagination();
}

function updatePagination() {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = '';

  const totalPageCount = Math.ceil(books.length / itemsPerPage);
  const rangeStart = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const rangeEnd = Math.min(totalPageCount, rangeStart + maxPagesToShow - 1);

  for (let i = rangeStart; i <= rangeEnd; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('page-btn');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayBooks(currentPage);
    });

    if (i === currentPage) {
      pageButton.disabled = true;
    }

    paginationElement.appendChild(pageButton);
  }

  const prevButton = document.createElement('button');
  prevButton.classList.add('page-btn');
  prevButton.textContent = '<';
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayBooks(currentPage);
    }
  });

  const nextButton = document.createElement('button');
  nextButton.classList.add('page-btn');
  nextButton.textContent = '>';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPageCount) {
      currentPage++;
      displayBooks(currentPage);
    }
  });

  paginationElement.prepend(prevButton);
  paginationElement.append(nextButton);
}
