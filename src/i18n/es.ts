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
    aiWon: '🤖 Ganó la IA',
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
    achievements: 'Perfil y logros',
    help: 'Cómo jugar',
    language: 'Idioma',
    soundOn: 'Activar sonido y vibración',
    soundOff: 'Desactivar sonido y vibración'
  },

  modes: {
    levelLabel: 'Nivel de la IA',
    symbolLabel: 'Juegas con',
    startsHint: 'el ✕ siempre empieza'
  },

  home: {
    label: 'Modo de juego',
    back: 'Inicio',
    pvp: { title: '2 jugadores', text: 'Por turnos en el mismo dispositivo' },
    ai: { title: 'Contra la IA', text: 'Fácil, medio o difícil' },
    daily: { title: n => `Desafío diario #${n}`, text: 'La misma posición para todos' },
    online: { title: 'En línea', text: 'Reta a un amigo con un enlace' },
    missions: {
      title: 'Misiones de hoy',
      progress: (done, total) => `${done} de ${total} completadas`,
      reward: '🎁 ¡Recompensa del día disponible!',
      dialogTitle: '🎯 Misiones y recompensas'
    },
    shop: { title: 'Tienda', text: 'Símbolos, temas y efectos' },
    ready: '¿Listo?',
    readyHint: 'El cronómetro solo empieza cuando tocas Empezar.',
    start: '▶ Empezar'
  },

  daily: {
    title: n => `📅 Desafío #${n}`,
    attempt: n => `intento ${n}`,
    doneToday: 'completado ✅',
    streak: n => `🔥 ${n} ${n === 1 ? 'día' : 'días'}`,
    intro: 'Vence a la IA desde la posición de hoy. ¡Es la misma para todos!',
    won: n => `🏆 ¡Desafío #${n} completado!`,
    wonDetail: (attempts, moves) =>
      `En ${attempts} ${attempts === 1 ? 'intento' : 'intentos'} y ${moves} jugadas. ¡Vuelve mañana por el próximo!`,
    lost: '😢 Esta vez no',
    drawn: '¡Empate! Casi',
    tryAgainDetail: 'La posición es la misma: prueba otro camino.',
    replayDetail: 'Ya ganaste el desafío de hoy. Jugar de nuevo no cuenta.',
    tryAgain: 'Intentar de nuevo',
    playAgain: 'Jugar de nuevo',
    shareResult: '📤 Compartir resultado',
    shareText: (n, attempts, moves) =>
      `Tres en Raya 2.0 · Desafío #${n}\n✅ Gané en ${attempts} ${attempts === 1 ? 'intento' : 'intentos'} (${moves} jugadas)\n${'🟥'.repeat(Math.min(attempts - 1, 9))}🟩`
  },

  shop: {
    title: '🛒 Tienda',
    types: { symbol: 'Símbolos', theme: 'Temas', team: '⚽ Equipos', effect: 'Efectos de victoria' },
    hints: {
      symbol: 'Aparecen en lugar de tu X/O. En línea, tu rival también los ve.',
      theme: 'Colores del tablero y del fondo.',
      team: 'Con los colores de los clubes brasileños: tablero, fichas y fondo.',
      effect: 'Aparecen cuando ganas.'
    },
    use: 'Usar',
    inUse: 'En uso',
    howToEarn: 'Gana 🪙 venciendo partidas (más en Difícil y en línea), con misiones, la recompensa diaria, invitaciones y logros.',
    items: {
      'symbol-classic': 'Clásico',
      'symbol-star': 'Estrella',
      'symbol-fire': 'Fuego',
      'symbol-heart': 'Corazón',
      'symbol-cat': 'Gato',
      'symbol-skull': 'Calavera',
      'symbol-alien': 'Alien',
      'symbol-crown': 'Corona',
      'symbol-pumpkin': 'Calabaza',
      'symbol-ghost': 'Fantasma',
      'symbol-zombie': 'Zombi',
      'symbol-coffin': 'Ataúd',
      'symbol-christmas': 'Árbol de Navidad',
      'theme-neon': 'Neón',
      'theme-retro': 'Retro',
      'theme-ocean': 'Océano',
      'theme-sunset': 'Atardecer',
      'theme-gold': 'Dorado',
      'theme-blocks': 'Bloques',
      'theme-wood': 'Madera',
      'theme-notebook': 'Cuaderno',
      'theme-ice': 'Hielo',
      'theme-pitaya': 'Pitaya',
      'theme-donut': 'Donas',
      'theme-military': 'Militar',
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
      'effect-classic': 'Confeti',
      'effect-stars': 'Lluvia de estrellas',
      'effect-hearts': 'Lluvia de corazones',
      'effect-fireworks': 'Fuegos artificiales'
    }
  },

  account: {
    cta: 'Entrar con Google',
    benefit: 'Guarda monedas, objetos y logros en la nube y juega en cualquier dispositivo.',
    signedIn: name => `Conectado como ${name}`,
    synced: 'Progreso guardado en la nube ☁️',
    signOut: 'Cerrar sesión',
    error: 'No se pudo entrar. Inténtalo de nuevo.',
    blocked: 'El inicio de sesión con Google no funciona dentro de WhatsApp/Instagram. Abre el juego en Chrome o Safari.'
  },

  difficulty: {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil'
  },

  local: {
    you: 'Tú',
    ai: 'IA',
    thinking: '🤖 Pensando…',
    yourTurn: 'Tu turno',
    aiTurn: 'Turno de la IA'
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
    abandonCountdown: time => `Rival desconectado · ganas en ${time}`,
    opponentAbandonedWon: name => `🏆 ${name} se desconectó, ¡ganaste!`,
    abandonedSubtitle: 'Estuvo desconectado más de 4 minutos.',
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

  coins: {
    earned: 'Monedas ganadas',
    retroactive: 'Por tus partidas anteriores'
  },

  dailyReward: {
    welcome: '¡Qué bueno verte!',
    title: '🎁 Recompensa diaria',
    day: n => `Día ${n}`,
    claim: coins => `Recoger +${coins} 🪙`,
    streak: n => `🔥 ${n} ${n === 1 ? 'día seguido' : 'días seguidos'}`,
    tomorrow: coins => `mañana: +${coins} 🪙`,
    hint: 'Vuelve cada día: la recompensa crece hasta el día 7. Si te saltas un día, vuelve al día 1.',
    toast: 'Recompensa diaria',
    play: '¡A jugar!'
  },

  missions: {
    title: '🎯 Misiones de hoy',
    renews: hours => `nuevas en ${hours} h`,
    completed: coins => `¡Misión cumplida! +${coins} 🪙`,
    allDone: 'Bonus: ¡todas las misiones de hoy!',
    bonus: coins => `Completa las 3 y gana +${coins} 🪙 de bonus`,
    bonusDone: coins => `✓ Bonus de +${coins} 🪙 conseguido. ¡Vuelve mañana!`,
    swap: 'Cambiar misión',
    swapHint: '🔄 cambia 1 misión por día',
    note: 'Cuentan las partidas contra la IA, el desafío diario y en línea.',
    items: {
      'play-2': 'Juega 2 partidas',
      'win-1': 'Gana 1 partida',
      'boards-5': 'Gana 5 mini-tableros',
      'daily-play': 'Juega el desafío de hoy',
      'ai-medium': 'Juega contra la IA en Medio',
      'win-3': 'Gana 3 partidas',
      'win-medium': 'Vence a la IA en Medio',
      'win-as-o': 'Gana jugando con ◯',
      'boards-12': 'Gana 12 mini-tableros',
      'daily-win': 'Supera el desafío de hoy',
      'play-online': 'Juega 1 partida en línea',
      'quick-40': 'Gana en 40 jugadas o menos',
      'react-3': 'Envía 3 reacciones en línea',
      share: 'Comparte una victoria',
      'win-hard': 'Vence a la IA en Difícil',
      'win-online': 'Gana 1 partida en línea',
      flawless: 'Gana sin perder ningún mini-tablero',
      'streak-3': 'Gana 3 partidas seguidas',
      'win-5': 'Gana 5 partidas',
      'conquer-5': 'Gana 5 mini-tableros en una partida'
    }
  },

  invite: {
    title: '🎁 Invita a amigos',
    text: coins => `Cuando un amigo entre con tu enlace y termine su primera partida, los dos ganan ${coins} 🪙.`,
    button: 'Invitar amigos',
    loading: 'Preparando el enlace…',
    count: n => `${n} ${n === 1 ? 'amigo ya llegó' : 'amigos ya llegaron'} con tu invitación 🙌`,
    message: coins => `¿Jugamos Tres en Raya 2.0? 🎮 Entra con mi enlace y gana ${coins} monedas para gastar en la tienda.`,
    acceptedLabel: '¡Te invitaron!',
    accepted: coins => `Termina 1 partida (IA o en línea): +${coins} 🪙`,
    welcomeBonus: 'Bonus de invitación',
    friendJoinedLabel: coins => `Invitación aceptada · +${coins} 🪙`,
    friendJoined: name => `¡${name} entró con tu invitación!`,
    someone: 'Un amigo',
    roomHint: coins => `🎁 Si es su primera partida, los dos ganan ${coins} 🪙.`
  },

  rivals: {
    note: 'Ranking entre tú y quienes ya enfrentaste en línea, por el rendimiento en las partidas entre ustedes. Solo cuentan las partidas en que los dos entraron con Google.',
    needGoogle: 'El marcador contra rivales es solo entre cuentas de Google, para que sea la misma persona en cualquier dispositivo. Entra con Google (arriba) y juega en línea con amigos que también hayan entrado.',
    you: 'Tú',
    yourRecord: (wins, draws, losses) => `${wins}V · ${draws}E · ${losses}D en total`,
    versus: (mine, theirs, draws) =>
      `tú ${mine} × ${theirs}${draws ? ` · ${draws} ${draws === 1 ? 'empate' : 'empates'}` : ''}`,
    rematch: 'Revancha',
    rematchHint: 'Crea una sala nueva y envía la invitación',
    inRoom: 'Termina la partida actual para pedir la revancha.',
    empty: 'Aún no tienes rivales. Crea una sala y envía el enlace a un amigo: si también entró con Google, el marcador de ustedes aparecerá aquí.',
    challengeTitle: name => `Revancha contra ${name} ⚔️`,
    inviteMessage: (rival, me, mine, theirs) =>
      `${rival}, ¿revancha en Tres en Raya 2.0? ⚔️ Marcador: ${me} ${mine} × ${theirs} ${rival}`
  },

  cookies: {
    text: 'Este sitio usa cookies para estadísticas.',
    accept: 'Aceptar',
    decline: 'Rechazar'
  },

  pages: {
    rules: '/es/reglas/',
    strategy: '/es/estrategias/'
  },

  help: {
    title: 'Cómo jugar',
    steps: [
      { icon: '🎯', strong: 'Objetivo:', text: 'gana 3 mini-tableros en línea en el tablero grande.' },
      { icon: '✕', strong: 'Para ganar un mini-tablero,', text: 'haz 3 en línea dentro de él, como en el tres en raya de siempre.' },
      { icon: '➡️', strong: 'La regla de oro:', text: 'la casilla donde juegas decide en qué tablero juega tu rival después.', example: true },
      { icon: '🔓', strong: '¿Tablero cerrado?', text: 'Si el tablero de destino ya está decidido, tu rival puede jugar en cualquiera abierto.' },
      { icon: '⏱', strong: '20 segundos', text: 'por jugada. Si se acaba el tiempo, el turno pasa a tu rival.' },
      { icon: '🌐', strong: 'En línea:', text: 'crea una sala, elige ✕ o ◯ y envía el enlace. Quien lo abra juega con el otro símbolo; si la sala ya tiene dos jugadores, mira la partida. Salir a mitad de partida cuenta como rendirse.' },
      { icon: '🪙', strong: 'Monedas:', text: 'gana partidas, completa las misiones del día, recoge la recompensa diaria e invita a amigos para conseguir monedas y cambiarlas por símbolos, temas y efectos en la tienda (🛒, en la pantalla de inicio).' }
    ],
    caption: '¿Jugaste en la esquina superior derecha? Tu rival juega en el tablero de la esquina superior derecha.',
    ok: '¡Entendido, a jugar!',
    rulesLink: '📖 Reglas completas',
    strategyLink: '🧠 Estrategias para ganar'
  },

  language: {
    title: 'Idioma'
  },

  stats: {
    title: 'Tu progreso',
    tabs: { achievements: '🏅 Logros', rivals: '⚔️ Rivales' },
    played: 'Partidas',
    wins: 'Victorias',
    losses: 'Derrotas',
    draws: 'Empates',
    streak: 'Racha',
    best: 'Récord',
    note: 'Cuentan las partidas contra la IA, el desafío diario y en línea.',
    achievements: 'Logros',
    progress: (unlocked, total) => `${unlocked} de ${total}`,
    unlocked: '¡Logro desbloqueado!'
  },

  achievements: {
    'first-win': { title: 'Primera victoria', description: 'Gana tu primera partida' },
    'beat-easy': { title: 'Calentamiento', description: 'Vence a la IA en Fácil' },
    'beat-medium': { title: 'Estratega', description: 'Vence a la IA en Medio' },
    'beat-hard': { title: 'Gran maestro', description: 'Vence a la IA en Difícil' },
    'online-win': { title: 'Retador', description: 'Gana una partida en línea' },
    'daily-win': { title: 'Desafío cumplido', description: 'Gana un desafío diario' },
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
