# 🎮 RPG Player - Sistema de Autenticação

Sistema completo de autenticação para jogadores de RPG com suporte a Google OAuth e login tradicional por email.

## ✨ Funcionalidades

- **🔐 Autenticação Google** - Login rápido e seguro via Firebase
- **📧 Login por Email** - Sistema tradicional via Supabase  
- **🔒 Verificação de Email** - Ativação de conta obrigatória
- **🔑 Recuperação de Senha** - Reset seguro por email
- **📱 Interface Responsiva** - Design moderno e mobile-friendly
- **⚡ Arquitetura Híbrida** - Firebase + Supabase para máxima flexibilidade

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- Conta Firebase (configurada)
- Projeto Supabase (configurado)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/saulinho422/rpg-player.git
cd rpg-player

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

## 🏗️ Arquitetura

- **Login Google** → Firebase Auth → Dashboard Firebase
- **Login Email** → Supabase Auth → Dashboard Supabase

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Build:** Vite
- **Auth Google:** Firebase v9+
- **Auth Email:** Supabase
- **Styling:** CSS Moderno com Flexbox/Grid

## 📂 Estrutura do Projeto

```
rpg-player/
├── index.html          # Página principal
├── app.js             # Lógica de autenticação
├── style.css          # Estilos da aplicação
├── package.json       # Dependências e scripts
└── README.md          # Este arquivo
```

## 🔧 Configuração

As credenciais Firebase e Supabase já estão configuradas no projeto. Para usar em produção, atualize as chaves em `app.js`.

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
