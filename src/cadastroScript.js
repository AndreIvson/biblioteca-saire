const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener("DOMContentLoaded", function () {
  const telefoneInput = document.getElementById("telefone");

  telefoneInput.addEventListener("input", function (e) {
    let telefone = e.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

    if (telefone.length > 11) telefone = telefone.slice(0, 11); // Limita o número a 11 dígitos

    // Aplica a máscara de acordo com a quantidade de dígitos
    if (telefone.length > 10) {
      telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (telefone.length > 6) {
      telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (telefone.length > 2) {
      telefone = telefone.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      telefone = telefone.replace(/^(\d*)$/, "($1");
    }

    e.target.value = telefone; // Define o valor formatado
  });
});

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

// Ouvinte para o envio do formulário
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

        // Resetando o formulário e garantindo que os campos possam ser reutilizados
        const form = document.getElementById('formCadastro');
        form.reset();

        // Limpa os campos de imagem
        document.getElementById('photoPreview').style.display = 'none'; // Esconde a foto
        document.getElementById('capturedPhoto').src = ''; // Limpa a imagem
        form.dataset.profilePic = ''; // Limpa o campo de imagem

        // Garantir que todos os campos de entrada voltem ao seu estado habilitado
        form.querySelectorAll('input, textarea').forEach(input => {
          input.disabled = false; // Garante que todos os campos estejam habilitados
        });

        // Focar o primeiro campo após o reset para melhorar a experiência
        document.getElementById('nome').focus();
        
        return;
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
