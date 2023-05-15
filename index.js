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
    let _char = char;

    const setName = (newName) => {
        _name = newName;
    };

    const getName = () => _name;

    const setChar = (newChar) => {
        _char = newChar;
    };

    const getChar = () => _char;

    return {
        setName,
        getName,
        setChar,
        getChar,
    };
};

const gameControl = (() => {
    const _players = [];
    const _enabled = true;
    let _turn = 0;
    const _resetButton = document.querySelector(".reset-game");

    const addPlayer = (name, char) => {
        for (let i = 0; i < _players.length; i++) {
            if (_players[i].getChar() === char) {
                alert("This character is already in use. Please pick another.");
                return;
            }
        }
        const newPlayer = Player(name, char);
        _players.push(newPlayer);
        reset();
    };

    const reset = () => {
        _resetGameCells();
        gameBoard.setBoardSize(3);
        gameBoard.reset();
        _randomPlayer();
    };
    _resetButton.addEventListener("click", reset);

    const _randomPlayer = () => {
        _turn = Math.floor(Math.random() * (_players.length - 1) + 0.5);
    };

    const place = (x, y) => {
        if (_enabled) {
            if (gameBoard.place(x, y, _players[_turn].getChar())) {
                _checkWin(x, y, _players[_turn].getChar());
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
    };

    const _resetGameCells = () => {
        const gameArea = document.querySelector(".game-area");
        console.log(gameArea.style);
        const areaWidth = parseInt(gameArea.style.width, 10);
        const areaHeight = parseInt(gameArea.style.height, 10);

        const gameCells = document.querySelectorAll(".game-cell");
        gameCells.forEach((cell) => cell.parentNode.removeChild(cell));

        const boardSize = gameBoard.getBoardSize();
        const gameContainer = document.querySelector(".game-container");
        const contPadding = parseInt(gameContainer.style.padding, 10);

        for (let i = 0; i < boardSize ** 2; i++) {
            const newCell = _newCell();
            newCell.setAttribute("x", i % boardSize);
            newCell.setAttribute("y", Math.floor(i / boardSize));
            gameContainer.appendChild(newCell);
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

    const _newCell = () => {
        const newCell = document.createElement("div");
        newCell.classList.add("game-cell");
        newCell.addEventListener("click", place);

        return newCell;
    };

    const getTurn = () => _turn;

    reset();

    return {
        reset,
        place,
        getTurn,
    };
})();
