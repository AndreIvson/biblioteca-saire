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

// Escutando a requisição do front-end
ipcMain.handle('adicionar-usuario', async (event, dados) => {
  try {
    // Verifica e salva a foto do perfil, se necessário
    if (dados.profilePic) {
      // Use o valor de fullName para nomear a foto
      const safeName = dados.fullName.replace(/[^a-zA-Z0-9]/g, '_'); // Substitui caracteres especiais por _ para evitar problemas
      const imagePath = path.join(__dirname, 'fotos_perfil', `${safeName}.png`);
      const base64Data = dados.profilePic.replace(/^data:image\/png;base64,/, "");

      // Cria a pasta se não existir
      if (!fs.existsSync(path.join(__dirname, 'fotos_perfil'))) {
        fs.mkdirSync(path.join(__dirname, 'fotos_perfil'));
      }

      // Salva a foto com o nome do usuário
      fs.writeFileSync(imagePath, base64Data, 'base64');
      dados.profilePic = imagePath; // Atualiza o caminho da foto com o nome do fullName
    }

    // Adiciona o usuário ao banco de dados
    const usuarioAdicionado = await adicionarUsuario(dados);

    // Envia a resposta para o front-end
    return { sucesso: true, usuario: usuarioAdicionado };
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return { sucesso: false, erro: error.message };
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