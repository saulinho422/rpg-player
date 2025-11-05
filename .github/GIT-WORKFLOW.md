# 🔄 Workflow de Git - Instruções para o Assistente

## 📋 Regra Obrigatória de Commit

**SEMPRE** que você (assistente) terminar uma tarefa, você **DEVE**:

1. ✅ Perguntar ao usuário se pode fazer o commit
2. ✅ Se a resposta for **SIM**, executar os três comandos **EM SEQUÊNCIA** no terminal

## 🚀 Comandos Git - Sequência Obrigatória

Quando autorizado, execute os **3 comandos de uma vez** em um único bloco:

```bash
cd "c:\Users\saulo\OneDrive\Área de Trabalho\rpgplayer"
git add .
git commit -m "tipo: descrição concisa da mudança

- Detalhe 1
- Detalhe 2
- Detalhe 3"
git push
```

### 📝 Tipos de Commit

Use prefixos semânticos:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `style:` - Mudanças de estilo/formatação
- `docs:` - Documentação
- `chore:` - Tarefas de manutenção
- `perf:` - Melhorias de performance

## ⚠️ IMPORTANTE

### ✅ FAZER:
- Perguntar "Posso fazer o commit e push dessas mudanças?"
- Executar os 3 comandos em um único terminal após confirmação
- Usar mensagens de commit descritivas com lista de mudanças
- Sempre usar `git add .` para adicionar todos os arquivos modificados

### ❌ NÃO FAZER:
- **NUNCA** fazer commit sem perguntar antes
- **NUNCA** executar apenas `git add` ou `git commit` sem o `git push`
- **NUNCA** separar os comandos em múltiplas execuções
- **NUNCA** fazer push sem commit

## 📖 Exemplo de Fluxo Correto

**Assistente termina tarefa:**
```
✅ Wizard ajustado com sucesso!

Posso fazer o commit e push dessas mudanças?
```

**Usuário responde:** "sim"

**Assistente executa:**
```bash
cd "c:\Users\saulo\OneDrive\Área de Trabalho\rpgplayer"
git add .
git commit -m "feat: ajustar wizard para estrutura real do banco

- Usar name_pt ao invés de name
- Parsear arrays JSON
- Ajustar renderRaceStep e renderClassStep
- Garantir compatibilidade com CSV do banco"
git push
```

## 🎯 Objetivo

Esta regra garante:
- ✅ Controle do usuário sobre quando commitar
- ✅ Commits sempre sincronizados com o remoto
- ✅ Histórico de git limpo e organizado
- ✅ Nenhuma mudança perdida localmente

---

**Lembre-se:** Git é uma ferramenta de versionamento colaborativa. Sempre pergunte antes de modificar o histórico!
