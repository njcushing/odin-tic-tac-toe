const gameControl = (() => {
    const _players = [];
    let _AI = false;
    let turn = 0;
    let _movesPlayed = 0;
    let _firstGameStarted = false;
    let _gameWin = false;
    let _gameDraw = false;
    const _gameArea = document.querySelector(".game-area");
    const _AIButton = document.querySelector(".ai-button");
    const _playerOneName = document.querySelector(".player-one .player-name");
    const _playerTwoName = document.querySelector(".player-two .player-name");

    const _changePlayerName = (e, index) => {
        _players[index].setName(e.target.value);
        if (_players[index].getName() === "") {
            _players[index].setName(null);
        }
        _checkGamePlayable();
    };
    _playerOneName.addEventListener("input", () => _changePlayerName(event, 0));
    _playerTwoName.addEventListener("input", () => _changePlayerName(event, 1));

    const _checkGamePlayable = () => {
        if (
            _players[0].getName() !== null &&
            (_players[1].getName() !== null || _AI)
        ) {
            displayControl.updateInformationString();
            _firstGameStarted = true;
            _gameArea.classList.add("playing");
        } else {
            displayControl.updateInformationString();
            _gameArea.classList.remove("playing");
        }
    };

    const reset = () => {
        displayControl.resetGameCells();
        gameBoard.reset();
        _randomPlayer();
        _movesPlayed = 0;
        _gameWin = false;
        _gameDraw = false;
        _gameArea.classList.remove("game-over");
        if (_firstGameStarted) {
            displayControl.updateInformationString();
        }
    };

    const _randomPlayer = () => {
        turn = Math.floor(Math.random() * (_players.length - 1) + 0.5);
    };

    const changeBoardSize = () => {
        let newBoardSize;
        while (true) {
            newBoardSize = prompt(
                "Select a new board size between 3 and 9 inclusive:"
            );
            if (newBoardSize == null) {
                return;
            }
            newBoardSize = parseInt(newBoardSize, 10);
            if (Number.isNaN(newBoardSize)) {
                continue;
            }
            if (newBoardSize < 3 || newBoardSize > 9) {
                continue;
            }
            break;
        }
        gameBoard.setBoardSize(newBoardSize);
        reset();
    };

    const toggleAI = () => {
        if (_AI) {
            _AI = false;
            _gameArea.classList.remove("AI");
            _AIButton.classList.remove("AI");
        } else {
            _AI = true;
            _gameArea.classList.add("AI");
            _AIButton.classList.add("AI");
        }
    };
    _AIButton.addEventListener("click", toggleAI);

    const place = (x, y) => {
        if (!_gameArea.classList.contains("game-over")) {
            const char = _players[turn].getChar();
            if (gameBoard.place(x, y, char)) {
                const cell = document.querySelector(
                    `.game-cell[x="${x}"][y="${y}"]`
                );
                const img = cell.childNodes[0];
                cell.classList.add(char);
                switch (char) {
                    case "o":
                        img.setAttribute("src", "./img/nought.png");
                        break;
                    case "x":
                        img.setAttribute("src", "./img/cross.png");
                        break;
                    default:
                        break;
                }
                cell.childNodes[0].classList.add("no-select");
                _movesPlayed++;
                _checkWin(x, y, char);
                turn = (turn + 1) % _players.length;
                displayControl.updateInformationString();
            }
        }
    };

    const _checkWin = (x, y, char) => {
        const boardState = gameBoard.getBoard();
        const boardSize = gameBoard.getBoardSize();
        for (let col = 0; col < boardState[y].length; col++) {
            if (boardState[y][col] !== char) {
                break;
            }
            if (col === boardState[y].length - 1) {
                _gameWin = true;
                _gameArea.classList.add("game-over");
                return;
            }
        }
        for (let row = 0; row < boardState.length; row++) {
            if (boardState[row][x] !== char) {
                break;
            }
            if (row === boardState.length - 1) {
                _gameWin = true;
                _gameArea.classList.add("game-over");
                return;
            }
        }
        if (x === y) {
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i][i] !== char) {
                    break;
                }
                if (i === boardState.length - 1) {
                    _gameWin = true;
                    _gameArea.classList.add("game-over");
                    return;
                }
            }
        }
        if (x + y === boardState.length - 1) {
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i][boardState.length - 1 - i] !== char) {
                    break;
                }
                if (i === boardState.length - 1) {
                    _gameWin = true;
                    _gameArea.classList.add("game-over");
                    return;
                }
            }
        }
        if (_movesPlayed === boardSize ** 2) {
            _gameDraw = true;
            _gameArea.classList.add("game-over");
        }
    };

    const gameBoard = (() => {
        let _boardSize = 3;
        let _board = [];

        const reset = () => {
            _board = [];
            for (let i = 0; i < _boardSize; i++) {
                _board.push([]);
                for (let j = 0; j < _boardSize; j++) {
                    _board[_board.length - 1].push(null);
                }
            }
        };

        const place = (x, y, char) => {
            if (
                y >= 0 &&
                y <= _board.length &&
                x >= 0 &&
                x <= _board[0].length
            ) {
                if (_board[y][x] === null) {
                    _board[y][x] = char;
                    return true;
                }
                return false;
            }
            return false;
        };

        const setBoardSize = (size) => {
            _boardSize = size;
        };

        const getBoardSize = () => _boardSize;

        const getBoard = () => _board;

        return {
            reset,
            place,
            setBoardSize,
            getBoardSize,
            getBoard,
        };
    })();

    const Player = (name, char) => {
        let _name = name;
        const _char = char;

        const setName = (newName) => {
            _name = newName;
        };

        const getName = () => _name;

        const getChar = () => _char;

        return {
            setName,
            getName,
            getChar,
        };
    };
    _players.push(Player(null, "o"));
    _players.push(Player(null, "x"));

    const displayControl = (() => {
        const _currentInfo = document.querySelector(".current-info");
        const _resetButton = document.querySelector(".reset-game");
        const _changeBoardSizeButton =
            document.querySelector(".change-board-size");

        _resetButton.addEventListener("click", reset);
        _changeBoardSizeButton.addEventListener("click", changeBoardSize);

        const updateInformationString = () => {
            if (
                _players[0].getName() === null ||
                _players[1].getName() === null
            ) {
                if (_firstGameStarted) {
                    _currentInfo.textContent =
                        "Please re-enter the player's name.";
                }
                return;
            }
            if (_gameWin) {
                _currentInfo.textContent = `${_players[
                    (turn + 1) % _players.length
                ].getName()} (Player ${
                    ((turn + 1) % _players.length) + 1
                }) is the winner!`;
                return;
            }
            if (_gameDraw) {
                _currentInfo.textContent = "That game was a draw!";
                return;
            }
            if (_movesPlayed === 0) {
                _currentInfo.textContent = `Here we go! ${_players[
                    turn
                ].getName()} (Player ${turn + 1}), it's your turn first.`;
            } else {
                const rand = Math.floor(Math.random() * 3);
                switch (rand) {
                    case 0:
                        _currentInfo.textContent = `Next up: ${_players[
                            turn
                        ].getName()} (Player ${turn + 1}), it's your turn.`;
                        break;
                    case 1:
                        _currentInfo.textContent = `${_players[
                            turn
                        ].getName()} (Player ${
                            turn + 1
                        }), the next move is yours.`;
                        break;
                    case 2:
                        _currentInfo.textContent = `${_players[
                            turn
                        ].getName()} (Player ${turn + 1}), you're next up.`;
                        break;
                    default:
                        break;
                }
            }
        };

        const resetGameCells = () => {
            const gameArea = document.querySelector(".game-area");
            const areaWidth = parseInt(gameArea.style.width, 10);
            const areaHeight = parseInt(gameArea.style.height, 10);

            const gameCells = document.querySelectorAll(".game-cell");
            gameCells.forEach((cell) => cell.parentNode.removeChild(cell));

            const boardSize = gameBoard.getBoardSize();
            const gameContainer = document.querySelector(".game-container");
            const contPadding = parseInt(gameContainer.style.padding, 10);

            for (let i = 0; i < boardSize ** 2; i++) {
                const newCell = document.createElement("div");
                newCell.classList.add("game-cell");
                newCell.addEventListener("click", () =>
                    place(i % boardSize, Math.floor(i / boardSize))
                );
                newCell.setAttribute("x", i % boardSize);
                newCell.setAttribute("y", Math.floor(i / boardSize));
                gameContainer.appendChild(newCell);

                const img = document.createElement("img");
                newCell.appendChild(img);
            }

            const ctGap = Math.floor(20 / boardSize);
            gameContainer.style.gap = `${ctGap}px`;

            const cellWidth = Math.floor(
                (areaWidth - contPadding * 2 - ctGap * (boardSize - 1)) /
                    boardSize
            );
            const cellHeight = Math.floor(
                (areaHeight - contPadding * 2 - ctGap * (boardSize - 1)) /
                    boardSize
            );

            gameContainer.style.gridTemplateRows = `repeat(auto-fill, ${cellWidth}px)`;
            gameContainer.style.gridTemplateColumns = `repeat(auto-fill, ${cellHeight}px)`;
        };

        return {
            updateInformationString,
            resetGameCells,
        };
    })();

    const getTurn = () => turn;

    reset();

    return {
        reset,
        place,
        changeBoardSize,
        toggleAI,
        getTurn,
    };
})();
