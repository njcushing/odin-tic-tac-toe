const gameControl = (() => {
    const boardSize = 3;
    let board = [];
    let turn = 0;

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

    const place = (x, y) => {
        if (y >= 0 && y <= board.length && x >= 0 && x <= board[0].length) {
            if (board[y][x] === null) {
                if (turn === 0) {
                    board[y][x] = "o";
                    checkWin(x, y, "o");
                    turn = 1;
                } else {
                    board[y][x] = "x";
                    checkWin(x, y, "x");
                    turn = 0;
                }
            } else {
                alert(`There is already a '${board[y][x]}' here.`);
            }
        }
    };

    const checkWin = (x, y, char) => {
        for (let col = 0; col < board[y].length; col++) {
            if (board[y][col] !== char) {
                return;
            }
            if (col === board[y].length - 1) {
                announceWin();
            }
        }
        for (let row = 0; row < board.length; row++) {
            if (board[row][x] !== char) {
                return;
            }
            if (row === board.length - 1) {
                announceWin();
            }
        }
        if (x === y) {
            for (let i = 0; i < board.length; i++) {
                if (board[i][i] !== char) {
                    return;
                }
                if (i === board.length - 1) {
                    announceWin();
                }
            }
        }
        if (x + y === board.length - 1) {
            for (let i = 0; i < board.length; i++) {
                if (board[i][board.length - 1 - i] !== char) {
                    return;
                }
                if (i === board.length - 1) {
                    announceWin();
                }
            }
        }
    };

    const announceWin = () => {
        alert(`Player ${turn} has won the game!`);
    };

    const getBoard = () => board;
    const getTurn = () => turn;

    return {
        reset,
        place,
        getBoard,
        getTurn,
    };
})();

console.log(gameControl.getBoard());
