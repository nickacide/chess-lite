//The reason I am making a seperate project from my chess engine is because my chess engine is inefficient and poorly written. I'm trying to apply what I've learnt there, here.
const board = document.querySelector('#board');
const overlay = document.querySelector('#overlay');

//not very proud of this segment, please suggest a better way to go about reacting
//accordingly to a resize of the board
const maintainAspectRatio = (el) => {
    el = el[0].target;
    el.style.height = el.style.width;
    board.style.width = el.style.width;
    board.style.height = el.style.height;
    bWidth = board.style.width.replace(/\D/gi, '');
    if (bWidth == '') bWidth = '500';
    board.style['grid-template-columns'] = `repeat(8, ${Number(bWidth) / 8}px)`
    overlay.style['grid-template-columns'] = `repeat(8, ${Number(bWidth) / 8}px)`
}
new ResizeObserver(maintainAspectRatio).observe(overlay);

const squareClick = (e, sIndex) => {
    console.log(e, sIndex)
}

const applyFEN = fen => {
    if (verifyFEN(fen)) {
        const board8 = toBoard8(fromFEN(fen));
        board8.map((piece, pIndex) => {
            if (isPiece(piece)) {
                let resourceName = pieceColor(board8, pIndex) == WHITE ? `w${piece}` : `b${piece}`;
                overlay.children[pIndex].style.backgroundImage = `url(/assets/${resourceName}.svg)`
            }
        })
    };
}

const overlayArr = Array.from(document.querySelector('#overlay').children);
overlayArr.map((square, sIndex) => {
    square.onclick = e => squareClick(e, sIndex);
})
