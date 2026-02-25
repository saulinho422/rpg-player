# Design Review Results: RPG Player — Todas as Páginas Principais

**Data:** 2026-02-25
**Rotas:** `login.html`, `onboarding.html`, `dashboard.html`, `character-sheet.html`
**Áreas de Foco:** Design Visual · UX/Usabilidade · Responsivo/Mobile · Acessibilidade · Micro-interações · Consistência

---

## Resumo

O projeto tem uma identidade visual forte e coesa (tema medieval dourado/preto com Cinzel) que funciona bem em termos estéticos. Porém existem **problemas críticos de arquitetura** (dois sistemas CSS paralelos, IDs duplicados, autenticação baseada em `localStorage` que pode ser burlada) e **vários problemas de UX** que comprometem a experiência de usuário, especialmente em mobile e para usuários que navegam por teclado.

---

## Issues

| # | Issue | Criticidade | Categoria | Localização |
|---|-------|-------------|-----------|-------------|
| 1 | `index.html` contém ~380 linhas de HTML orphaned (login/onboarding antigo fora das tags `<body>`/`</body>`), nunca renderizado, mas inflando o arquivo e confundindo manutenção | 🔴 Critical | Consistência | `index.html:244-633` |
| 2 | IDs duplicados: `proficiencies`, `languages`, `carrying-capacity`, `current-load`, `load-bar` existem **duas vezes** no DOM da ficha — viola a spec HTML e quebra `getElementById()` | 🔴 Critical | UX/Usabilidade | `character-sheet.html:304, 427` |
| 3 | Firebase API Key hardcoded no JS client-side sem uso de variável de ambiente — risco de segurança e abuso de quota | 🔴 Critical | Segurança | `js/firebase-config.js:9-16` |
| 4 | `index.html` redireciona para `login.html` após 2.5s via `setTimeout` sem verificar se usuário já está autenticado — usuário logado sempre passa pela tela de loading novamente | 🔴 Critical | UX/Usabilidade | `index.html:238` |
| 5 | `editAttribute()` na ficha usa `window.prompt()` nativo do browser para editar atributos — diálogo sem estilo, não acessível e completamente fora do tema | 🔴 Critical | UX/Usabilidade | `character-sheet.html:778-805` |
| 6 | Autenticação no dashboard verificada apenas via `localStorage.getItem('isLoggedIn')` — pode ser burlada por qualquer usuário editando localStorage. Firebase `onAuthStateChanged` deveria ser a fonte da verdade | 🟠 High | Segurança | `js/dashboard.js:288-299` |
| 7 | **Borda laranja/vermelha visível em todas as páginas** na viewport — a imagem `plano_de_fundo1.png` vaza nas bordas porque o `body::before` com overlay fixo não tem `overflow: hidden` no body | 🟠 High | Design Visual | `styles/login.css:22-31`, `styles/dashboard.css:19-28`, `styles/onboarding.css:20-29` |
| 8 | Avatar no header do dashboard exibe `src="https://via.placeholder.com/40"` (URL deprecated) com texto "AVATAR" visível — deve usar um avatar padrão local | 🟠 High | Design Visual | `dashboard.html:36`, `js/dashboard.js:95` |
| 9 | Toast de notificação no dashboard usa fundo **azul** (`linear-gradient(135deg, #3498db, #2980b9)`) — completamente inconsistente com o tema dourado medieval | 🟠 High | Consistência | `dashboard.html:258-270` |
| 10 | Stats cards no mobile empilham em coluna única e ficam enormes (ocupam quase tela inteira) — deveriam usar grid 2×1 em mobile | 🟠 High | Responsivo | `styles/dashboard.css:849-858` |
| 11 | Botão Google Sign-In tem fundo branco `#fff` + texto escuro — visual correto para Google brand, mas contrasta visualmente com o tema dark e cria inconsistência no fluxo | 🟠 High | Design Visual | `styles/login.css:175-195` |
| 12 | Nenhuma página tem `<meta name="description">` — ruim para SEO e compartilhamento em redes sociais | 🟠 High | Acessibilidade | Todos os HTMLs |
| 13 | Dois sistemas CSS rodando em paralelo: Tailwind v3 compilado (`main.css`) + CSS vanilla por página — `* { margin: 0 }` e `body {}` redefinidos em cada arquivo gerando conflitos e dificuldade de manutenção | 🟡 Medium | Consistência | `styles/main.css:126-138`, `styles/login.css:5-9`, `styles/dashboard.css:5-9`, `styles/onboarding.css:5-9` |
| 14 | `--color-error: #d4af37` em `main.css` usa cor **dourada** para erros — semanticamente incorreto; erros devem ser vermelhos. `color-palette.css` já define `--color-error: #e74c3c` corretamente mas não é importada no fluxo Tailwind | 🟡 Medium | Design Visual | `styles/main.css:1194` |
| 15 | `.text-error` e `.text-primary` mapeiam para o **mesmo valor** `rgb(212, 175, 55)` — impossível distinguir estados de erro de estados primários por cor | 🟡 Medium | Acessibilidade | `styles/main.css:1128-1136` |
| 16 | Dashboard desktop usa apenas ~30% da largura disponível — stats grid com 2 cards e activity list ficam na metade esquerda, área direita completamente vazia | 🟡 Medium | UX/Usabilidade | `dashboard.html:80-128` |
| 17 | Link "Esqueceu a senha?" foi removido do `login.html` (versão com abas) mas existia na versão antiga do `index.html` — regressão de funcionalidade | 🟡 Medium | UX/Usabilidade | `login.html` (ausente) |
| 18 | Ausência de estados de loading na ficha de personagem — a ficha carrega com todos os valores em zero sem indicador visual de que dados estão sendo carregados | 🟡 Medium | UX/Usabilidade | `character-sheet.html` |
| 19 | Animações CSS sem `@media (prefers-reduced-motion: reduce)` — usuários sensíveis a movimento não são protegidos em nenhuma das 4 páginas | 🟡 Medium | Acessibilidade | `styles/login.css:322-335`, `styles/onboarding.css:718-743`, `styles/dashboard.css:663-673` |
| 20 | Botões de navegação (sidebar, bottom-nav) não têm `:focus-visible` estilizado — usuários que navegam por teclado não conseguem ver qual item está focado | 🟡 Medium | Acessibilidade | `styles/dashboard.css:145-169` |
| 21 | `showMessage()` em `dashboard.js` aplica todos os estilos via `element.style.cssText` inline — impossível de testar, sobrescrever via CSS ou aplicar tema | 🟡 Medium | Consistência | `js/dashboard.js:152-202` |
| 22 | Imagem de fundo "RPG PLAYER" do logo vetorizado vaza através do overlay no dashboard e compete visualmente com o conteúdo de dados | 🟡 Medium | Design Visual | `styles/dashboard.css:12-28` |
| 23 | No onboarding mobile, o footer com botões vira `flex-direction: column` mas ambos os botões ficam do mesmo tamanho — o CTA principal "Próximo →" deveria ser visualmente mais proeminente | ⚪ Low | UX/Usabilidade | `styles/onboarding.css:802-815` |
| 24 | Transição de abas inconsistente: dashboard usa `animation: fadeIn` via CSS; character-sheet usa `display: none → display: block` sem animação | ⚪ Low | Micro-interações | `styles/dashboard.css:221-229`, `character-sheet.html:749-775` |
| 25 | Extensos `console.log` com emojis de debug (🔍, ✅, ❌, 👑) deixados no código de produção em `auth.js` e `dashboard.js` | ⚪ Low | Consistência | `js/auth.js:47-191`, `js/dashboard.js:317-421` |
| 26 | `window.debugCharacters` exposta globalmente no dashboard — utilitário de debug que acessa dados Firebase em produção | ⚪ Low | Segurança | `js/dashboard.js:385-421` |
| 27 | `onboarding.html` — botão "← Anterior" está visível mas desativado no passo 1 (`disabled`), criando uma área cinza não interativa sem explicação | ⚪ Low | UX/Usabilidade | `onboarding.html:202` |

