# Biblioteca Saire

A aplicação **Biblioteca Saire** é um sistema para gerenciamento de livros e empréstimos em uma biblioteca. Ela permite o cadastro de novos livros, visualização de livros registrados e gerenciamento de empréstimos, tudo de maneira prática e eficiente. O sistema foi desenvolvido utilizando o framework **Electron** para criar uma interface de desktop e **Node.js** para gerenciar a lógica de backend.

---

## Funcionalidades

- **Cadastro de Livros**: Permite adicionar novos livros à biblioteca, incluindo informações como título, autor, quantidade e ano de publicação.
- **Visualização de Livros**: Exibe uma lista de livros registrados, com informações detalhadas sobre cada um.
- **Empréstimos**: Gerencia os empréstimos dos livros, registrando as datas de empréstimo e devolução.
- **Armazenamento Local**: Utiliza um arquivo Excel (`livros.xlsx`) para armazenar os dados de livros. Essa abordagem facilita o gerenciamento local sem a necessidade de bancos de dados complexos.
- **Interface Gráfica**: Desenvolvida com Electron, permitindo que o usuário interaja com a aplicação por meio de uma interface de desktop simples.

---

## Tecnologias Usadas

- **Electron**: Framework para criar aplicações desktop usando tecnologias web como HTML, CSS e JavaScript.
- **Node.js**: Ambiente de execução JavaScript no servidor para gerenciar a lógica de backend.
- **SQLite** (opcional, caso queira armazenar dados de usuários ou empréstimos em um banco de dados local).
- **XLSX**: Biblioteca para ler e escrever arquivos Excel, utilizada para armazenar dados de livros.
- **Git e GitHub**: Para versionamento e controle do código-fonte.

---

## Fluxo da Aplicação ##
- Tela Inicial: Ao abrir o aplicativo, o usuário é apresentado à tela inicial, onde pode navegar para a tela de cadastro de livros, a lista de livros ou voltar para o menu principal.
- Cadastro de Livros: Na tela de cadastro, o usuário pode inserir o título, autor, quantidade e ano de publicação de um novo livro. Após o envio, o livro será registrado no arquivo livros.xlsx.
- Lista de Livros: A lista de livros exibe todos os livros registrados até o momento. O usuário pode visualizar os detalhes de cada livro, como título, autor, quantidade e ano de publicação.
- Empréstimos: O sistema permite gerenciar os empréstimos de livros, registrando as datas de retirada e devolução.
