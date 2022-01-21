//engine.js should not and will not require any references from index.js and vice versa. There should be no correlation between the two apart from index referencing the necessary functions in engine.
//I will be reusing some of the code from my other repository where needed (https://github.com/nickacide/chess-engine/blob/latest/engine.js)

const STARTING_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;
const WHITE = 'w';
const BLACK = 'b';

//TODO: Remove excessive functionality, implement MiniMax algorithm (hopefully with some optimizations) and logical bug fixes.

/*
    I will be taking a different approach that I have seen on YouTube: 
    Instead of representing the board as Array(64), I will be adding to extra files/ranks on each side, giving us Array(144).
    This implementation will make it easier to check whether a piece has 'looked' too far in a certain direction.
    This applies for every piece, justifying the implementation's necessity. The second file/row is for knights. 
    Technically, we only need 1 layer on each side, but I will look into that in the future; let's just get the engine working.
*/
const indexOnBoard = index => {
    index -= 26;
    if (index >= 0 && index <= 91 && index % 12 < 8) return true;
    return false;
}
const inRange = index => index >= 0 && index < 64 ? true : false;
const toIndex8 = pIndex => {
    pIndex -= 26;
    return pIndex - Math.floor(pIndex / 12) * 4;
}
const toBoard8 = board => {
    const board8 = [];
    board.map(sq => {
        if (sq !== '_') board8.push(sq);
    });
    return board8;
}
const pieceColor = (board, pIndex) => {
    const piece = board[pIndex];
    if (piece === ' ' || piece === '_') return null;
    if (piece == piece.toUpperCase()) return WHITE;
    return BLACK;
}
const isPiece = piece => 'KQBNRPkqbnrp'.includes(piece) && piece.length == 1 ? true : false;
const checkFEN = fen => {
    if (fen.trim() === '') return false;
    if (fen.match(/^(([1-8]|[kqbnrKQBNR])+\/)(([1-8]|[kqpbrnKQPBRN])+\/){6}([1-8]|[kqbrnKQBRN]){0,8}( [wb]( (?! ))((K?Q?k?q?)|-) (([a-h][1-8])|-) (\d\d?) (\d\d?\d?))$/g)?.length !== 1) return false;
    let position = fen.split(' ')[0];
    if (position.match(/[K]/g)?.length !== 1 || position.match(/[k]/g)?.length !== 1) return false;
    return true;
}
const verifyFEN = fen => {
    if (!checkFEN(fen)) return false;
    const move = fen.split(' ')[1];
    const check = inCheck(fromFEN(fen));
    if (check == null) return false;
    if (check) if (move !== check) return false;
    let formatted = formatFEN(fen);
    let chars = 0;
    for (const char of formatted.split(' ')[0] + '/') {
        if (char == '/') {
            if (chars !== 8) return false;
            chars = 0;
        }
        else if (isPiece(char)) { chars++ }
        else if (parseInt(char)) { chars += parseInt(char) }
        else return false;
    }
    return true;
}
const inCheck = board => {
    const { wSpace, bSpace } = spaceControl(board);
    const check = [];
    if (wSpace.includes(board.indexOf('k'))) check.push(BLACK);
    if (bSpace.includes(board.indexOf('K'))) check.push(WHITE);
    if (check.length === 2) return null;
    if (check.length === 0) return false;
    return check[0];
}
const fromFEN = fen => {
    const board = [];
    for (i = 0; i < 144; i++) {
        if (indexOnBoard(i)) { board.push('') }
        else board.push('_')
    }
    const position = fen.split(" ")[0];
    let pointer = 26;
    for (const piece of position) {
        if (piece == '/') {
            pointer += 4;
        } else if (parseInt(piece)) {
            for (i = 0; i < parseInt(piece); i++) {
                board[pointer] = ' ';
                pointer++;
            }
        } else if (piece.match(/[KQBNRP]/gi)) {
            board[pointer] = piece;
            pointer++;
        }
    };
    return board;
}
const formatFEN = fen => {
    let currentTotal = 0;
    let newFEN = '';
    const position = fen.split(' ')[0];
    for (const char of position) {
        if (typeof parseInt(char) == 'number' && parseInt(char) > 0 && parseInt(char) <= 9) {
            currentTotal += parseInt(char);
        } else {
            if (currentTotal !== 0) newFEN += currentTotal;
            currentTotal = 0;
            newFEN += char;
        }
    };
    if (currentTotal !== 0) newFEN += currentTotal;
    newFEN += fen.slice(fen.indexOf(' '), fen.length)
    return newFEN;
}
const pieceLocations = (board, color) => {
    const pieces = [];
    board.forEach((square, sIndex) => {
        if (!isPiece(square)) return;
        if (color == BLACK && square == square.toUpperCase()) return;
        if (color == WHITE && square == square.toLowerCase()) return;
        pieces.push(sIndex);
    });
    return pieces;
}
const pieceMoves = (board, pIndex, options = { space: false }) => {
    const piece = board[pIndex];
    const pMoves = [];
    const { space } = options;
    switch (piece.toLowerCase()) {
        case "p": {
            //TODO: add more information to pawn movement in pieceMoves function. At the moment, a pawn move is seen as a "capture" by our function.
            const pColor = pieceColor(board, pIndex);
            const captures = pColor == WHITE ? [-13, -11] : [11, 13];
            const moves = pColor == WHITE ? [-12, -24] : [12, 24];
            if ((pColor == WHITE && !(pIndex > 97 && pIndex < 106)) || (pColor == BLACK && !(pIndex > 37 && pIndex < 46))) moves.pop();
            captures.map(capture => {
                let cIndex = pIndex + capture;
                if (space) return pMoves.push(cIndex);
                if (board[cIndex] !== ' ') {
                    if (pieceColor(board, cIndex) === pColor) return;
                    return pMoves.push(cIndex);
                }
            });
            moves.map(move => {
                if (space) return;
                let mIndex = pIndex + move;
                if (board[mIndex] !== ' ') return;
                return pMoves.push(mIndex);
            })
            break;
        } case "n": {
            [14, -14, 10, -10, 25, -25, 23, -23].map(move => {
                let newIndex = pIndex + move;
                if (space) return pMoves.push(newIndex);
                if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                if (board[newIndex] !== ' ') {
                    if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                    return pMoves.push(newIndex);
                }
                pMoves.push(newIndex);
            });
            break;
        } case "q": {
            [-11, 13, 11, -13, -12, 12, -1, 1].map(move => {
                for (i = 1; i < 8; i++) {
                    let newIndex = pIndex + move * i;
                    if (!indexOnBoard(newIndex)) return;
                    if (space) {
                        if (board[newIndex] !== ' ') return pMoves.push(newIndex);
                        pMoves.push(newIndex);
                    } else {
                        if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                        pMoves.push(newIndex);
                    }
                }
            });
            break;
        } case "b": {
            [-11, 13, 11, -13].map(move => {
                for (i = 1; i < 8; i++) {
                    let newIndex = pIndex + move * i;
                    if (space) {
                        if (board[newIndex] !== ' ') return pMoves.push(newIndex);
                        pMoves.push(newIndex)
                    } else {
                        if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                        if (board[newIndex] !== ' ') {
                            if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                            return pMoves.push(newIndex);
                        }
                        pMoves.push(newIndex);
                    }
                }
            });
            break;
        } case "k": {
            [-11, 13, 11, -13, -12, 12, -1, 1].map(move => {
                let newIndex = pIndex + move;
                if (space) return pMoves.push(newIndex);
                if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                if (board[newIndex] !== ' ') {
                    if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                    return pMoves.push(newIndex);
                }
                pMoves.push(newIndex);
            });
            break;
        } case "r": {
            [-12, 12, -1, 1].map(move => {
                for (i = 1; i < 8; i++) {
                    let newIndex = pIndex + move * i;
                    if (space) return pMoves.push(newIndex);
                    if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                    if (board[newIndex] !== ' ') {
                        if (pieceColor(board, newIndex) === pieceColor(board, pIndex)) return;
                        return pMoves.push(newIndex);
                    }
                    pMoves.push(newIndex);
                }
            });
            break;
        }
    }
    return [...new Set(pMoves)].filter(move => indexOnBoard(move)).sort((a, b) => a - b);
}
const spaceControl = board => {
    const wSpace = [];
    const bSpace = [];
    board.map((piece, pIndex) => {
        const pMoves = pieceMoves(board, pIndex, { space: true });
        pieceColor(board, pIndex) == WHITE ? wSpace.push(...pMoves) : bSpace.push(...pMoves);
    });
    return {
        wSpace: [...new Set(wSpace)].filter(indexOnBoard).sort((a, b) => a - b),
        bSpace: [...new Set(bSpace)].filter(indexOnBoard).sort((a, b) => a - b),
    }
}
const getMoves = board => {
    const wMoves = [];
    const bMoves = [];
    board.map((piece, pIndex) => {
        if (isPiece(piece)) {
            const pMoves = pieceMoves(board, pIndex);
            if (pMoves.length) pieceColor(board, pIndex) == WHITE ? wMoves.push([pIndex, pMoves]) : bMoves.push([pIndex, pMoves]);
        }
    });
    return {
        wMoves,
        bMoves,
    }
}
const applyMove = (board, pIndex, mIndex) => {
    let b = [...board];
    const piece = b[pIndex];
    b[pIndex] = ' ';
    b[mIndex] = piece;
    return b;
}
const evaluate = (board) => {
    const position = toBoard8(board);
    let getPiecesTotal = piece => position.filter(p => p == piece).length;
    let K = getPiecesTotal('K');
    let Q = getPiecesTotal('Q');
    let R = getPiecesTotal('R');
    let B = getPiecesTotal('B');
    let N = getPiecesTotal('N');
    let P = getPiecesTotal('P');

    let k = getPiecesTotal('k');
    let q = getPiecesTotal('q');
    let r = getPiecesTotal('r');
    let b = getPiecesTotal('b');
    let n = getPiecesTotal('n');
    let p = getPiecesTotal('p');
    const score = 999 * (K - k) + 9 * (Q - q) + 5 * (R - r) + 3 * (B - b) + 3 * (N - n) + (P - p) + 0.2 * (spaceControl(board).wSpace.length - spaceControl(board).bSpace.length);
    return score;
}
const gameOver = board => {
    if (board.indexOf('K') == -1 || board.indexOf('k') == -1) return true;
    return false;
}
const board64 = board => {
    let display = '';
    for (i = 0; i < board.length; i++) {
        if (board[i] == ' ') display += '__'; else display += board[i] + board[i];
        if ((i + 1) % 8 == 0) display += '\n';
    };
    return display;
}
const minimax = (board, depth, isWhite) => {
    if (depth == 0 || gameOver(board)) return evaluate(board);
    if (isWhite) {
        let max = -Infinity;
        for (const [pIndex, mIndexes] of getMoves(board).wMoves) {
            mIndexes.forEach(mIndex => {
                const newBoard = applyMove(board, pIndex, mIndex);
                const score = minimax(newBoard, depth - 1, false);
                max = Math.max(max, score);
            });
        };
        return max;
    } else {
        let min = Infinity;
        for (const [pIndex, mIndexes] of getMoves(board).bMoves) {
            mIndexes.forEach(mIndex => {
                const newBoard = applyMove(board, pIndex, mIndex);
                const score = minimax(newBoard, depth - 1, true);
                min = Math.min(min, score);
            });
        };
        return min;
    }
}
const b = fromFEN(STARTING_FEN);