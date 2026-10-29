# Jogo da Velha 2.0

Ganhe mini-tabuleiros para dominar o tabuleiro principal. Cada jogada define onde o próximo jogador deverá jogar.

Cada jogador tem 20 segundos por turno; se o tempo acabar, a vez passa para o adversário, que joga no mesmo tabuleiro obrigatório.

Feito com React, TypeScript e Vite.

## Rodando localmente

Requer [Node.js](https://nodejs.org) 20.19+ ou 22.12+.

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:5173
```

## Scripts

| Comando           | Descrição                                       |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento com recarga automática |
| `npm run build`   | Verifica os tipos e gera a versão final em `dist/` |
| `npm run preview` | Serve localmente a versão gerada em `dist/`     |
| `npm test`        | Roda os testes da lógica do jogo                |

## Estrutura

```
src/
├── game/
│   ├── logic.ts        # Regras do jogo (funções puras, sem React)
│   └── logic.test.ts   # Testes das regras
├── hooks/
│   ├── useGame.ts      # Estado da partida, sons, avisos e reinício automático
│   └── useTurnTimer.ts # Cronômetro de 20 segundos por turno
├── audio/
│   └── sounds.ts       # Efeitos sonoros sintetizados (Web Audio) e preferência de mudo
├── components/
│   ├── InfoBar.tsx     # Turno atual, cronômetro e próximo tabuleiro
│   ├── MiniBoard.tsx   # Mini-tabuleiro com células e overlay de resultado
│   ├── GameOverModal.tsx
│   ├── ShareVictoryButton.tsx
│   └── SoundToggle.tsx
├── share/
│   ├── renderVictoryImage.ts  # Gera a imagem da vitória (1080×1920) em canvas
│   └── shareImage.ts          # Menu de compartilhar nativo ou download
├── App.tsx
├── main.tsx
└── style.css
public/                 # Arquivos servidos como estão (ícone, imagem de compartilhamento)
```
