const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { adicionarUsuario, listarUsuarios, obterDetalhesUsuario, editarUsuario, excluirUsuario } = require('./database/database');
const sqlite3 = require('sqlite3').verbose();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'views', 'index.html'));
}

ipcMain.on('navigate', (event, page) => {
  const filePath = path.join(__dirname, 'views', page);
  event.sender.loadFile(filePath);
});

ipcMain.handle('adicionar-usuario', async (event, dados) => {
  try {
    if (dados.profilePic) {
      const safeName = dados.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

      const imageName = `${safeName}-${formattedDate}.png`;

      const imagePath = path.join(__dirname, 'fotos_perfil', imageName);
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

ipcMain.handle('editar-usuario', async (event, updatedUser) => {
  try {
    const result = await editarUsuario(updatedUser);
    return result;
  } catch (error) {
    console.error('Erro no IPC editar-usuario:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('excluir-usuario', async (event, userId) => {
  try {
    const result = await excluirUsuario(userId);
    if (result) {
      return { success: true };
    } else {
      throw new Error('Erro ao excluir o usuário');
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('listar-usuarios', async () => {
  try {
    return await listarUsuarios();
  } catch (error) {
    console.error(error);
    return [];
  }
});

ipcMain.handle('obter-detalhes-usuario', async (event, id) => {
  try {
    return await obterDetalhesUsuario(id);
  } catch (error) {
    console.error(error);
    return null;
  }
});

ipcMain.handle('listar-livros', async () => {
  try {
    const livros = await listarLivros();
    return livros;
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    return [];
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow);
