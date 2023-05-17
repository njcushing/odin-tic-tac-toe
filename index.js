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
        if (y >= 0 && y <= _board.length && x >= 0 && x <= _board[0].length) {
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

const gameControl = (() => {
    const _players = [];
    const _AI = false;
    let _turn = 0;
    const _gameArea = document.querySelector(".game-area");
    const _AIButton = document.querySelector(".ai-button");
    const _resetButton = document.querySelector(".reset-game");
    const _changeBoardSizeButton = document.querySelector(".change-board-size");
    const _playerOneName = document.querySelector(".player-one .player-name");
    const _playerTwoName = document.querySelector(".player-two .player-name");

    _players.push(Player(null, "o"));
    _players.push(Player(null, "x"));

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
            _gameArea.setAttribute("playing", "");
        } else {
            _gameArea.removeAttribute("playing");
        }
    };

    const reset = () => {
        _resetGameCells();
        gameBoard.reset();
        _randomPlayer();
        _gameArea.classList.remove("game-over");
    };
    _resetButton.addEventListener("click", reset);

    const _randomPlayer = () => {
        _turn = Math.floor(Math.random() * (_players.length - 1) + 0.5);
    };

    const _changeBoardSize = () => {
        let newBoardSize;
        while (true) {
            newBoardSize = prompt(
                "Select a new board size between 3 and 9 inclusive:"
            );
            if (newBoardSize == null) {
                return;
            }
            newBoardSize = parseInt(newBoardSize);
            if (isNaN(newBoardSize)) {
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
    _changeBoardSizeButton.addEventListener("click", _changeBoardSize);

    const place = (x, y) => {
        if (!_gameArea.classList.contains("game-over")) {
            const char = _players[_turn].getChar();
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
                }
                cell.childNodes[0].classList.add("no-select");
                _checkWin(x, y, char);
                _turn = (_turn + 1) % _players.length;
            }
        }
    };

    const _checkWin = (x, y, char) => {
        const boardState = gameBoard.getBoard();
        for (let col = 0; col < boardState[y].length; col++) {
            if (boardState[y][col] !== char) {
                break;
            }
            if (col === boardState[y].length - 1) {
                _announceWin();
            }
        }
        for (let row = 0; row < boardState.length; row++) {
            if (boardState[row][x] !== char) {
                break;
            }
            if (row === boardState.length - 1) {
                _announceWin();
            }
        }
        if (x === y) {
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i][i] !== char) {
                    break;
                }
                if (i === boardState.length - 1) {
                    _announceWin();
                }
            }
        }
        if (x + y === boardState.length - 1) {
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i][boardState.length - 1 - i] !== char) {
                    break;
                }
                if (i === boardState.length - 1) {
                    _announceWin();
                }
            }
        }
    };

    const _announceWin = () => {
        alert(`Player ${_players[_turn].getName()} has won the game!`);
        _gameArea.classList.add("game-over");
    };

    const _resetGameCells = () => {
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
            (areaWidth - contPadding * 2 - ctGap * (boardSize - 1)) / boardSize
        );
        const cellHeight = Math.floor(
            (areaHeight - contPadding * 2 - ctGap * (boardSize - 1)) / boardSize
        );

        gameContainer.style.gridTemplateRows = `repeat(auto-fill, ${cellWidth}px)`;
        gameContainer.style.gridTemplateColumns = `repeat(auto-fill, ${cellHeight}px)`;
    };

    const getTurn = () => _turn;

    reset();

    return {
        reset,
        place,
        getTurn,
    };
})();
