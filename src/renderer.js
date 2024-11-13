const { ipcRenderer } = require('electron');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

let books = []; // Armazenar os livros lidos do Excel
const itemsPerPage = 12;  // Limita a quantidade de livros por página
let currentPage = 1;      // Página atual
let totalPages = 0;       // Total de páginas
const maxPagesToShow = 10; // Quantidade de páginas visíveis por vez

document.addEventListener('DOMContentLoaded', () => {
  // Funções que manipulam os cliques nos botões de navegação
  document.getElementById('go-to-cadastro')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'cadastro.html');  // Navega para o cadastro
  });

  document.getElementById('go-to-lista')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'lista.html');  // Navega para a lista de usuários
  });

  document.getElementById('go-to-livros')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'livros.html');  // Navega para a lista de livros
  });

  document.getElementById('go-back')?.addEventListener('click', () => {
    ipcRenderer.send('navigate', 'index.html');
  })

  // Ao carregar os livros
  const loadBooksButton = document.getElementById('loadBooks');
  if (loadBooksButton) {
    loadBooksButton.addEventListener('click', () => {
      loadBooksFromFile();
    });
  }
});

listarUsuarios((usuarios) => {
  const lista = document.getElementById('listaUsuarios');
  lista.innerHTML = ''; // Limpa a lista antes de adicionar os itens

  usuarios.forEach((usuario) => {
    const li = document.createElement('li');
    li.textContent = `ID: ${usuario.id}, Nome: ${usuario.fullName}, Email: ${usuario.emailAddress}`;
    
    // Adiciona o evento de clique para abrir o modal com os detalhes
    li.addEventListener('click', () => mostrarDetalhesUsuario(usuario.id));
    lista.appendChild(li);
  });
});

// Função para carregar e ler o arquivo Excel da pasta 'lista'
function loadBooksFromFile() {
  const booksDir = path.join(__dirname, '..', 'lista');  // Caminho da pasta 'lista'
  const filePath = path.join(booksDir, 'livros.xlsx');  // Caminho do arquivo a ser lido

  // Verifica se o arquivo existe
  if (!fs.existsSync(filePath)) {
    alert('Arquivo de livros não encontrado!');
    return;
  }

  // Lê o arquivo Excel da pasta 'lista'
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];  // Nome da primeira aba
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData || sheetData.length === 0) {
      alert('Não há livros para carregar.');
      return;
    }

    books = sheetData;
    totalPages = Math.ceil(books.length / itemsPerPage); // Calcula o total de páginas
    displayBooks(currentPage);  // Exibe a primeira página de livros
  } catch (error) {
    console.error('Erro ao carregar o arquivo Excel:', error);
    alert('Erro ao processar o arquivo Excel.');
  }
}

// Função para converter data no formato de série numérica do Excel para DD/MM/AAAA
function excelDateToJSDate(excelDate) {
  // A data de base para o Excel é 1 de janeiro de 1900
  const baseDate = new Date(1899, 11, 31); // 30 de dezembro de 1899 é o ponto inicial correto

  // Adiciona o número de dias do Excel à data base
  const jsDate = new Date(baseDate.getTime() + excelDate * 24 * 60 * 60 * 1000);
  
  const day = String(jsDate.getDate()).padStart(2, '0');
  const month = String(jsDate.getMonth() + 1).padStart(2, '0');
  const year = jsDate.getFullYear();
  
  return `${day}/${month}/${year}`;
}


const valorOuVazio = (valor) => valor == null ? '' : valor;

// Função para exibir os livros com base na página atual
function displayBooks(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const booksToDisplay = books.slice(startIndex, endIndex);

  const bookListElement = document.getElementById('bookList');
  bookListElement.innerHTML = ''; // Limpa os livros exibidos

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

  updatePagination();  // Atualiza os botões de navegação
}

// Função para atualizar a navegação de páginas
function updatePagination() {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = ''; // Limpa a navegação existente

  // Calcula o número de páginas que precisam ser exibidas
  const totalPageCount = Math.ceil(books.length / itemsPerPage);

  // Calcula a faixa de páginas visíveis
  const rangeStart = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const rangeEnd = Math.min(totalPageCount, rangeStart + maxPagesToShow - 1);

  // Criar os botões de páginas na faixa visível
  for (let i = rangeStart; i <= rangeEnd; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('page-btn');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayBooks(currentPage);
    });

    if (i === currentPage) {
      pageButton.disabled = true;  // Desabilita o botão da página atual
    }

    paginationElement.appendChild(pageButton);
  }

  // Botões "Anterior" e "Próximo"
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

  paginationElement.appendChild(prevButton);
  paginationElement.appendChild(nextButton);
}
