<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jogo da Velha 2.0</title>
  <meta name="author" content="TchêTec">
  <meta property="og:image" content="img/jogo-velha.png">
  <meta name="description" content="Jogo da velha 2.0: um jogo de estratégia onde os jogadores competem em mini-tabuleiros para dominar o tabuleiro principal. Cada jogada define onde o próximo jogador deve jogar, oferecendo uma experiência desafiadora e divertida. Jogue agora e teste suas habilidades táticas!">
  <meta name="keywords" content="jogo da velha 2">
  <meta name="robots" content="index, follow">

  <link rel="icon" type="image/png" href="img/jogo-velha.png">
  <meta property="og:locale" content="pt_BR">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/style.css">

  <script src="js/game.js" defer></script>
</head>

<body>

  <div class="container">

    <div class="top">
      <h1 class="title">Jogo da Velha<span> 2.0</span></h1>

      <p class="subtitle">
        Ganhe mini-tabuleiros para dominar o tabuleiro principal.
        Cada jogada define onde o próximo jogador deverá jogar.
      </p>

      <div class="info-bar">

        <div class="info-card">
          <div class="info-label">Turno atual</div>
          <div class="info-value" id="turnText">Jogador X</div>
        </div>

        <div class="info-card">
          <div class="info-label">Próximo tabuleiro</div>
          <div class="info-value" id="boardText">
            Livre
          </div>
        </div>

      </div>

    </div>

    <div class="main-board" id="mainBoard"></div>

    <div class="legend">
      <!-- 🔥 A posição clicada define o próximo mini-tabuleiro do adversário.<br> -->
      <!-- ⚡ Se o tabuleiro estiver fechado, o próximo jogador pode jogar em qualquer um aberto. -->
    </div>

  </div>

  <div class="modal" id="modal">
    <div class="modal-card">
      <div class="modal-title" id="modalTitle"></div>
      <div class="modal-subtitle">
        O jogo será reiniciado automaticamente.
      </div>
      <button class="btn" id="restartBtn">
        Jogar novamente
      </button>
    </div>
  </div>

</body>

</html>