---

## Legenda de Criticidade

| Símbolo | Nível | Descrição |
|---------|-------|-----------|
| 🔴 | **Critical** | Quebra funcionalidade, compromete segurança ou viola spec HTML |
| 🟠 | **High** | Impacto significativo na experiência de usuário ou qualidade do design |
| 🟡 | **Medium** | Problema perceptível que deve ser corrigido |
| ⚪ | **Low** | Melhoria desejável, não urgente |

---

## Resumo por Categoria

| Categoria | 🔴 | 🟠 | 🟡 | ⚪ | Total |
|-----------|----|----|----|----|-------|
| UX/Usabilidade | 3 | 2 | 3 | 2 | 10 |
| Design Visual | 0 | 3 | 2 | 1 | 6 |
| Consistência | 1 | 1 | 2 | 1 | 5 |
| Acessibilidade | 0 | 1 | 3 | 0 | 4 |
| Segurança | 1 | 1 | 0 | 1 | 3 |
| Responsivo | 0 | 1 | 0 | 0 | 1 |
| Micro-interações | 0 | 0 | 0 | 1 | 1 |
| **Total** | **5** | **9** | **10** | **6** | **27** |

---

## Próximos Passos Recomendados (Ordem de Prioridade)

1. **Imediato — Segurança & Bugs Críticos**: Mover Firebase config para variáveis de ambiente (`.env`), corrigir IDs duplicados na ficha, remover HTML orphaned do `index.html`, substituir `prompt()` por modal estilizado
2. **Curto Prazo — UX Crítica**: Corrigir redirect do `index.html` para verificar auth primeiro, substituir avatar placeholder por imagem local, corrigir borda laranja no body
3. **Médio Prazo — Consistência**: Unificar sistema CSS (usar apenas Tailwind v3 ou apenas CSS vanilla), corrigir `--color-error`, padronizar toasts/notificações com tema dourado
4. **Médio Prazo — Acessibilidade**: Adicionar `@media (prefers-reduced-motion)`, estados `:focus-visible` nos botões de nav, `<meta description>` em todas as páginas
5. **Longo Prazo — Layout & Polish**: Melhorar aproveitamento de espaço no dashboard desktop, adicionar loading states na ficha, padronizar animações de transição
