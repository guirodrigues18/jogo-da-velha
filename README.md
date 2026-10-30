# Jogo da Velha 2.0

Ganhe mini-tabuleiros para dominar o tabuleiro principal. Cada jogada define onde o próximo jogador deverá jogar.

Cada jogador tem 20 segundos por turno; se o tempo acabar, a vez passa para o adversário, que joga no mesmo tabuleiro obrigatório.

Modos de jogo:

- **2 jogadores** no mesmo aparelho;
- **contra a IA**, em três níveis (Fácil, Médio e Difícil — este usa busca de Monte Carlo),
  jogando com ✕ ou ◯ (o ✕ sempre começa);
- **desafio diário**: uma posição sorteada pela data, igual para todos, contra a IA (estilo Wordle,
  com resultado para compartilhar e sequência de dias);
- **online**, convidando um amigo por link:
  - quem cria a sala escolhe ✕ ou ◯; o convidado fica com o outro;
  - cada jogador escolhe um apelido provisório;
  - revanche só começa quando os dois aceitam, e o placar da série fica salvo na sala;
  - sair da sala conta como desistência (o adversário vence);
  - quem fica mais de 4 minutos desconectado perde por abandono (conferido pelo relógio do servidor);
  - quem abrir o link de uma sala cheia entra como espectador (até 10 por sala);
  - reações rápidas com emoji aparecem para todos da sala.

Também tem placar da série, estatísticas e 14 conquistas, confete na vitória, vibração no Android
e uma explicação das regras no botão "Como jogar".

**Moedas e loja:** vitórias contra a IA, no desafio diário e online (não no modo 2 jogadores) e conquistas
rendem 🪙, trocadas na loja (botão 🏅) por símbolos (o adversário online também vê), temas de tabuleiro
e efeitos de vitória. Tudo fica no navegador; com **login com Google** (opcional), o progresso é salvo
na nuvem (`users/{uid}`) e acompanha a pessoa em qualquer aparelho.

Disponível em **português** (`/`), **inglês** (`/en/`) e **espanhol** (`/es/`).

## Idiomas e SEO

- Cada idioma tem sua própria página HTML (`index.html`, `en/index.html`, `es/index.html`), com
  título, descrição, `hreflang`, link canônico, Open Graph e dados estruturados (schema.org) próprios.
  O app lê o idioma do `<html lang>` da página.
- Os textos da interface ficam em `src/i18n/` (`pt.ts` é o modelo; `en.ts` e `es.ts` seguem o mesmo tipo,
  então o TypeScript acusa qualquer texto faltando).
- A escolha de idioma fica salva no navegador; quem volta é levado direto à página escolhida
  (o idioma do navegador nunca é usado sozinho, para o Google sempre ver cada página no idioma dela).
- `public/robots.txt` e `public/sitemap.xml` apontam as três páginas. Ao mudar de domínio,
  atualize o endereço nesses arquivos e nos três HTML.

Feito com React, TypeScript e Vite. Modo online com Firebase Realtime Database.

## Rodando localmente

