// Textos em português. É o modelo: inglês e espanhol precisam ter as mesmas chaves.

const pt = {
  title: 'Jogo da Velha',
  subtitle: 'Ganhe mini-tabuleiros para dominar o tabuleiro principal. Cada jogada define onde o próximo jogador deverá jogar.',
  shareTitle: 'Jogo da Velha 2.0',

  player: (symbol: string) => `Jogador ${symbol}`,
  turnOfPlayer: (symbol: string) => `Vez do Jogador ${symbol}`,
  timeout: (turnText: string) => `⏱ Tempo esgotado! ${turnText}`,
  boardDraw: 'EMPATE',
  scoreLabel: (x: string, xScore: number, o: string, oScore: number) => `Placar: ${x} ${xScore}, ${o} ${oScore}`,

  info: {
    turn: 'Turno atual',
    nextBoard: 'Próximo tabuleiro',
    free: 'Livre — qualquer tabuleiro',
    board: (n: number) => `Tabuleiro ${n}`
  },

  result: {
    x: '✕ Jogador X venceu!',
    o: '◯ Jogador O venceu!',
    draw: 'Empate!',
    autoRestart: 'O jogo será reiniciado automaticamente.',
    playAgain: 'Jogar novamente',
    youWon: '🏆 Você venceu!',
    aiWon: '🤖 A IA venceu',
    otherWon: (name: string) => `😢 ${name} venceu`,
    someoneWon: (name: string) => `🏆 ${name} venceu!`
  },

  share: {
    button: 'Compartilhar nos Stories'
  },

  image: {
    badge: '🏆  VITÓRIA',
    won: 'venceu a partida!',
    stats: (moves: number, boards: number) => `em ${moves} jogadas · ${boards} tabuleiros conquistados`,
    challenge: 'Duvido você me vencer 😏',
    playFree: (host: string) => `Jogue grátis: ${host}`
  },

  actions: {
    achievements: 'Loja e conquistas',
    help: 'Como jogar',
    language: 'Idioma',
    soundOn: 'Ativar sons e vibração',
    soundOff: 'Desativar sons e vibração'
  },

  modes: {
    label: 'Modo de jogo',
    pvp: '👥 2 jogadores',
    ai: '🤖 IA',
    online: '🌐 Online',
    levelLabel: 'Nível da IA',
    daily: '📅 Diário',
    symbolLabel: 'Você joga com',
    startsHint: 'o ✕ sempre começa'
  },

  daily: {
    title: (n: number) => `📅 Desafio #${n}`,
    attempt: (n: number) => `tentativa ${n}`,
    doneToday: 'concluído ✅',
    streak: (n: number) => `🔥 ${n} ${n === 1 ? 'dia' : 'dias'}`,
    intro: 'Vença a IA a partir da posição de hoje. É a mesma para todo mundo!',
    won: (n: number) => `🏆 Desafio #${n} concluído!`,
    wonDetail: (attempts: number, moves: number) =>
      `Em ${attempts} ${attempts === 1 ? 'tentativa' : 'tentativas'} e ${moves} jogadas. Volte amanhã para o próximo!`,
    lost: '😢 Não foi dessa vez',
    drawn: 'Empate! Quase lá',
    tryAgainDetail: 'A posição é a mesma: tente outro caminho.',
    replayDetail: 'Você já venceu o desafio de hoje. Jogar de novo não conta.',
    tryAgain: 'Tentar de novo',
    playAgain: 'Jogar de novo',
    shareResult: '📤 Compartilhar resultado',
    shareText: (n: number, attempts: number, moves: number) =>
      `Jogo da Velha 2.0 · Desafio #${n}\n✅ Venci em ${attempts} ${attempts === 1 ? 'tentativa' : 'tentativas'} (${moves} jogadas)\n${'🟥'.repeat(Math.min(attempts - 1, 9))}🟩`
  },

  shop: {
    tabs: { shop: '🛒 Loja', achievements: '🏅 Conquistas' },
    types: { symbol: 'Símbolos', theme: 'Temas', effect: 'Efeitos de vitória' },
    hints: {
      symbol: 'Aparecem no lugar do seu X/O. No online, o adversário também vê.',
      theme: 'Cores do tabuleiro e do fundo.',
      effect: 'Aparecem quando você vence.'
    },
    use: 'Usar',
    inUse: 'Em uso',
    howToEarn: 'Ganhe 🪙 vencendo partidas (mais no Difícil e no online), no desafio diário e com conquistas.',
    items: {
      'symbol-classic': 'Clássico',
      'symbol-star': 'Estrela',
      'symbol-fire': 'Fogo',
      'symbol-heart': 'Coração',
      'symbol-cat': 'Gato',
      'symbol-skull': 'Caveira',
      'symbol-alien': 'Alien',
      'symbol-crown': 'Coroa',
      'theme-neon': 'Neon',
      'theme-retro': 'Retrô',
      'theme-ocean': 'Oceano',
      'theme-sunset': 'Pôr do sol',
      'theme-gold': 'Dourado',
      'effect-classic': 'Confete',
      'effect-stars': 'Chuva de estrelas',
      'effect-hearts': 'Chuva de corações',
      'effect-fireworks': 'Fogos de artifício'
    } as Record<string, string>
  },

  account: {
    cta: 'Entrar com Google',
    benefit: 'Salve moedas, itens e conquistas na nuvem e jogue em qualquer aparelho.',
    signedIn: (name: string) => `Conectado como ${name}`,
    synced: 'Progresso salvo na nuvem ☁️',
    signOut: 'Sair da conta',
    error: 'Não foi possível entrar. Tente de novo.',
    blocked: 'O login com Google não funciona dentro do WhatsApp/Instagram. Abra o jogo no Chrome ou Safari.'
  },

  difficulty: {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil'
  },

  local: {
    you: 'Você',
    ai: 'IA',
    thinking: '🤖 Pensando…',
    yourTurn: 'Sua vez',
    aiTurn: 'Vez da IA'
  },

  online: {
    connecting: 'Conectando…',
    creating: 'Criando sala…',
    joining: 'Entrando na sala…',
    playLocal: 'Jogar no modo local',
    errors: {
      'not-found': { title: 'Sala não encontrada', text: 'O link pode estar errado ou a sala não existe mais.' },
      full: { title: 'Sala lotada', text: 'Essa partida já tem o máximo de pessoas assistindo.' },
      closed: { title: 'Sala encerrada', text: 'Essa partida já terminou. Crie uma nova sala para jogar.' },
      unavailable: { title: 'Não foi possível conectar', text: 'Verifique sua internet e tente novamente.' }
    },
    yourTurn: 'Sua vez',
    turnOf: (name: string) => `Vez de ${name}`,
    youStart: (symbol: string) => `Você joga com ${symbol} e começa!`,
    opponentStarts: (symbol: string, name: string) => `Você joga com ${symbol}. ${name} começa.`,
    waitingOpponent: 'Aguardando adversário…',
    matchOver: 'Partida encerrada',
    opponentLeftWon: (name: string) => `🏆 ${name} saiu, você venceu!`,
    leftRoom: (name: string) => `${name} saiu da sala.`,
    abandonCountdown: (time: string) => `Adversário desconectado · vitória em ${time}`,
    opponentAbandonedWon: (name: string) => `🏆 ${name} desconectou, você venceu!`,
    abandonedSubtitle: 'Ficou mais de 4 minutos desconectado.',
    matchEnded: 'A partida foi encerrada.',
    backHome: 'Voltar ao início',
    waitingRematch: (name: string) => `Aguardando ${name} aceitar a revanche…`,
    wantsRematch: (name: string) => `🔁 ${name} quer revanche!`,
    waiting: 'Aguardando…',
    acceptRematch: 'Aceitar revanche',
    rematch: 'Revanche',
    leaveRoom: 'Sair da sala',
    leave: 'Sair',
    playerLeft: (name: string) => `${name} saiu da partida`,
    nextMatchHere: 'Se rolar revanche, a próxima partida aparece aqui.',
    inviteTitle: 'Convide um amigo',
    inviteBefore: 'Envie o link: quem abrir joga com ',
    inviteAfter: '. A partida começa quando ele entrar.',
    sendInvite: 'Enviar convite',
    copyLink: 'Copiar link',
    copied: '✓ Link copiado!',
    you: 'Você',
    youTag: '(você)',
    versus: 'vs',
    opponentOnline: 'Adversário online',
    opponentOffline: 'Adversário desconectado',
    opponentLeft: 'Adversário saiu da partida',
    watchingCount: (n: number) => `👀 ${n} assistindo`,
    youAreWatching: '👀 Você está assistindo',
    withMore: (n: number) => ` com mais ${n}`,
    inviteMessage: (name: string) => `${name} te desafiou no Jogo da Velha 2.0 😏 Duvido você ganhar!`,
    reactions: 'Reações',
    react: (emoji: string) => `Reagir com ${emoji}`
  },

  nickname: {
    playOnline: 'Jogar online',
    ask: 'Como você quer ser chamado na partida?',
    create: 'Criar sala',
    challenged: (name: string) => `${name} te desafiou! 🎮`,
    invited: 'Você foi convidado! 🎮',
    join: 'Entrar na partida',
    watchTitle: (x: string, o: string) => `${x} vs ${o} 👀`,
    watchAsk: 'A partida já tem dois jogadores, mas você pode assistir. Como quer ser chamado?',
    watch: 'Assistir partida',
    placeholder: 'Seu apelido',
    howToPlay: '❔ Como jogar?',
    back: 'Voltar'
  },

  coins: {
    earned: 'Moedas ganhas',
    retroactive: 'Pelas suas partidas anteriores'
  },

  help: {
    title: 'Como jogar',
    steps: [
      { icon: '🎯', strong: 'Objetivo:', text: 'conquiste 3 mini-tabuleiros em linha no tabuleiro grande.' },
      { icon: '✕', strong: 'Para conquistar um mini-tabuleiro,', text: 'faça 3 em linha dentro dele, como no jogo da velha comum.' },
      { icon: '➡️', strong: 'A regra de ouro:', text: 'a casa em que você joga decide em qual tabuleiro o adversário joga depois.', example: true },
      { icon: '🔓', strong: 'Tabuleiro fechado?', text: 'Se o tabuleiro de destino já estiver fechado, o adversário pode jogar em qualquer um aberto.' },
      { icon: '⏱', strong: '20 segundos', text: 'por jogada. Se o tempo acabar, a vez passa para o adversário.' },
      { icon: '🌐', strong: 'Online:', text: 'crie uma sala, escolha ✕ ou ◯ e envie o link. Quem abrir joga com o outro símbolo; se a sala já tiver dois jogadores, a pessoa assiste. Sair no meio da partida conta como desistência.' },
      { icon: '🪙', strong: 'Moedas:', text: 'vença partidas, o desafio diário e conquistas para ganhar moedas e trocar por símbolos, temas e efeitos na loja (🏅).' }
    ],
    caption: 'Jogou no canto de cima à direita? O adversário joga no tabuleiro do canto de cima à direita.',
    ok: 'Entendi, bora jogar!'
  },

  language: {
    title: 'Idioma'
  },

  stats: {
    title: 'Loja e conquistas',
    played: 'Partidas',
    wins: 'Vitórias',
    losses: 'Derrotas',
    draws: 'Empates',
    streak: 'Sequência',
    best: 'Recorde',
    note: 'Contam as partidas contra a IA, o desafio diário e as online.',
    achievements: 'Conquistas',
    progress: (unlocked: number, total: number) => `${unlocked} de ${total}`,
    unlocked: 'Conquista desbloqueada!'
  },

  achievements: {
    'first-win': { title: 'Primeira vitória', description: 'Vença sua primeira partida' },
    'beat-easy': { title: 'Aquecimento', description: 'Vença a IA no Fácil' },
    'beat-medium': { title: 'Estrategista', description: 'Vença a IA no Médio' },
    'beat-hard': { title: 'Mestre da velha', description: 'Vença a IA no Difícil' },
    'online-win': { title: 'Desafiante', description: 'Vença uma partida online' },
    'daily-win': { title: 'Desafio cumprido', description: 'Vença um desafio diário' },
    'streak-3': { title: 'Embalado', description: 'Vença 3 partidas seguidas' },
    'streak-5': { title: 'Imparável', description: 'Vença 5 partidas seguidas' },
    flawless: { title: 'Intocável', description: 'Vença sem o adversário conquistar nenhum tabuleiro' },
    quick: { title: 'Relâmpago', description: 'Vença uma partida com até 30 jogadas no total' },
    conqueror: { title: 'Conquistador', description: 'Conquiste 5 tabuleiros em uma partida' },
    veteran: { title: 'Veterano', description: 'Jogue 10 partidas' },
    spectator: { title: 'Comentarista', description: 'Assista a uma partida online' },
    sharer: { title: 'Influencer', description: 'Compartilhe uma vitória' }
  }
};

export type Messages = typeof pt;

export default pt;
