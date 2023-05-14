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

    const getBoard = () => _board;

    return {
        reset,
        place,
        setBoardSize,
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
    let _turn = 0;

    const addPlayer = (name, char) => {
        for (let i = 0; i < _players.length; i++) {
            if (_players[i].char === char) {
                alert("This character is already in use. Please pick another.");
                return;
            }
        }
        const newPlayer = Player(name, char);
        _players.push(newPlayer);
    };

    const reset = () => {
        gameBoard.setBoardSize(3);
        gameBoard.reset();
        _randomPlayer();
    };

    const _randomPlayer = () => {
        _turn = Math.floor(Math.random() * (_players.length - 1) + 0.5);
    };

    const place = (x, y) => {
        if (gameBoard.place(x, y, _players[_turn].char)) {
            _checkWin(x, y, _players[_turn].char);
            _turn = (_turn + 1) % _players.length;
        } else {
            alert(`There is already a '${gameBoard.getBoard()[y][x]}' here.`);
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
        alert(`Player ${_players[_turn].name} has won the game!`);
    };

    const getTurn = () => _turn;

    reset();

    return {
        reset,
        place,
        getTurn,
    };
})();
