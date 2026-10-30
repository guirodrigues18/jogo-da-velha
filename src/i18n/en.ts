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
    aiWon: '🤖 The AI won',
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
    achievements: 'Profile and achievements',
    help: 'How to play',
    language: 'Language',
    soundOn: 'Turn on sound and vibration',
    soundOff: 'Turn off sound and vibration'
  },

  modes: {
    levelLabel: 'AI level',
    symbolLabel: 'You play as',
    startsHint: '✕ always goes first'
  },

  home: {
    label: 'Game mode',
    back: 'Home',
    pvp: { title: '2 players', text: 'Take turns on the same device' },
    ai: { title: 'Versus AI', text: 'Easy, medium or hard' },
    daily: { title: n => `Daily challenge #${n}`, text: 'The same position for everyone' },
    online: { title: 'Online', text: 'Challenge a friend with a link' },
    missions: {
      title: "Today's missions",
      progress: (done, total) => `${done} of ${total} done`,
      reward: "🎁 Today's reward is ready!",
      dialogTitle: '🎯 Missions and rewards'
    },
    shop: { title: 'Shop', text: 'Symbols, themes and effects' },
    ready: 'Ready?',
    readyHint: 'The timer only starts when you tap Start.',
    start: '▶ Start'
  },

  daily: {
    title: n => `📅 Challenge #${n}`,
    attempt: n => `attempt ${n}`,
    doneToday: 'done ✅',
    streak: n => `🔥 ${n} ${n === 1 ? 'day' : 'days'}`,
    intro: "Beat the AI from today's position. Everyone gets the same one!",
    won: n => `🏆 Challenge #${n} complete!`,
    wonDetail: (attempts, moves) =>
      `In ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} and ${moves} moves. Come back tomorrow for the next one!`,
    lost: '😢 Not this time',
    drawn: 'Draw! So close',
    tryAgainDetail: 'Same position: try a different path.',
    replayDetail: "You've already beaten today's challenge. Playing again doesn't count.",
    tryAgain: 'Try again',
    playAgain: 'Play again',
    shareResult: '📤 Share result',
    shareText: (n, attempts, moves) =>
      `Tic-Tac-Toe 2.0 · Challenge #${n}\n✅ Won in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'} (${moves} moves)\n${'🟥'.repeat(Math.min(attempts - 1, 9))}🟩`
  },

  shop: {
    title: '🛒 Shop',
    types: { symbol: 'Symbols', theme: 'Themes', team: '⚽ Teams', effect: 'Victory effects' },
    hints: {
      symbol: 'Shown instead of your X/O. Online, your opponent sees it too.',
      theme: 'Board and background colors.',
      team: 'In the colors of Brazilian clubs: board, pieces and background.',
      effect: 'Shown when you win.'
    },
    use: 'Use',
    inUse: 'In use',
    howToEarn: 'Earn 🪙 by winning games (more on Hard and online), with missions, the daily reward, invites and achievements.',
    items: {
      'symbol-classic': 'Classic',
      'symbol-star': 'Star',
      'symbol-fire': 'Fire',
      'symbol-heart': 'Heart',
      'symbol-cat': 'Cat',
      'symbol-skull': 'Skull',
      'symbol-alien': 'Alien',
      'symbol-crown': 'Crown',
      'symbol-pumpkin': 'Pumpkin',
      'symbol-ghost': 'Ghost',
      'symbol-zombie': 'Zombie',
      'symbol-coffin': 'Coffin',
      'symbol-christmas': 'Christmas tree',
      'theme-neon': 'Neon',
      'theme-retro': 'Retro',
      'theme-ocean': 'Ocean',
      'theme-sunset': 'Sunset',
      'theme-gold': 'Gold',
      'theme-blocks': 'Blocks',
      'theme-wood': 'Wood',
      'theme-notebook': 'Notebook',
      'theme-ice': 'Ice',
      'theme-pitaya': 'Dragon fruit',
      'theme-donut': 'Donuts',
      'theme-military': 'Military',
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
      'effect-classic': 'Confetti',
      'effect-stars': 'Star shower',
      'effect-hearts': 'Heart shower',
      'effect-fireworks': 'Fireworks'
    }
  },

  account: {
    cta: 'Sign in with Google',
    benefit: 'Save coins, items and achievements in the cloud and play on any device.',
    signedIn: name => `Signed in as ${name}`,
    synced: 'Progress saved to the cloud ☁️',
    signOut: 'Sign out',
    error: "Couldn't sign in. Please try again.",
    blocked: "Google sign-in doesn't work inside WhatsApp/Instagram. Open the game in Chrome or Safari."
  },

  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  },

  local: {
    you: 'You',
    ai: 'AI',
    thinking: '🤖 Thinking…',
    yourTurn: 'Your turn',
    aiTurn: "AI's turn"
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
    abandonCountdown: time => `Opponent disconnected · you win in ${time}`,
    opponentAbandonedWon: name => `🏆 ${name} disconnected, you win!`,
    abandonedSubtitle: 'They were disconnected for over 4 minutes.',
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

  coins: {
    earned: 'Coins earned',
    retroactive: 'For your previous games'
  },

  dailyReward: {
    welcome: 'Welcome back!',
    title: '🎁 Daily reward',
    day: n => `Day ${n}`,
    claim: coins => `Claim +${coins} 🪙`,
    streak: n => `🔥 ${n}-day streak`,
    tomorrow: coins => `tomorrow: +${coins} 🪙`,
    hint: 'Come back every day: the reward grows until day 7. Skip a day and it goes back to day 1.',
    toast: 'Daily reward',
    play: "Let's play!"
  },

  missions: {
    title: "🎯 Today's missions",
    renews: hours => `new in ${hours}h`,
    completed: coins => `Mission complete! +${coins} 🪙`,
    allDone: "Bonus: all of today's missions!",
    bonus: coins => `Complete all 3 for a +${coins} 🪙 bonus`,
    bonusDone: coins => `✓ +${coins} 🪙 bonus earned. See you tomorrow!`,
    swap: 'Swap mission',
    swapHint: '🔄 swap 1 mission per day',
    note: 'Games against the AI, the daily challenge and online count.',
    items: {
      'play-2': 'Play 2 games',
      'win-1': 'Win 1 game',
      'boards-5': 'Win 5 mini-boards',
      'daily-play': "Play today's challenge",
      'ai-medium': 'Play the AI on Medium',
      'win-3': 'Win 3 games',
      'win-medium': 'Beat the AI on Medium',
      'win-as-o': 'Win playing as ◯',
      'boards-12': 'Win 12 mini-boards',
      'daily-win': "Beat today's challenge",
      'play-online': 'Play 1 online game',
      'quick-40': 'Win in 40 moves or fewer',
      'react-3': 'Send 3 reactions online',
      share: 'Share a win',
      'win-hard': 'Beat the AI on Hard',
      'win-online': 'Win 1 online game',
      flawless: 'Win without losing a mini-board',
      'streak-3': 'Win 3 games in a row',
      'win-5': 'Win 5 games',
      'conquer-5': 'Win 5 mini-boards in one game'
    }
  },

  invite: {
    title: '🎁 Invite friends',
    text: coins => `When a friend joins through your link and finishes their first game, you both get ${coins} 🪙.`,
    button: 'Invite friends',
    loading: 'Getting your link…',
    count: n => `${n} ${n === 1 ? 'friend has' : 'friends have'} joined through you 🙌`,
    message: coins => `Play Tic-Tac-Toe 2.0 with me? 🎮 Join through my link and get ${coins} coins to spend in the shop!`,
    acceptedLabel: "You've been invited!",
    accepted: coins => `Finish 1 game (AI or online): +${coins} 🪙`,
    welcomeBonus: 'Invite bonus',
    friendJoinedLabel: coins => `Invite accepted · +${coins} 🪙`,
    friendJoined: name => `${name} joined through your invite!`,
    someone: 'A friend',
    roomHint: coins => `🎁 If it's their first game, you both get ${coins} 🪙.`
  },

  rivals: {
    note: "Ranking between you and everyone you've played online, by win rate in your games together. Only games where both players signed in with Google count.",
    needGoogle: 'Rival scores only count between Google accounts, so it is the same person on any device. Sign in with Google (above) and play online with friends who did too.',
    you: 'You',
    yourRecord: (wins, draws, losses) => `${wins}W · ${draws}D · ${losses}L overall`,
    versus: (mine, theirs, draws) =>
      `you ${mine} × ${theirs}${draws ? ` · ${draws} ${draws === 1 ? 'draw' : 'draws'}` : ''}`,
    rematch: 'Rematch',
    rematchHint: 'Creates a new room and sends the invite',
    inRoom: 'Finish the current match to ask for a rematch.',
    empty: "You don't have any rivals yet. Create a room and send the link to a friend: if they're signed in with Google too, your score will show up here.",
    challengeTitle: name => `Rematch against ${name} ⚔️`,
    inviteMessage: (rival, me, mine, theirs) =>
      `${rival}, rematch on Tic-Tac-Toe 2.0? ⚔️ Score so far: ${me} ${mine} × ${theirs} ${rival}`
  },

  cookies: {
    text: 'This site uses cookies for statistics.',
    accept: 'Accept',
    decline: 'Decline'
  },

  pages: {
    rules: '/en/rules/',
    strategy: '/en/strategy/'
  },

  help: {
    title: 'How to play',
    steps: [
      { icon: '🎯', strong: 'Goal:', text: 'win 3 mini-boards in a row on the big board.' },
      { icon: '✕', strong: 'To win a mini-board,', text: 'get 3 in a row inside it, just like regular tic-tac-toe.' },
      { icon: '➡️', strong: 'The golden rule:', text: 'the square you play in decides which board your opponent plays in next.', example: true },
      { icon: '🔓', strong: 'Board closed?', text: 'If the target board is already decided, your opponent can play in any open board.' },
      { icon: '⏱', strong: '20 seconds', text: "per move. If time runs out, it's your opponent's turn." },
      { icon: '🌐', strong: 'Online:', text: 'create a room, pick ✕ or ◯ and send the link. Whoever opens it plays the other symbol; if the room already has two players, they watch. Leaving mid-match counts as giving up.' },
      { icon: '🪙', strong: 'Coins:', text: "win games, complete today's missions, claim the daily reward and invite friends to earn coins and trade them for symbols, themes and effects in the shop (🛒, on the home screen)." }
    ],
    caption: 'Played in the top-right corner? Your opponent plays in the top-right board.',
    ok: "Got it, let's play!",
    rulesLink: '📖 Full rules',
    strategyLink: '🧠 Winning strategies'
  },

  language: {
    title: 'Language'
  },

  stats: {
    title: 'Your progress',
    tabs: { achievements: '🏅 Achievements', rivals: '⚔️ Rivals' },
    played: 'Games',
    wins: 'Wins',
    losses: 'Losses',
    draws: 'Draws',
    streak: 'Streak',
    best: 'Best',
    note: 'Counts games against the AI, the daily challenge and online.',
    achievements: 'Achievements',
    progress: (unlocked, total) => `${unlocked} of ${total}`,
    unlocked: 'Achievement unlocked!'
  },

  achievements: {
    'first-win': { title: 'First win', description: 'Win your first game' },
    'beat-easy': { title: 'Warm-up', description: 'Beat the AI on Easy' },
    'beat-medium': { title: 'Strategist', description: 'Beat the AI on Medium' },
    'beat-hard': { title: 'Grandmaster', description: 'Beat the AI on Hard' },
    'online-win': { title: 'Challenger', description: 'Win an online match' },
    'daily-win': { title: 'Challenge accepted', description: 'Beat a daily challenge' },
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
