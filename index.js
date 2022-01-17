//The reason I am making a seperate project from my chess engine is because my chess engine is inefficient and poorly written. I'm trying to apply what I've learnt there, here.
const board = document.querySelector('#board');
const overlay = document.querySelector('#overlay');
const fenInput = document.querySelector('#fen');
let fen;


//not very proud of this segment, please suggest a better way to go about reacting
//accordingly to a resize of the board
const maintainAspectRatio = (el) => {
    el = el[0].target;
    if (parseInt(el.style.width) > 650) return;
    el.style.height = el.style.width;
    board.style.width = el.style.width;
    board.style.height = el.style.height;
    if (board.style.width == '') board.style.width = '500px';
    bWidth = parseInt(board.style.width)
    // if (bWidth == '') bWidth = '500';
    board.style['grid-template-columns'] = `repeat(8, ${(bWidth) / 8}px)`;
    overlay.style['grid-template-columns'] = `repeat(8, ${(bWidth) / 8}px)`;
    document.querySelector('#menu').style.width = board.style.width;
    // let fenLabel = document.querySelector('#fen');
    // if (fenLabel.style.width == '') fenLabel.style.width = '36px';
    document.querySelector('#fen').style.width = (bWidth - parseInt(document.querySelector('#fenLabel').offsetWidth) - 30) + 'px'
}
new ResizeObserver(maintainAspectRatio).observe(overlay);

const applyFEN = fen => {
    if (verifyFEN(fen)) {
        const board8 = toBoard8(fromFEN(fen));
        board8.map((piece, pIndex) => {
            if (isPiece(piece)) {
                let resourceName = pieceColor(board8, pIndex) == WHITE ? `w${piece}` : `b${piece}`;
                overlay.children[pIndex].style.backgroundImage = `url(/assets/${resourceName}.svg)`
            };
        });
    };
}

const main = () => {
    fen = STARTING_FEN;
    applyFEN(fen)
    const squareClick = (e, sIndex) => {
        if (isPiece(toBoard8(fromFEN(fen))[sIndex])) {
            console.log('yes')
        }
    }

    const overlayArr = Array.from(document.querySelector('#overlay').children);
    overlayArr.map((square, sIndex) => {
        square.onclick = e => squareClick(e, sIndex);
    });

    const fenChange = () => {
        if (verifyFEN(fenInput.value)) {
            fen = fenInput.value;
            applyFEN(fen);
        }
    }
    fenInput.onkeydown = fenChange;
    fenInput.onkeyup = fenChange;
}

//Wait for engine.js to load
document.addEventListener('DOMContentLoaded', main)