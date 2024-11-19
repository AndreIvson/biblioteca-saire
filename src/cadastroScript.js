const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener("DOMContentLoaded", function () {
  const telefoneInput = document.getElementById("telefone");

  telefoneInput.addEventListener("input", function (e) {
    let telefone = e.target.value.replace(/\D/g, "");

    if (telefone.length > 11) telefone = telefone.slice(0, 11);

    if (telefone.length > 10) {
      telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (telefone.length > 6) {
      telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (telefone.length > 2) {
      telefone = telefone.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      telefone = telefone.replace(/^(\d*)$/, "($1");
    }

    e.target.value = telefone;
  });
});

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

document.getElementById('captureButton').addEventListener('click', () => {
  const canvas = document.getElementById('canvas');
  const video = document.getElementById('camera');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/png');

  document.getElementById('photoPreview').style.display = 'block';
  document.getElementById('capturedPhoto').src = dataUrl;

  video.srcObject.getTracks().forEach(track => track.stop());
  document.getElementById('cameraContainer').style.display = 'none';
  document.getElementById('captureButton').style.display = 'none';
  document.getElementById('openCameraButton').style.display = 'inline';

  document.getElementById('formCadastro').dataset.profilePic = dataUrl;
});

document.getElementById('formCadastro').addEventListener('submit', function (event) {
  event.preventDefault();

  const dados = {
    id: generateUUID(),
    fullName: document.getElementById('nome').value,
    emailAddress: document.getElementById('email').value,
    phoneNumber: document.getElementById('telefone').value,
    profilePic: document.getElementById('formCadastro').dataset.profilePic,
    school: document.getElementById('escola').value,
    address: document.getElementById('endereco').value,
    bookName: document.getElementById('nomeLivro').value,
    loanBookDate: document.getElementById('dataEmprestimo').value,
    returnBookDate: document.getElementById('dataDevolucao').value
  };

  ipcRenderer.invoke('adicionar-usuario', dados)
    .then(response => {
      if (response.sucesso) {
        alert("Usuário cadastrado com sucesso!");

        const form = document.getElementById('formCadastro');
        form.reset();

        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('capturedPhoto').src = '';
        form.dataset.profilePic = '';

        form.querySelectorAll('input, textarea').forEach(input => {
          input.disabled = false;
        });

        document.getElementById('nome').focus();
        return;
      } else {
        alert("Erro ao cadastrar usuário: " + response.erro);
      }
    })
    .catch(console.error);
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
