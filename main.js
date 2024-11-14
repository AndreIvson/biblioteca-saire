const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { adicionarUsuario, listarUsuarios, obterDetalhesUsuario } = require('./database/database');

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
  win.webContents.openDevTools();
}

// Navegar entre páginas
ipcMain.on('navigate', (event, page) => {
  const filePath = path.join(__dirname, 'views', page);
  event.sender.loadFile(filePath);
});

// IPC para adicionar usuário com verificação de imagem
ipcMain.handle('adicionar-usuario', async (event, dados) => {
  try {
    if (dados.profilePic) {
      const safeName = dados.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const imagePath = path.join(__dirname, 'fotos_perfil', `${safeName}.png`);
      const base64Data = dados.profilePic.replace(/^data:image\/png;base64,/, "");

      if (!fs.existsSync(path.join(__dirname, 'fotos_perfil'))) {
        fs.mkdirSync(path.join(__dirname, 'fotos_perfil'));
      }

      fs.writeFileSync(imagePath, base64Data, 'base64');
      dados.profilePic = imagePath;
    }

    const usuarioAdicionado = await adicionarUsuario(dados);
    return { sucesso: true, usuario: usuarioAdicionado };
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return { sucesso: false, erro: error.message };
  }
});

// IPC para listar usuários
ipcMain.handle('listar-usuarios', async () => {
  try {
    return await listarUsuarios();
  } catch (error) {
    console.error(error);
    return [];
  }
});

// IPC para obter detalhes do usuário
ipcMain.handle('obter-detalhes-usuario', async (event, id) => {
  try {
    return await obterDetalhesUsuario(id);
  } catch (error) {
    console.error(error);
    return null;
  }
});

// Listar livros
ipcMain.handle('listar-livros', async () => {
  try {
    const livros = await listarLivros(); // Função para listar livros do banco
    return livros;
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return [];
  }
});

// Fechar a aplicação quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow);
