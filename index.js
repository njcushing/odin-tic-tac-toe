const gameControl = (() => {
    const _players = [];
    let _boardSizeStored = 3;
    let _AI = 0;
    const _AIMovingTimeoutIDs = [];
    let _AIMovingPlaceOverride = false;
    let turn = 0;
    let _movesPlayed = 0;
    let _firstGameStarted = false;
    let _gameWin = false;
    let _gameDraw = false;

    const changePlayerName = (player, newName) => {
        if (player === 1 || player === 2) {
            _players[player - 1].setName(newName);
            if (_players[player - 1].getName() === "") {
                _players[player - 1].setName(null);
            }
            if (_checkGamePlayable()) {
                _checkAIMove();
            }
            _displayControl.updatePlayerNames();
        }
    };

    const _checkGamePlayable = () => {
        if (
            _players[0].getName() !== null &&
            (_players[1].getName() !== null || _AI)
        ) {
            _displayControl.updateInformationString();
            _firstGameStarted = true;
            _displayControl.setGamePlaying(true);
            return true;
        }
        _displayControl.updateInformationString();
        _displayControl.setGamePlaying(false);
        _clearAIMoves();
        return false;
    };

    const reset = () => {
        if (_AI === 2) {
            _gameBoard.setBoardSize(3);
        } else {
            _gameBoard.setBoardSize(_boardSizeStored);
        }
        _displayControl.resetGameCells();
        _gameBoard.reset();
        _randomPlayer();
        _movesPlayed = 0;
        _gameWin = false;
        _gameDraw = false;
        _clearAIMoves();
        _checkRestrictedInput();
        if (_checkGamePlayable()) {
            _checkAIMove();
        }
        if (_firstGameStarted) {
            _displayControl.updateInformationString();
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
        if (_AI !== 2) _gameBoard.setBoardSize(newBoardSize);
        _boardSizeStored = newBoardSize;
        reset();
    };

    const toggleAI = () => {
        _AI = (_AI + 1) % 3;
        _displayControl.toggleAIButton();
        reset();
    };

    const _checkAIMove = () => {
        if (!_gameWin && !_gameDraw && turn === 1 && _AI) {
            _AIMovingTimeoutIDs.push(setTimeout(_AIMove, 3000));
        }
    };

    const _AIMove = () => {
        /* Unbeatable Mode using minimax solution */
        if (_AI === 2) {
            const values = [];
            const maximumDepth = 3;
            _AIMinimax(values, maximumDepth, 0, true, _gameBoard);
            if (values.length === 0) {
                /* Continue to random mode if no values found */
            } else {
                values.sort((a, b) => b[2] - a[2]);
                _AIMovingPlaceOverride = true;
                place(values[0][0], values[0][1]);
                return;
            }
        }

        /* Random Mode - Store empty cells in array. Select one at random. */
        const _boardSize = _gameBoard.getBoardSize();
        const _currentBoard = _gameBoard.getBoard();
        const _cells = [];
        for (let i = 0; i < _boardSize ** 2; i++) {
            const _cellX = i % _boardSize;
            const _cellY = Math.floor(i / _boardSize);
            if (_currentBoard[_cellY][_cellX] === null) {
                _cells.push([_cellX, _cellY]);
            }
        }
        const _randomCell = Math.floor(Math.random() * _cells.length);
        _AIMovingPlaceOverride = true;
        place(_cells[_randomCell][0], _cells[_randomCell][1]);
    };

    const _AIMinimax = (values, maximumDepth, depth, minmax, currBoard) => {
        if (depth >= maximumDepth) return;
        const boardCopy = Board();
        boardCopy.setBoardState(
            JSON.parse(JSON.stringify(currBoard.getBoard()))
        );
        const boardSize = boardCopy.getBoardSize();
        for (let i = 0; i < boardSize ** 2; i++) {
            const x = i % boardSize;
            const y = Math.floor(i / boardSize);
            if (boardCopy.getBoard()[y][x] === null) {
                boardCopy.place(x, y, "x");
                if (boardCopy.checkWin(x, y, "x")) {
                    boardCopy.remove(x, y);
                    values.push([x, y, 100 - depth]);
                    continue;
                }
                boardCopy.remove(x, y);
                boardCopy.place(x, y, "o");
                if (boardCopy.checkWin(x, y, "o")) {
                    boardCopy.remove(x, y);
                    values.push([x, y, 100 - depth]);
                    continue;
                }
                boardCopy.remove(x, y);
                if (boardCopy.checkDraw(_movesPlayed + depth)) {
                    values.push([x, y, 0]);
                    continue;
                }
                boardCopy.place(x, y, (depth + 1) % 2 === 0 ? "x" : "o");
                _AIMinimax(values, maximumDepth, depth + 1, !minmax, boardCopy);
                boardCopy.remove(x, y);
            }
        }
    };

    const _clearAIMoves = () => {
        _AIMovingTimeoutIDs.forEach((id) => {
            clearTimeout(id);
        });
    };

    const place = (x, y) => {
        if (!_checkRestrictedInput() || _AIMovingPlaceOverride) {
            _AIMovingPlaceOverride = false;
            const char = _players[turn].getChar();
            if (_gameBoard.place(x, y, char)) {
                _displayControl.updateCell(x, y, char);
                _movesPlayed++;
                _gameWin = _gameBoard.checkWin(x, y, char);
                _gameDraw = _gameBoard.checkDraw(_movesPlayed);
                turn = (turn + 1) % _players.length;
                _displayControl.updateInformationString();
                _checkRestrictedInput();
                _checkAIMove();
            }
        }
    };

    const _checkRestrictedInput = () => {
        if (_gameWin || _gameDraw || (turn === 1 && _AI)) {
            _displayControl.setRestrictInput(true);
            return true;
        }
        _displayControl.setRestrictInput(false);
        return false;
    };

    const Board = () => {
        let boardSize = 3;
        let board = [];

        const reset = () => {
            board = [];
            for (let i = 0; i < boardSize; i++) {
                board.push([]);
                for (let j = 0; j < boardSize; j++) {
                    board[board.length - 1].push(null);
                }
            }
        };
        reset();

        const place = (x, y, char) => {
            if (y >= 0 && y <= board.length && x >= 0 && x <= board[0].length) {
                if (board[y][x] === null) {
                    board[y][x] = char;
                    return true;
                }
                return false;
            }
            return false;
        };

        const remove = (x, y) => {
            if (y >= 0 && y <= board.length && x >= 0 && x <= board[0].length) {
                if (board[y][x] !== null) {
                    board[y][x] = null;
                }
            }
        };

        const setBoardState = (boardState) => {
            board = boardState;
        };

        const checkWin = (x, y, char) => {
            for (let col = 0; col < board[y].length; col++) {
                if (board[y][col] !== char) {
                    break;
                }
                if (col === board[y].length - 1) {
                    return true;
                }
            }
            for (let row = 0; row < board.length; row++) {
                if (board[row][x] !== char) {
                    break;
                }
                if (row === board.length - 1) {
                    return true;
                }
            }
            if (x === y) {
                for (let i = 0; i < board.length; i++) {
                    if (board[i][i] !== char) {
                        break;
                    }
                    if (i === board.length - 1) {
                        return true;
                    }
                }
            }
            if (x + y === board.length - 1) {
                for (let i = 0; i < board.length; i++) {
                    if (board[i][board.length - 1 - i] !== char) {
                        break;
                    }
                    if (i === board.length - 1) {
                        return true;
                    }
                }
            }
            return false;
        };

        const checkDraw = (movesPlayed) => movesPlayed === boardSize ** 2;

        const setBoardSize = (size) => {
            boardSize = size;
        };

        const getBoardSize = () => boardSize;

        const getBoard = () => board;

        return {
            reset,
            place,
            remove,
            setBoardState,
            checkWin,
            checkDraw,
            setBoardSize,
            getBoardSize,
            getBoard,
        };
    };
    const _gameBoard = Board();

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

    const _displayControl = (() => {
        const _gameArea = document.querySelector(".game-area");
        const _currentInfo = document.querySelector(".current-info");
        const _resetButton = document.querySelector(".reset-game");
        const _changeBoardSizeButton =
            document.querySelector(".change-board-size");
        const _AIButton = document.querySelector(".ai-button");
        const _playerOneName = document.querySelector(
            ".player-one .player-name"
        );
        const _playerTwoName = document.querySelector(
            ".player-two .player-name"
        );

        _resetButton.addEventListener("click", reset);
        _changeBoardSizeButton.addEventListener("click", changeBoardSize);
        _AIButton.addEventListener("click", toggleAI);
        _playerOneName.addEventListener("input", () =>
            changePlayerName(1, event.target.value)
        );
        _playerTwoName.addEventListener("input", () =>
            changePlayerName(2, event.target.value)
        );

        const updatePlayerNames = () => {
            _playerOneName.value = _players[0].getName();
            _playerTwoName.value = _players[1].getName();
        };

        const updateInformationString = () => {
            if (
                _players[0].getName() === null ||
                (_players[1].getName() === null && !_AI)
            ) {
                if (_firstGameStarted) {
                    _currentInfo.textContent =
                        "Please re-enter the player's name.";
                }
                return;
            }
            if (_gameWin) {
                if ((turn + 1) % _players.length === 1 && _AI) {
                    _currentInfo.textContent = "The computer is the winner!";
                } else {
                    _currentInfo.textContent = `${_players[
                        (turn + 1) % _players.length
                    ].getName()} (Player ${
                        ((turn + 1) % _players.length) + 1
                    }) is the winner!`;
                }
                return;
            }
            if (_gameDraw) {
                _currentInfo.textContent = "That game was a draw!";
                return;
            }
            if (_movesPlayed === 0) {
                if (turn === 1 && _AI) {
                    _currentInfo.textContent =
                        "It's the computer's move to start us off.";
                } else {
                    _currentInfo.textContent = `Here we go! ${_players[
                        turn
                    ].getName()} (Player ${turn + 1}), it's your turn first.`;
                }
            } else if (turn === 1 && _AI) {
                _currentInfo.textContent = "It's the computer's move next.";
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

        const updateCell = (x, y, char) => {
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
            }
            cell.childNodes[0].classList.add("no-select");
        };

        const toggleAIButton = () => {
            if (_AI === 0) {
                _gameArea.classList.remove("AI-random");
                _gameArea.classList.remove("AI-perfect");
                _AIButton.classList.remove("AI-random");
                _AIButton.classList.remove("AI-perfect");
                _playerTwoName.removeAttribute("disabled");
                _playerTwoName.value = _players[1].getName();
                return;
            }
            if (_AI === 1) {
                _gameArea.classList.add("AI-random");
                _AIButton.classList.add("AI-random");
                _playerTwoName.setAttribute("disabled", true);
                _playerTwoName.value = null;
                return;
            }
            if (_AI === 2) {
                _gameArea.classList.add("AI-perfect");
                _AIButton.classList.add("AI-perfect");
                _playerTwoName.setAttribute("disabled", true);
                _playerTwoName.value = null;
            }
        };

        const setGamePlaying = (bool) => {
            if (bool) {
                _gameArea.classList.add("playing");
            } else {
                _gameArea.classList.remove("playing");
            }
        };

        const setRestrictInput = (bool) => {
            if (bool) {
                _gameArea.classList.add("restrict-input");
            } else {
                _gameArea.classList.remove("restrict-input");
            }
        };

        const resetGameCells = () => {
            const gameArea = document.querySelector(".game-area");
            const areaWidth = parseInt(gameArea.style.width, 10);
            const areaHeight = parseInt(gameArea.style.height, 10);

            const gameCells = document.querySelectorAll(".game-cell");
            gameCells.forEach((cell) => cell.parentNode.removeChild(cell));

            const boardSize = _gameBoard.getBoardSize();
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
            updatePlayerNames,
            updateInformationString,
            updateCell,
            toggleAIButton,
            setGamePlaying,
            setRestrictInput,
            resetGameCells,
        };
    })();

    const getTurn = () => turn;

    const getBoard = () => _gameBoard.getBoard();

    reset();

    return {
        changePlayerName,
        reset,
        changeBoardSize,
        toggleAI,
        place,
        getTurn,
        getBoard,
    };
})();
