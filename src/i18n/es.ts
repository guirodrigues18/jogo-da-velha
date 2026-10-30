import type { Messages } from './pt';

const es: Messages = {
  title: 'Tres en Raya',
  subtitle: 'Gana mini-tableros para dominar el tablero principal. Cada jugada decide dónde juega tu rival.',
  shareTitle: 'Tres en Raya 2.0',

  player: symbol => `Jugador ${symbol}`,
  turnOfPlayer: symbol => `Turno del Jugador ${symbol}`,
  timeout: turnText => `⏱ ¡Se acabó el tiempo! ${turnText}`,
  boardDraw: 'EMPATE',
  scoreLabel: (x, xScore, o, oScore) => `Marcador: ${x} ${xScore}, ${o} ${oScore}`,

  info: {
    turn: 'Turno actual',
    nextBoard: 'Próximo tablero',
    free: 'Libre — cualquier tablero',
    board: n => `Tablero ${n}`
  },

  result: {
    x: '✕ ¡Ganó el Jugador X!',
    o: '◯ ¡Ganó el Jugador O!',
    draw: '¡Empate!',
    autoRestart: 'La partida se reiniciará automáticamente.',
    playAgain: 'Jugar de nuevo',
    youWon: '🏆 ¡Ganaste!',
    computerWon: '🤖 Ganó la computadora',
    otherWon: name => `😢 Ganó ${name}`,
    someoneWon: name => `🏆 ¡Ganó ${name}!`
  },

  share: {
    button: 'Compartir en Historias'
  },

  image: {
    badge: '🏆  VICTORIA',
    won: '¡ganó la partida!',
    stats: (moves, boards) => `en ${moves} jugadas · ${boards} tableros conquistados`,
    challenge: 'A que no me ganas 😏',
    playFree: host => `Juega gratis: ${host}`
  },

  actions: {
    achievements: 'Logros',
    help: 'Cómo jugar',
    language: 'Idioma',
    soundOn: 'Activar sonido y vibración',
    soundOff: 'Desactivar sonido y vibración'
  },

  modes: {
    label: 'Modo de juego',
    pvp: '👥 2 jugadores',
    ai: '🤖 Computadora',
    online: '🌐 En línea',
    levelLabel: 'Nivel de la computadora'
  },

  difficulty: {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil'
  },

  local: {
    you: 'Tú',
    computer: 'Computadora',
    thinking: '🤖 Pensando…',
    yourTurn: 'Tu turno',
    computerTurn: 'Turno de la computadora'
  },

  online: {
    connecting: 'Conectando…',
    creating: 'Creando sala…',
    joining: 'Entrando a la sala…',
    playLocal: 'Jugar sin conexión',
    errors: {
      'not-found': { title: 'Sala no encontrada', text: 'El enlace puede estar mal o la sala ya no existe.' },
      full: { title: 'Sala llena', text: 'Esta partida ya tiene el máximo de espectadores.' },
      closed: { title: 'Sala cerrada', text: 'Esta partida ya terminó. Crea una sala nueva para jugar.' },
      unavailable: { title: 'No se pudo conectar', text: 'Revisa tu conexión a internet e inténtalo de nuevo.' }
    },
    yourTurn: 'Tu turno',
    turnOf: name => `Turno de ${name}`,
    youStart: symbol => `¡Juegas con ${symbol} y empiezas tú!`,
    opponentStarts: (symbol, name) => `Juegas con ${symbol}. Empieza ${name}.`,
    waitingOpponent: 'Esperando rival…',
    matchOver: 'Partida terminada',
    opponentLeftWon: name => `🏆 ${name} se fue, ¡ganaste!`,
    leftRoom: name => `${name} salió de la sala.`,
    matchEnded: 'La partida terminó.',
    backHome: 'Volver al inicio',
    waitingRematch: name => `Esperando que ${name} acepte la revancha…`,
    wantsRematch: name => `🔁 ¡${name} quiere la revancha!`,
    waiting: 'Esperando…',
    acceptRematch: 'Aceptar revancha',
    rematch: 'Revancha',
    leaveRoom: 'Salir de la sala',
    leave: 'Salir',
    playerLeft: name => `${name} salió de la partida`,
    nextMatchHere: 'Si juegan la revancha, la próxima partida aparecerá aquí.',
    inviteTitle: 'Invita a un amigo',
    inviteBefore: 'Envía el enlace: quien lo abra juega con ',
    inviteAfter: '. La partida empieza cuando entre.',
    sendInvite: 'Enviar invitación',
    copyLink: 'Copiar enlace',
    copied: '✓ ¡Enlace copiado!',
    you: 'Tú',
    youTag: '(tú)',
    versus: 'vs',
    opponentOnline: 'Rival en línea',
    opponentOffline: 'Rival desconectado',
    opponentLeft: 'El rival salió de la partida',
    watchingCount: n => `👀 ${n} mirando`,
    youAreWatching: '👀 Estás mirando',
    withMore: n => ` con ${n} más`,
    inviteMessage: name => `${name} te desafió al Tres en Raya 2.0 😏 ¡A que no me ganas!`,
    reactions: 'Reacciones',
    react: emoji => `Reaccionar con ${emoji}`
  },

  nickname: {
    playOnline: 'Jugar en línea',
    ask: '¿Cómo quieres que te llamen en la partida?',
    create: 'Crear sala',
    challenged: name => `¡${name} te desafió! 🎮`,
    invited: '¡Te invitaron! 🎮',
    join: 'Entrar a la partida',
    watchTitle: (x, o) => `${x} vs ${o} 👀`,
    watchAsk: 'La partida ya tiene dos jugadores, pero puedes mirar. ¿Cómo quieres que te llamen?',
    watch: 'Ver partida',
    placeholder: 'Tu apodo',
    howToPlay: '❔ ¿Cómo jugar?',
    back: 'Volver'
  },

  help: {
    title: 'Cómo jugar',
    steps: [
      { icon: '🎯', strong: 'Objetivo:', text: 'gana 3 mini-tableros en línea en el tablero grande.' },
      { icon: '✕', strong: 'Para ganar un mini-tablero,', text: 'haz 3 en línea dentro de él, como en el tres en raya de siempre.' },
      { icon: '➡️', strong: 'La regla de oro:', text: 'la casilla donde juegas decide en qué tablero juega tu rival después.', example: true },
      { icon: '🔓', strong: '¿Tablero cerrado?', text: 'Si el tablero de destino ya está decidido, tu rival puede jugar en cualquiera abierto.' },
      { icon: '⏱', strong: '20 segundos', text: 'por jugada. Si se acaba el tiempo, el turno pasa a tu rival.' },
      { icon: '🌐', strong: 'En línea:', text: 'crea una sala y envía el enlace. Quien lo abra juega con O; si la sala ya tiene dos jugadores, mira la partida. Salir a mitad de partida cuenta como rendirse.' }
    ],
    caption: '¿Jugaste en la esquina superior derecha? Tu rival juega en el tablero de la esquina superior derecha.',
    ok: '¡Entendido, a jugar!'
  },

  language: {
    title: 'Idioma'
  },

  stats: {
    title: 'Tus logros',
    played: 'Partidas',
    wins: 'Victorias',
    losses: 'Derrotas',
    draws: 'Empates',
    streak: 'Racha',
    best: 'Récord',
    note: 'Cuentan las partidas contra la computadora y en línea, guardadas en este dispositivo.',
    achievements: 'Logros',
    progress: (unlocked, total) => `${unlocked} de ${total}`,
    unlocked: '¡Logro desbloqueado!'
  },

  achievements: {
    'first-win': { title: 'Primera victoria', description: 'Gana tu primera partida' },
    'beat-easy': { title: 'Calentamiento', description: 'Vence a la computadora en Fácil' },
    'beat-medium': { title: 'Estratega', description: 'Vence a la computadora en Medio' },
    'beat-hard': { title: 'Gran maestro', description: 'Vence a la computadora en Difícil' },
    'online-win': { title: 'Retador', description: 'Gana una partida en línea' },
    'streak-3': { title: 'En racha', description: 'Gana 3 partidas seguidas' },
    'streak-5': { title: 'Imparable', description: 'Gana 5 partidas seguidas' },
    flawless: { title: 'Intocable', description: 'Gana sin que tu rival conquiste ningún tablero' },
    quick: { title: 'Relámpago', description: 'Gana una partida con 30 jugadas o menos en total' },
    conqueror: { title: 'Conquistador', description: 'Conquista 5 tableros en una partida' },
    veteran: { title: 'Veterano', description: 'Juega 10 partidas' },
    spectator: { title: 'Comentarista', description: 'Mira una partida en línea' },
    sharer: { title: 'Influencer', description: 'Comparte una victoria' }
  }
};

export default es;
