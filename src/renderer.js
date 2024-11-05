const { ipcRenderer } = require('electron');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

let books = []; // Armazenar os livros lidos do Excel
const itemsPerPage = 20;  // Ajuste o número de livros por página
let currentPage = 1;     // Página atual
let totalPages = 0;      // Total de páginas
const maxPagesToShow = 10; // Quantidade de páginas visíveis por vez (número limitado)
let currentRangeStart = 1;  // Faixa de início de páginas visíveis
let currentRangeEnd = maxPagesToShow;  // Faixa de término de páginas visíveis

// Variável para controlar o estado do carregamento de arquivos
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  const btnCadastro = document.getElementById('btnCadastro');
  const btnLista = document.getElementById('btnLista');
  const btnLivros = document.getElementById('btnLivros');
  const btnVoltar = document.getElementById('btnVoltar');
  const loadBooksButton = document.getElementById('loadBooks');
  const addLivro = document.getElementById('addLivro');

  // Navegação entre páginas
  if (btnCadastro) {
    btnCadastro.addEventListener('click', () => {
      ipcRenderer.send('navigate', 'cadastro.html');  // Envia para o main process
    });
  }

  if (btnLista) {
    btnLista.addEventListener('click', () => {
      ipcRenderer.send('navigate', 'lista.html');
    });
  }

  if (btnLivros) {
    btnLivros.addEventListener('click', () => {
      ipcRenderer.send('navigate', 'livros.html');
    });
  }

  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      ipcRenderer.send('navigate', 'index.html');
    });
  }

  if (addLivro) {
    addLivro.addEventListener('click', ()=> {
      ipcRenderer.send('navigate', 'livroform.html')
    } )
  }

  // Carregar lista de livros diretamente da pasta 'lista'
  if (loadBooksButton) {
    loadBooksButton.addEventListener('click', () => {
      // Se já está em carregamento, ignora o clique
      if (isLoading) return;

      // Marca como carregando
      isLoading = true;

      // Desabilitar o botão de carregar e mostrar "Carregando..."
      loadBooksButton.disabled = true;
      loadBooksButton.textContent = 'Carregando...';

      // Chama a função para buscar o arquivo de livros da pasta 'lista'
      loadBooksFromFile();
    });
  }
});

// Função para carregar e ler o arquivo Excel da pasta 'lista'
function loadBooksFromFile() {
  const booksDir = path.join(__dirname, '..', 'lista'); // Caminho da pasta 'lista'
  const filePath = path.join(booksDir, 'livros.xlsx'); // Caminho do arquivo a ser lido

  // Verifica se o arquivo existe na pasta 'lista'
  fs.exists(filePath, (exists) => {
    if (!exists) {
      resetButtonState();
      return;
    }

    // Lê o arquivo Excel da pasta 'lista'
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        alert('Não foi possível encontrar a aba de dados no arquivo Excel.');
        resetButtonState();
        return;
      }

      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Verifica se o conteúdo da aba não está vazio
      if (!sheetData || sheetData.length === 0) {
        alert('O arquivo está vazio ou não contém dados válidos.');
        resetButtonState();
        return;
      }

      books = sheetData; // Armazenar os livros
      totalPages = Math.ceil(books.length / itemsPerPage); // Calcular o total de páginas
      displayBooks(currentPage); // Exibir a primeira página de livros

      // Após carregar, reabilitar o botão e restaurar o texto
      resetButtonState();

    } catch (error) {
      console.error('Erro ao carregar o arquivo Excel:', error);
      alert('Erro ao processar o arquivo Excel.');
      resetButtonState();
    }
  });
}

// Função para restaurar o estado do botão
function resetButtonState() {
  const loadBooksButton = document.getElementById('loadBooks');
  loadBooksButton.disabled = false;
  loadBooksButton.textContent = 'Carregar Livros';

  // Finaliza o carregamento
  isLoading = false;
}

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
      <span class="book-title">Título: ${book.Titulo}<br></span>
      <span class="book-author">Autor: ${book.Autor}<br></span>
      <span class="book-quantity">Quantidade: ${book.Quantidade}<br></span>
      <span class="book-year">Ano: ${book.Ano}</span>
    `;
    bookListElement.appendChild(bookItem);
  });

  updatePagination();
}

// Função para adicionar o novo livro ao arquivo Excel
document.getElementById('saveBookButton').addEventListener('click', () => {
  const title = document.getElementById('bookTitle').value;
  const author = document.getElementById('bookAuthor').value;
  const quantity = document.getElementById('bookQuantity').value;
  const year = document.getElementById('bookYear').value;

  if (!title || !author || !quantity || !year) {
    alert('Todos os campos são obrigatórios!');
    return;
  }

  // Criar um objeto com os dados do livro
  const newBook = {
    Titulo: title,
    Autor: author,
    Quantidade: quantity,
    Ano: year
  };

  // Enviar os dados para o main process para salvar no Excel
  ipcRenderer.invoke('save-book', newBook);
});

// Função para atualizar a navegação de páginas
function updatePagination() {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = ''; // Limpa a navegação existente

  // Ajuste da faixa de páginas visíveis
  const rangeStart = Math.max(1, currentRangeStart);
  const rangeEnd = Math.min(totalPages, currentRangeEnd);

  // Criar botões de navegação dentro da faixa visível
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

  // Botões "Anterior" e "Próximo"
  const prevButton = document.createElement('button');
  prevButton.classList.add('page-btn');
  prevButton.textContent = '<';
  prevButton.addEventListener('click', () => {
    if (currentRangeStart > 1) {
      currentRangeStart -= maxPagesToShow;
      currentRangeEnd -= maxPagesToShow;
      displayBooks(currentPage); // Atualiza os livros para a nova faixa
    }
  });

  const nextButton = document.createElement('button');
  nextButton.classList.add('page-btn');
  nextButton.textContent = '>';
  nextButton.addEventListener('click', () => {
    if (currentRangeEnd < totalPages) {
      currentRangeStart += maxPagesToShow;
      currentRangeEnd += maxPagesToShow;
      displayBooks(currentPage); // Atualiza os livros para a nova faixa
    }
  });

  paginationElement.appendChild(prevButton);
  paginationElement.appendChild(nextButton);
}