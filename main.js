const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');
const db = require('./database/database.js')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'), // Arquivo renderer.js para o preload
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.setMenu(null); // Desativa o menu padrão do Electron
  win.loadFile(path.join(__dirname, 'views', 'index.html')); // Carrega a página inicial
}

// Navegar entre páginas
ipcMain.on('navigate', (event, page) => {
  const filePath = path.join(__dirname, 'views', page);
  event.sender.loadFile(filePath);
});

// Adicionar novo livro ao arquivo Excel
ipcMain.handle('save-book', async (event, newBook) => {
  try {
    const booksDir = path.join(__dirname, 'lista');
    const filePath = path.join(booksDir, 'livros.xlsx');

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      alert('Arquivo de livros não encontrado!');
      return;
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(sheet);

    // Adiciona o novo livro
    sheetData.push(newBook);

    // Atualiza o arquivo
    const updatedSheet = xlsx.utils.json_to_sheet(sheetData);
    workbook.Sheets[sheetName] = updatedSheet;
    xlsx.writeFile(workbook, filePath);

    alert('Livro adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar o livro:', error);
    alert('Erro ao salvar o livro. Tente novamente.');
  }
});

// Fechar a aplicação quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Criar a janela principal
app.whenReady().then(createWindow);