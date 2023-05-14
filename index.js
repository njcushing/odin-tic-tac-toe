const gameBoard = (() => {
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

    const setBoardSize = (size) => {
        boardSize = size;
    };

    const getBoard = () => board;

    return {
        reset,
        place,
        setBoardSize,
        getBoard,
    };
})();

const Player = (name) => {
    const setName = (newName) => {
        name = newName;
    };

    const getName = () => name;

    return { setName, getName };
};

const gameControl = (() => {
    const players = [];
    let turn = 0;

    const reset = () => {
        gameBoard.setBoardSize(3);
        gameBoard.reset();
        randomPlayer();
    };

    const randomPlayer = () => {
        turn = Math.floor(Math.random() * (players.length - 1) + 0.5);
    };

    const place = (x, y) => {
        if (gameBoard.place(x, y, players[turn].char)) {
            checkWin(x, y, players[turn].char);
            turn = (turn + 1) % players.length;
        } else {
            alert(`There is already a '${gameBoard.getBoard()[y][x]}' here.`);
        }
    };

    const checkWin = (x, y, char) => {
        const boardState = gameBoard.getBoard();
        for (let col = 0; col < boardState[y].length; col++) {
            if (boardState[y][col] !== char) {
                return;
            }
            if (col === boardState[y].length - 1) {
                announceWin();
            }
        }
        for (let row = 0; row < boardState.length; row++) {
            if (boardState[row][x] !== char) {
                return;
            }
            if (row === boardState.length - 1) {
                announceWin();
            }
        }
        if (x === y) {
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i][i] !== char) {
                    return;
                }
                if (i === boardState.length - 1) {
                    announceWin();
                }
            }
        }
        if (x + y === boardState.length - 1) {
            for (let i = 0; i < boardState.length; i++) {
                if (boardState[i][boardState.length - 1 - i] !== char) {
                    return;
                }
                if (i === boardState.length - 1) {
                    announceWin();
                }
            }
        }
    };

    const announceWin = () => {
        alert(`Player ${turn} has won the game!`);
    };

    const getTurn = () => turn;

    reset();

    return {
        reset,
        place,
        getTurn,
    };
})();
