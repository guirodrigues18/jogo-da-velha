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
    achievements: 'Conquistas e rivais',
    account: 'Conta e apelido',
    help: 'Como jogar',
    language: 'Idioma',
    soundOn: 'Ativar sons e vibração',
    soundOff: 'Desativar sons e vibração'
  },

  modes: {
    levelLabel: 'Nível da IA',
    symbolLabel: 'Você joga com',
    startsHint: 'o ✕ sempre começa'
  },

  home: {
    label: 'Modo de jogo',
    back: 'Início',
    pvp: { title: '2 jogadores', text: 'Revezando no mesmo aparelho' },
    ai: { title: 'Contra a IA', text: 'Fácil, médio ou difícil' },
    daily: { title: (n: number) => `Desafio diário #${n}`, text: 'A mesma posição para todo mundo' },
    online: { title: 'Online', text: 'Desafie um amigo pelo link' },
    missions: {
      title: 'Missões de hoje',
      progress: (done: number, total: number) => `${done} de ${total} concluídas`,
      reward: '🎁 Recompensa do dia disponível!',
      dialogTitle: '🎯 Missões e recompensas'
    },
    shop: { title: 'Loja', text: 'Avatares, temas e efeitos' },
    ready: 'Tudo pronto?',
    readyHint: 'O cronômetro só começa quando você tocar em Começar.',
    start: '▶ Começar'
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
    title: '🛒 Loja',
    types: { symbol: 'Avatares', classic: '🎲 Temas clássicos', styled: '🎨 Temas estilizados', special: '✨ Temas especiais', team: '⚽ Times', effect: 'Efeitos de vitória' },
    hints: {
      symbol: 'Aparecem no lugar do seu X/O. No online, o adversário também vê.',
      classic: 'Visuais atemporais para o tabuleiro, as peças e o fundo.',
      styled: 'Temas com mais cor e personalidade.',
      special: 'Cenários completos, cheios de detalhes.',
      team: 'Nas cores dos times brasileiros: tabuleiro, peças e fundo.',
      effect: 'Aparecem quando você vence.'
    },
    use: 'Usar',
    inUse: 'Em uso',
    howToEarn: 'Ganhe 🪙 vencendo partidas (mais no Difícil e no online), com missões, recompensa diária, convites e conquistas.',
    items: {
      'symbol-classic': 'Clássico',
      'symbol-star': 'Estrela',
      'symbol-fire': 'Fogo',
      'symbol-heart': 'Coração',
      'symbol-cat': 'Gato',
      'symbol-skull': 'Caveira',
      'symbol-alien': 'Alien',
      'symbol-crown': 'Coroa',
      'symbol-pumpkin': 'Abóbora',
      'symbol-ghost': 'Fantasma',
      'symbol-zombie': 'Zumbi',
      'symbol-coffin': 'Caixão',
      'symbol-christmas': 'Árvore de Natal',
      'symbol-panda': 'Panda',
      'symbol-rocket': 'Foguete',
      'symbol-dino': 'Dinossauro',
      'symbol-unicorn': 'Unicórnio',
      'symbol-ninja': 'Ninja',
      'theme-neon': 'Cyberpunk',
      'theme-blocks': 'Blocos',
      'theme-notebook': 'Caderno',
      'theme-wood': 'Madeira',
      'theme-chess': 'Xadrez',
      'theme-pitaya': 'Pitaya',
      'theme-donut': 'Donuts',
      'theme-galaxy': 'Galáxia',
      'theme-volcano': 'Vulcânico',
      'theme-oriental': 'Oriental',
      'theme-graffiti': 'Grafite',
      'theme-origami': 'Origami',
      'theme-military': 'Militar',
      'theme-medieval': 'Medieval',
      'theme-retro': 'Fliperama',
      'theme-storm': 'Raios',
      'theme-casino': 'Cassino',
      'theme-jeans': 'Jeans',
      'theme-comic': 'HQ',
      'theme-team-mengao': 'Mengão',
      'theme-team-verdao': 'Verdão',
      'theme-team-raposa': 'Raposa',
      'theme-team-flu': 'Flu',
      'theme-team-furacao': 'Furacão',
      'theme-team-esquadrao': 'Esquadrão',
      'theme-team-galo': 'Galo',
      'theme-team-peixe': 'Peixe',
      'theme-team-massa-bruta': 'Massa Bruta',
      'theme-team-tricolor-paulista': 'Tricolor Paulista',
      'theme-team-fogao': 'Fogão',
      'theme-team-coxa': 'Coxa',
      'theme-team-vascao': 'Vascão',
      'theme-team-leao-da-barra': 'Leão da Barra',
      'theme-team-imortal': 'Imortal',
      'theme-team-colorado': 'Colorado',
      'theme-team-timao': 'Timão',
      'theme-team-leao-azul': 'Leão Azul',
      'theme-team-verdao-do-oeste': 'Verdão do Oeste',
      'theme-team-leao-caipira': 'Leão Caipira',
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
    playingAs: 'Você joga como',
    change: 'trocar',
    watchInfo: 'A partida já tem dois jogadores, mas você pode assistir.',
    back: 'Voltar'
  },

  profile: {
    title: 'Seu perfil',
    nicknameLabel: 'Apelido no online',
    nicknameHint: 'É assim que os outros jogadores te veem nas partidas online.',
    save: 'Salvar',
    saved: '✓ Salvo'
  },

  coins: {
    earned: 'Moedas ganhas',
    retroactive: 'Pelas suas partidas anteriores'
  },

  dailyReward: {
    welcome: 'Que bom te ver!',
    title: '🎁 Recompensa diária',
    day: (n: number) => `Dia ${n}`,
    claim: (coins: number) => `Pegar +${coins} 🪙`,
    streak: (n: number) => `🔥 ${n} ${n === 1 ? 'dia seguido' : 'dias seguidos'}`,
    tomorrow: (coins: number) => `amanhã: +${coins} 🪙`,
    hint: 'Volte todo dia: a recompensa cresce até o dia 7. Se pular um dia, volta para o dia 1.',
    toast: 'Recompensa diária',
    play: 'Bora jogar!'
  },

  missions: {
    title: '🎯 Missões de hoje',
    renews: (hours: number) => `novas em ${hours}h`,
    completed: (coins: number) => `Missão concluída! +${coins} 🪙`,
    allDone: 'Bônus: todas as missões de hoje!',
    bonus: (coins: number) => `Complete as 3 e ganhe +${coins} 🪙 de bônus`,
    bonusDone: (coins: number) => `✓ Bônus de +${coins} 🪙 garantido. Volte amanhã!`,
    swap: 'Trocar missão',
    swapHint: '🔄 troca 1 missão por dia',
    note: 'Contam partidas contra a IA, o desafio diário e online.',
    items: {
      'play-2': 'Jogue 2 partidas',
      'win-1': 'Vença 1 partida',
      'boards-5': 'Conquiste 5 mini-tabuleiros',
      'daily-play': 'Jogue o desafio do dia',
      'ai-medium': 'Jogue contra a IA no Médio',
      'win-3': 'Vença 3 partidas',
      'win-medium': 'Vença a IA no Médio',
      'win-as-o': 'Vença jogando com ◯',
      'boards-12': 'Conquiste 12 mini-tabuleiros',
      'daily-win': 'Vença o desafio do dia',
      'play-online': 'Jogue 1 partida online',
      'quick-40': 'Vença com até 40 jogadas no total',
      'react-3': 'Mande 3 reações no online',
      share: 'Compartilhe uma vitória',
      'win-hard': 'Vença a IA no Difícil',
      'win-online': 'Vença 1 partida online',
      flawless: 'Vença sem perder nenhum mini-tabuleiro',
      'streak-3': 'Vença 3 partidas seguidas',
      'win-5': 'Vença 5 partidas',
      'conquer-5': 'Conquiste 5 mini-tabuleiros numa partida'
    }
  },

  invite: {
    title: '🎁 Convide amigos',
    text: (coins: number) => `Quando um amigo entrar pelo seu link e terminar a primeira partida, vocês dois ganham ${coins} 🪙.`,
    button: 'Convidar amigos',
    loading: 'Preparando o link…',
    count: (n: number) => `${n} ${n === 1 ? 'amigo já veio' : 'amigos já vieram'} pelo seu convite 🙌`,
    message: (coins: number) => `Bora jogar Jogo da Velha 2.0 comigo? 🎮 Entra pelo meu link e ganha ${coins} moedas pra gastar na loja!`,
    acceptedLabel: 'Você foi convidado!',
    accepted: (coins: number) => `Termine 1 partida (IA ou online): +${coins} 🪙`,
    welcomeBonus: 'Bônus de convite',
    friendJoinedLabel: (coins: number) => `Convite aceito · +${coins} 🪙`,
    friendJoined: (name: string) => `${name} entrou pelo seu convite!`,
    someone: 'Um amigo',
    roomHint: (coins: number) => `🎁 Se for a primeira partida dele no jogo, vocês dois ganham ${coins} 🪙.`
  },

  rivals: {
    note: 'Ranking entre você e quem você já enfrentou online, pelo aproveitamento nas partidas entre vocês. Só contam partidas em que os dois entraram com Google.',
    needGoogle: 'O placar contra rivais é só entre contas Google, para ser a mesma pessoa em qualquer aparelho. Entre com Google (no botão 👤, no topo) e jogue online com amigos que também entraram.',
    you: 'Você',
    yourRecord: (wins: number, draws: number, losses: number) => `${wins}V · ${draws}E · ${losses}D no total`,
    versus: (mine: number, theirs: number, draws: number) =>
      `você ${mine} × ${theirs}${draws ? ` · ${draws} ${draws === 1 ? 'empate' : 'empates'}` : ''}`,
    rematch: 'Revanche',
    rematchHint: 'Cria uma sala nova e manda o convite',
    inRoom: 'Termine a partida atual para pedir revanche.',
    empty: 'Você ainda não tem rivais. Crie uma sala e mande o link para um amigo: se ele também tiver entrado com Google, o placar de vocês aparece aqui.',
    challengeTitle: (name: string) => `Revanche contra ${name} ⚔️`,
    inviteMessage: (rival: string, me: string, mine: number, theirs: number) =>
      `${rival}, bora revanche no Jogo da Velha 2.0? ⚔️ Placar até agora: ${me} ${mine} × ${theirs} ${rival}`
  },

  cookies: {
    text: 'Este site usa cookies para estatísticas.',
    accept: 'Aceitar',
    decline: 'Recusar'
  },

  pages: {
    rules: '/regras/',
    strategy: '/estrategias/'
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
      { icon: '🪙', strong: 'Moedas:', text: 'vença partidas, complete as missões do dia, pegue a recompensa diária e convide amigos para ganhar moedas e trocar por avatares, temas e efeitos na loja (🛒, na tela de início).' }
    ],
    caption: 'Jogou no canto de cima à direita? O adversário joga no tabuleiro do canto de cima à direita.',
    ok: 'Entendi, bora jogar!',
    rulesLink: '📖 Regras completas',
    strategyLink: '🧠 Estratégias para vencer'
  },

  language: {
    title: 'Idioma'
  },

  stats: {
    title: 'Seu progresso',
    tabs: { achievements: '🏅 Conquistas', rivals: '⚔️ Rivais' },
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
