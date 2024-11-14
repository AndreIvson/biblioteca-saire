const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Inicia a câmera ao clicar em "Abrir Câmera"
document.getElementById('openCameraButton').addEventListener('click', () => {
  const video = document.getElementById('camera');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      document.getElementById('cameraContainer').style.display = 'block';
      document.getElementById('openCameraButton').style.display = 'none';
      document.getElementById('captureButton').style.display = 'inline';
    })
    .catch(console.error);
});

// Captura a imagem ao clicar em "Tirar Foto"
document.getElementById('captureButton').addEventListener('click', () => {
  const canvas = document.getElementById('canvas');
  const video = document.getElementById('camera');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/png'); // Imagem em base64

  // Exibe a pré-visualização da foto capturada
  document.getElementById('photoPreview').style.display = 'block';
  document.getElementById('capturedPhoto').src = dataUrl;

  // Interrompe a transmissão da câmera
  video.srcObject.getTracks().forEach(track => track.stop());
  document.getElementById('cameraContainer').style.display = 'none';
  document.getElementById('captureButton').style.display = 'none';
  document.getElementById('openCameraButton').style.display = 'inline';

  // Salva a imagem base64 no dataset do formulário
  document.getElementById('formCadastro').dataset.profilePic = dataUrl;
});

document.getElementById('formCadastro').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const dados = {
    id: generateUUID(), // Gera um ID único para o usuário
    fullName: document.getElementById('nome').value,
    emailAddress: document.getElementById('email').value,
    phoneNumber: document.getElementById('telefone').value,
    profilePic: document.getElementById('formCadastro').dataset.profilePic, // Imagem base64
    school: document.getElementById('escola').value,
    address: document.getElementById('endereco').value,
    bookName: document.getElementById('nomeLivro').value,
    loanBookDate: document.getElementById('dataEmprestimo').value,
    returnBookDate: document.getElementById('dataDevolucao').value
  };

  // Envia dados para o processo principal para salvar
  ipcRenderer.invoke('adicionar-usuario', dados)
    .then(response => {
      if (response.sucesso) {
        alert("Usuário cadastrado com sucesso!");
      } else {
        alert("Erro ao cadastrar usuário: " + response.erro);
      }
    })
    .catch(console.error);
});

// Função para gerar um UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
