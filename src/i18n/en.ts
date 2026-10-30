import type { Messages } from './pt';

const en: Messages = {
  title: 'Tic-Tac-Toe',
  subtitle: 'Win mini-boards to rule the big board. Every move decides where your opponent plays next.',
  shareTitle: 'Tic-Tac-Toe 2.0',

  player: symbol => `Player ${symbol}`,
  turnOfPlayer: symbol => `Player ${symbol}'s turn`,
  timeout: turnText => `⏱ Time's up! ${turnText}`,
  boardDraw: 'DRAW',
  scoreLabel: (x, xScore, o, oScore) => `Score: ${x} ${xScore}, ${o} ${oScore}`,

  info: {
    turn: 'Current turn',
    nextBoard: 'Next board',
    free: 'Free — any board',
    board: n => `Board ${n}`
  },

  result: {
    x: '✕ Player X wins!',
    o: '◯ Player O wins!',
    draw: 'Draw!',
    autoRestart: 'A new game starts automatically.',
    playAgain: 'Play again',
    youWon: '🏆 You won!',
    computerWon: '🤖 The computer won',
    otherWon: name => `😢 ${name} won`,
    someoneWon: name => `🏆 ${name} won!`
  },

  share: {
    button: 'Share to Stories'
  },

  image: {
    badge: '🏆  VICTORY',
    won: 'won the match!',
    stats: (moves, boards) => `in ${moves} moves · ${boards} boards conquered`,
    challenge: "Bet you can't beat me 😏",
    playFree: host => `Play free: ${host}`
  },

  actions: {
    achievements: 'Achievements',
    help: 'How to play',
    language: 'Language',
    soundOn: 'Turn on sound and vibration',
    soundOff: 'Turn off sound and vibration'
  },

  modes: {
    label: 'Game mode',
    pvp: '👥 2 players',
    ai: '🤖 Computer',
    online: '🌐 Online',
    levelLabel: 'Computer level'
  },

  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  },

  local: {
    you: 'You',
    computer: 'Computer',
    thinking: '🤖 Thinking…',
    yourTurn: 'Your turn',
    computerTurn: "Computer's turn"
  },

  online: {
    connecting: 'Connecting…',
    creating: 'Creating room…',
    joining: 'Joining room…',
    playLocal: 'Play offline',
    errors: {
      'not-found': { title: 'Room not found', text: 'The link may be wrong or the room no longer exists.' },
      full: { title: 'Room is full', text: 'This match already has the maximum number of spectators.' },
      closed: { title: 'Room closed', text: 'This match is over. Create a new room to play.' },
      unavailable: { title: "Couldn't connect", text: 'Check your internet connection and try again.' }
    },
    yourTurn: 'Your turn',
    turnOf: name => `${name}'s turn`,
    youStart: symbol => `You play as ${symbol} and go first!`,
    opponentStarts: (symbol, name) => `You play as ${symbol}. ${name} goes first.`,
    waitingOpponent: 'Waiting for opponent…',
    matchOver: 'Match over',
    opponentLeftWon: name => `🏆 ${name} left, you win!`,
    leftRoom: name => `${name} left the room.`,
    matchEnded: 'The match has ended.',
    backHome: 'Back to start',
    waitingRematch: name => `Waiting for ${name} to accept the rematch…`,
    wantsRematch: name => `🔁 ${name} wants a rematch!`,
    waiting: 'Waiting…',
    acceptRematch: 'Accept rematch',
    rematch: 'Rematch',
    leaveRoom: 'Leave room',
    leave: 'Leave',
    playerLeft: name => `${name} left the match`,
    nextMatchHere: 'If they play a rematch, it will show up here.',
    inviteTitle: 'Invite a friend',
    inviteBefore: 'Send the link: whoever opens it plays as ',
    inviteAfter: '. The match starts when they join.',
    sendInvite: 'Send invite',
    copyLink: 'Copy link',
    copied: '✓ Link copied!',
    you: 'You',
    youTag: '(you)',
    versus: 'vs',
    opponentOnline: 'Opponent online',
    opponentOffline: 'Opponent disconnected',
    opponentLeft: 'Opponent left the match',
    watchingCount: n => `👀 ${n} watching`,
    youAreWatching: "👀 You're watching",
    withMore: n => ` with ${n} more`,
    inviteMessage: name => `${name} challenged you to Tic-Tac-Toe 2.0 😏 Bet you can't win!`,
    reactions: 'Reactions',
    react: emoji => `React with ${emoji}`
  },

  nickname: {
    playOnline: 'Play online',
    ask: 'What should we call you in the match?',
    create: 'Create room',
    challenged: name => `${name} challenged you! 🎮`,
    invited: "You've been invited! 🎮",
    join: 'Join match',
    watchTitle: (x, o) => `${x} vs ${o} 👀`,
    watchAsk: 'This match already has two players, but you can watch. What should we call you?',
    watch: 'Watch match',
    placeholder: 'Your nickname',
    howToPlay: '❔ How to play?',
    back: 'Back'
  },

  help: {
    title: 'How to play',
    steps: [
      { icon: '🎯', strong: 'Goal:', text: 'win 3 mini-boards in a row on the big board.' },
      { icon: '✕', strong: 'To win a mini-board,', text: 'get 3 in a row inside it, just like regular tic-tac-toe.' },
      { icon: '➡️', strong: 'The golden rule:', text: 'the square you play in decides which board your opponent plays in next.', example: true },
      { icon: '🔓', strong: 'Board closed?', text: 'If the target board is already decided, your opponent can play in any open board.' },
      { icon: '⏱', strong: '20 seconds', text: "per move. If time runs out, it's your opponent's turn." },
      { icon: '🌐', strong: 'Online:', text: 'create a room and send the link. Whoever opens it plays as O; if the room already has two players, they watch. Leaving mid-match counts as giving up.' }
    ],
    caption: 'Played in the top-right corner? Your opponent plays in the top-right board.',
    ok: "Got it, let's play!"
  },

  language: {
    title: 'Language'
  },

  stats: {
    title: 'Your achievements',
    played: 'Games',
    wins: 'Wins',
    losses: 'Losses',
    draws: 'Draws',
    streak: 'Streak',
    best: 'Best',
    note: 'Counts games against the computer and online, saved on this device.',
    achievements: 'Achievements',
    progress: (unlocked, total) => `${unlocked} of ${total}`,
    unlocked: 'Achievement unlocked!'
  },

  achievements: {
    'first-win': { title: 'First win', description: 'Win your first game' },
    'beat-easy': { title: 'Warm-up', description: 'Beat the computer on Easy' },
    'beat-medium': { title: 'Strategist', description: 'Beat the computer on Medium' },
    'beat-hard': { title: 'Grandmaster', description: 'Beat the computer on Hard' },
    'online-win': { title: 'Challenger', description: 'Win an online match' },
    'streak-3': { title: 'On fire', description: 'Win 3 games in a row' },
    'streak-5': { title: 'Unstoppable', description: 'Win 5 games in a row' },
    flawless: { title: 'Untouchable', description: "Win without your opponent taking a single board" },
    quick: { title: 'Lightning', description: 'Win a game in 30 total moves or fewer' },
    conqueror: { title: 'Conqueror', description: 'Win 5 boards in one game' },
    veteran: { title: 'Veteran', description: 'Play 10 games' },
    spectator: { title: 'Commentator', description: 'Watch an online match' },
    sharer: { title: 'Influencer', description: 'Share a victory' }
  }
};

export default en;
