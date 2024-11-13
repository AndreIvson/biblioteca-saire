const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
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
}

// Navegar entre páginas
ipcMain.on('navigate', (event, page) => {
  const filePath = path.join(__dirname, 'views', page);
  event.sender.loadFile(filePath);
});

ipcMain.on('adicionar-usuario', async (event, dados) => {
  try {
    const resultado = await adicionarUsuario(dados);
    event.reply('adicionar-usuario-resposta', { sucesso: true, id: resultado.id });
  } catch (error) {
    event.reply('adicionar-usuario-resposta', { sucesso: false, erro: error.message });
  }
});

// IPC para listar usuários
ipcMain.handle('listar-usuarios', async () => {
  try {
    const usuarios = await listarUsuarios();
    return usuarios;
  } catch (error) {
    console.error(error);
    return [];
  }
});

// IPC para obter detalhes do usuário
ipcMain.handle('obter-detalhes-usuario', async (event, id) => {
  try {
    const usuario = await obterDetalhesUsuario(id);
    return usuario;
  } catch (error) {
    console.error(error);
    return null;
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