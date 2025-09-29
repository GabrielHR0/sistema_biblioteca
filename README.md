# 📚 Sistema de Gestão de Biblioteca

Sistema completo de gerenciamento de biblioteca desenvolvido com **React + TypeScript** no frontend e **Ruby on Rails** no backend. Oferece funcionalidades avançadas para empréstimos, devoluções, cadastro de clientes e gestão de acervo bibliográfico.

## 🚀 Funcionalidades Principais

### 📖 Gestão de Empréstimos e Devoluções
- **Empréstimo de Livros**: Wizard de 3 passos (Seleção de Cópia → Seleção de Leitor → Confirmação)
- **Devolução de Livros**: Wizard de 2 passos (Seleção de Cópia → Confirmação com Detalhes)
- **Renovação de Empréstimos**: Possibilidade de renovar empréstimos
- **Controle de Cópias**: Status individual por cópia (Disponível, Emprestada, Perdida)

### 👥 Gestão de Clientes
- **Cadastro Rápido**: Criação de clientes diretamente no fluxo de empréstimo
- **Geração Automática de Senha**: Sistema gera senha aleatória e envia por email
- **Busca Avançada**: Pesquisa por nome, email ou CPF
- **Validação de Senha**: Confirmação de senha do cliente no empréstimo

### 🔍 Sistema de Busca
- **Filtros Múltiplos**: Por título, autor e categorias
- **Busca em Tempo Real**: Filtragem local e busca no servidor
- **Seleção de Múltiplas Categorias**: Interface intuitiva com dropdown

### 📊 Interface e UX
- **Design Responsivo**: Bootstrap + ícones Bootstrap Icons
- **Feedback Visual**: Loading states, alertas de sucesso/erro
- **Progress Indicators**: Indicadores visuais do progresso nos wizards
- **Modais Interativos**: Experiência fluida sem sair da página

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Bootstrap 5** + Bootstrap Icons
- **Context API** para gerenciamento de estado
- **CSS Modules** para estilização
- **Axios/Fetch** para consumo de API

### Backend
- **Ruby on Rails 7+**
- **PostgreSQL** como banco de dados
- **Sidekiq** para processamento de jobs em background
- **Action Mailer** para envio de emails
- **JWT** para autenticação

### Funcionalidades Específicas do Backend
- **Geração Automática de Senha**: Senhas aleatórias com envio por email
- **SMTP Configurado**: Envio de emails de boas-vindas com senhas
- **API RESTful**: Endpoints bem estruturados

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 16+
- Ruby 3.0+
- PostgreSQL
- Redis (para Sidekiq)

### Instalação do Frontend
```bash
cd frontend
npm install
npm run dev
