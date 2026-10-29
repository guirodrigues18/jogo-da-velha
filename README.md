# Jogo da Velha 2.0

Ganhe mini-tabuleiros para dominar o tabuleiro principal. Cada jogada define onde o próximo jogador deverá jogar.

Cada jogador tem 20 segundos por turno; se o tempo acabar, a vez passa para o adversário, que joga no mesmo tabuleiro obrigatório.

Dá para jogar no mesmo aparelho ou **online**, convidando um amigo por link. No online, cada jogador escolhe um apelido provisório.

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
3. **Authentication** → Método de login → ative **Anônimo**.
4. Realtime Database → **Regras** → cole o conteúdo de [`database.rules.json`](database.rules.json) e publique.
5. Configurações do projeto → Seus apps → **Web** → copie os valores para um arquivo `.env`
   (modelo em [`.env.example`](.env.example)).

As chaves do Firebase Web são públicas por natureza; quem protege os dados são as regras do banco:
só jogadores da sala gravam nela, cada um só joga na sua vez, ninguém entra em sala cheia
e a vez só pode ser tomada do adversário depois que o tempo dele acabar.

## Estrutura

```
src/
├── game/
│   ├── logic.ts             # Regras do jogo (funções puras, sem React)
│   └── logic.test.ts
├── hooks/
│   ├── useLocalGame.ts      # Partida no mesmo aparelho
│   ├── useOnlineGame.ts     # Partida online: sala, sincronização e presença
│   ├── useGameFeedback.ts   # Sons, avisos e tremidas a partir das mudanças de estado
│   └── useTurnTimer.ts      # Cronômetro de 20 segundos por turno
├── online/
│   ├── config.ts            # Configuração do Firebase (lida do .env)
│   ├── firebase.ts          # Inicialização e login anônimo
│   ├── nickname.ts          # Apelido provisório (lembrado no navegador)
│   ├── rooms.ts             # Criar, entrar e sincronizar salas
│   └── serialization.ts     # Estado do jogo ⇄ formato do banco
├── audio/
│   └── sounds.ts            # Efeitos sonoros sintetizados (Web Audio) e preferência de mudo
├── components/
│   ├── GameView.tsx         # Tela do jogo, compartilhada pelos dois modos
│   ├── LocalGame.tsx
│   ├── OnlineGame.tsx       # Carregado sob demanda (só baixa o Firebase no modo online)
│   ├── NicknameForm.tsx     # Escolha do apelido antes de criar/entrar na sala
│   ├── OnlineRoom.tsx       # Partida online
│   ├── OnlinePanel.tsx      # Convite, apelidos e status do adversário
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
├── App.tsx                  # Alterna entre modo local e online (?sala=código)
├── main.tsx
└── style.css
database.rules.json          # Regras de segurança do Realtime Database
public/                      # Arquivos servidos como estão (ícone, imagem de compartilhamento)
```
