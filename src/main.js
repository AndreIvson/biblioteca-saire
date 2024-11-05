const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');


ipcMain.handle('save-book', async (event, newBook) => {
  try {
    const booksDir = path.join(__dirname, 'lista');
    const filePath = path.join(booksDir, 'livros.xlsx');

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      alert('Arquivo de livros não encontrado!');
      return;
    }

    // Ler o arquivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Converter a aba para um array de objetos
    const sheetData = xlsx.utils.sheet_to_json(sheet);

    // Adicionar o novo livro aos dados existentes
    sheetData.push(newBook);

    // Atualizar o conteúdo da planilha com os novos dados
    const updatedSheet = xlsx.utils.json_to_sheet(sheetData);
    workbook.Sheets[sheetName] = updatedSheet;

    // Escrever o arquivo de volta ao disco
    xlsx.writeFile(workbook, filePath);

    // Avisar que o livro foi salvo com sucesso
    alert('Livro adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar o livro:', error);
    alert('Erro ao salvar o livro. Tente novamente.');
  }
});

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

// Evento para navegação entre páginas
ipcMain.on('navigate', (event, page) => {
  // Define o caminho da página para carregar
  const filePath = path.join(__dirname, 'views', page);
  
  // Carrega a nova página na janela
  event.sender.loadFile(filePath);
});

// Lidar com o diálogo de abertura de arquivos (para carregar o Excel)
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
  });

  // Retorna o caminho do arquivo selecionado ou null se nenhum arquivo for escolhido
  return result.filePaths[0];
});

// Criar a janela principal quando o Electron estiver pronto
app.whenReady().then(createWindow);

// Fechar a aplicação quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});