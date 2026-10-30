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

**Temas:** além dos neon (Neon, Retrô, Oceano, Pôr do sol e Dourado), há temas sem neon que mudam a tela
inteira, peças incluídas: Caderno, Gelo, Blocos, Madeira, Militar, Pitaya e Donuts. A seção **⚽ Times** tem os
20 times da Série A, pelo apelido e só com cores, listras e detalhes genéricos (sem escudos nem marcas).
Cada tema é um bloco de variáveis CSS em `src/style.css` (`[data-theme="..."]`). No online, se os dois
jogadores usam o mesmo símbolo, cada um vê o seu e o adversário aparece com o ✕/◯ clássico.

**Para voltar todo dia e chamar amigos** (botão 🏅, aba Missões):

- **Recompensa diária:** dias seguidos rendem 10, 15, 20, 25, 30, 40 e 80 🪙 (depois recomeça);
  pular um dia volta ao dia 1. Quem já jogou antes vê a recompensa sozinha ao abrir o jogo.
- **Missões diárias:** três por dia (fácil, média e difícil, de uma lista de 20), sorteadas pela data e iguais
  para todo mundo. Dá para trocar uma por dia; completar as três rende um bônus.
- **Convide e ganhe:** quando um amigo chega pelo seu link (`?amigo=id`) ou pela sua sala online e termina
  a primeira partida, os dois ganham 50 🪙. O amigo grava um aviso em `referrals/{quem convidou}` e quem
  convidou recebe as moedas ao ver o aviso (e o apaga).

Disponível em **português** (`/`), **inglês** (`/en/`) e **espanhol** (`/es/`).

## Idiomas e SEO

- Cada idioma tem sua própria página HTML (`index.html`, `en/index.html`, `es/index.html`), com
  título, descrição, `hreflang`, link canônico, Open Graph e dados estruturados (schema.org) próprios.
  O app lê o idioma do `<html lang>` da página.
- Os textos da interface ficam em `src/i18n/` (`pt.ts` é o modelo; `en.ts` e `es.ts` seguem o mesmo tipo,
  então o TypeScript acusa qualquer texto faltando).
- A escolha de idioma fica salva no navegador; quem volta é levado direto à página escolhida
  (o idioma do navegador nunca é usado sozinho, para o Google sempre ver cada página no idioma dela).
- Páginas de conteúdo, só HTML e CSS (`src/pages/content.css`), para quem pesquisa no Google:
  regras (`/regras/`, `/en/rules/`, `/es/reglas/`) e estratégias (`/estrategias/`, `/en/strategy/`,
  `/es/estrategias/`). As páginas do jogo têm links para elas no rodapé.
- `public/robots.txt` e `public/sitemap.xml` apontam todas as páginas. Ao mudar de domínio,
  atualize o endereço nesses arquivos e nos HTML.

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

**Google Analytics (opcional):** com `VITE_FIREBASE_MEASUREMENT_ID` no `.env` (Firebase → Analytics),
o jogo envia as visitas para o Google Analytics. Ele é carregado depois que a página abre, num pedaço separado,
sem atrasar o jogo, e **só para quem aceita o aviso de cookies**. O Vercel Analytics (sem cookies) continua
funcionando em paralelo. Eventos do jogo, enviados com `track()` (`src/online/consent.ts`):

| Evento | Quando | Detalhes |
| --- | --- | --- |
| `game_end` | fim de partida | `mode`, `difficulty`, `result`, `boards_won`, `moves` |
| `share` | compartilhar | `content_type` (victory_image, daily_result, invite_link, room_invite), `method` |
| `room_created` / `room_joined` | modo online | `symbol` / `seat` (host, guest, spectator) |
| `invite_accepted` / `referral_reward` | convide e ganhe | `side` (invited, inviter) |
| `spend_virtual_currency` / `equip_item` | loja | `item_name`, `value` / `item_id`, `item_type` |
| `mission_complete` / `missions_all_done` / `mission_swap` | missões | `mission_id`, `tier` |
| `daily_reward` | recompensa diária | `day`, `streak`, `coins` |
| `unlock_achievement` | conquista | `achievement_id` |
| `login` | entrar com Google | `method` |

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
│   ├── rewards.ts           # Quantas moedas cada partida rende
│   └── dailyReward.ts       # Recompensa diária (dias seguidos)
├── stats/
│   ├── achievements.ts      # Estatísticas e conquistas (localStorage)
│   ├── missions.ts          # Missões diárias
│   └── progress.ts          # Junta o progresso do aparelho com o da nuvem
├── effects/
│   ├── confetti.ts          # Confete da vitória (carregado sob demanda)
│   └── toasts.ts            # Avisos no topo da tela (missões, convites)
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
│   ├── invite.ts            # Convide e ganhe (sem Firebase; carrega referrals.ts quando precisa)
│   ├── referrals.ts         # Avisos de convite no banco
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
│   ├── StatsDialog.tsx      # Missões, loja e conquistas (botão 🏅)
│   ├── DailyPanel.tsx       # Recompensa diária, missões e convite
│   ├── DailyDialog.tsx      # Boas-vindas do dia (abre sozinha para quem volta)
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
├── pages/
│   └── content.css          # Estilo das páginas de regras e estratégias
├── App.tsx                  # Alterna entre modo local e online (?sala=código)
├── main.tsx
└── style.css
regras/, estrategias/        # Páginas de conteúdo (e en/rules/, en/strategy/, es/reglas/, es/estrategias/)
database.rules.json          # Regras de segurança do Realtime Database
public/                      # Arquivos servidos como estão (ícone, imagem de compartilhamento)
```