Requer [Node.js](https://nodejs.org) 20.19+ ou 22.12+.

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:5173
```

## Scripts

| Comando           | Descrição                                          |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento com recarga automática |
| `npm run build`   | Verifica os tipos e gera a versão final em `dist/` |
| `npm run preview` | Serve localmente a versão gerada em `dist/`        |
| `npm test`        | Roda os testes                                     |

## Modo online (Firebase)

Sem configuração, o jogo funciona só no modo local. Para ativar o online (plano gratuito Spark):

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com).
2. **Realtime Database** → Criar banco de dados → modo bloqueado.
3. **Authentication** → Método de login → ative **Anônimo** e **Google**.
4. Authentication → Configurações → **Domínios autorizados** → adicione o domínio do site (ex.: `seujogo.vercel.app`).
5. Realtime Database → **Regras** → cole o conteúdo de [`database.rules.json`](database.rules.json) e publique.
6. Configurações do projeto → Seus apps → **Web** → copie os valores para um arquivo `.env`
   (modelo em [`.env.example`](.env.example)).

Salas com mais de 7 dias são apagadas aos poucos pelo próprio jogo (até 20 por vez, quando alguém
cria uma sala nova); as regras do banco só permitem apagar salas antigas. Sem Cloud Functions,
tudo continua no plano gratuito.

As chaves do Firebase Web são públicas por natureza; quem protege os dados são as regras do banco:
só jogadores da sala gravam nela, cada um só joga na sua vez, espectadores não alteram nada,
a vez só pode ser tomada do adversário depois que o tempo dele acabar e uma nova partida
só começa com o aceite dos dois. Ao mudar as regras, cole-as de novo no console do Firebase.

## Estrutura

```
src/
├── game/
│   ├── logic.ts             # Regras do jogo (funções puras, sem React)
│   ├── ai.ts                # IA: aleatória, heurística e Monte Carlo
│   ├── daily.ts             # Desafio diário (posição sorteada pela data)
│   ├── preferences.ts       # Modo, nível e símbolo preferidos
│   ├── random.ts            # Números aleatórios com semente
│   └── *.test.ts
├── shop/
│   ├── catalog.ts           # Itens da loja
│   ├── wallet.ts            # Moedas, itens comprados e em uso (+ moedas retroativas)
│   └── rewards.ts           # Quantas moedas cada partida rende
├── stats/
│   ├── achievements.ts      # Estatísticas e conquistas (localStorage)
│   └── progress.ts          # Junta o progresso do aparelho com o da nuvem
├── effects/
│   └── confetti.ts          # Confete da vitória (carregado sob demanda)
├── hooks/
│   ├── useLocalGame.ts      # Partida no mesmo aparelho (2 jogadores ou computador)
│   ├── useOnlineGame.ts     # Partida online: sala, sincronização e presença
│   ├── useGameFeedback.ts   # Sons, vibração, confete e avisos a partir das mudanças de estado
│   └── useTurnTimer.ts      # Cronômetro de 20 segundos por turno
├── online/
│   ├── config.ts            # Configuração do Firebase (lida do .env)
│   ├── firebase.ts          # Inicialização e login anônimo
│   ├── account.ts           # Login com Google e sincronização do progresso
│   ├── accountInfo.ts       # Nome e foto da conta (sem precisar do Firebase)
│   ├── nickname.ts          # Apelido provisório (lembrado no navegador)
│   ├── rooms.ts             # Criar, entrar e sincronizar salas
│   └── serialization.ts     # Estado do jogo ⇄ formato do banco
├── audio/
│   ├── sounds.ts            # Efeitos sonoros sintetizados (Web Audio) e preferência de mudo
│   └── haptics.ts           # Vibração (Android)
├── components/
│   ├── GameView.tsx         # Tela do jogo, compartilhada por todos os modos
│   ├── LocalGame.tsx        # 2 jogadores e contra o computador
│   ├── ModeSwitch.tsx       # Escolha do modo, do nível, do desafio diário e do símbolo
│   ├── SymbolPicker.tsx     # "Você joga com ✕ ◯"
│   ├── StatsDialog.tsx      # Loja e conquistas (botão 🏅)
│   ├── ShopPanel.tsx        # Loja
│   ├── AccountBox.tsx       # Entrar com Google
│   ├── Scoreboard.tsx       # Placar da série
│   ├── TopActions.tsx       # Botões de conquistas, como jogar e som
│   ├── Dialog.tsx           # Janela base (HelpDialog, StatsDialog)
│   ├── AchievementToaster.tsx
│   ├── ReactionBar.tsx      # Reações com emoji (online)
│   ├── ReactionLayer.tsx    # Emojis flutuando na tela
│   ├── OnlineGame.tsx       # Carregado sob demanda (só baixa o Firebase no modo online)
│   ├── NicknameForm.tsx     # Escolha do apelido antes de criar/entrar na sala
│   ├── OnlineRoom.tsx       # Partida online
│   ├── OnlinePanel.tsx      # Convite, apelidos e status do adversário
│   ├── SpectatorPanel.tsx   # Painel de quem está assistindo
│   ├── OnlineMessage.tsx    # Carregamento e erros do modo online
│   ├── InfoBar.tsx          # Turno atual, cronômetro e próximo tabuleiro
│   ├── MiniBoard.tsx        # Mini-tabuleiro com células e overlay de resultado
│   ├── GameOverModal.tsx
│   ├── ShareVictoryButton.tsx
│   └── SoundToggle.tsx
├── share/
│   ├── renderVictoryImage.ts  # Gera a imagem da vitória (1080×1920) em canvas
│   ├── shareImage.ts          # Compartilhar imagem (menu nativo ou download)
│   └── shareLink.ts           # Compartilhar link (menu nativo ou copiar)
├── i18n/                    # Textos em pt, en e es
├── App.tsx                  # Alterna entre modo local e online (?sala=código)
├── main.tsx
└── style.css
database.rules.json          # Regras de segurança do Realtime Database
public/                      # Arquivos servidos como estão (ícone, imagem de compartilhamento)
```
