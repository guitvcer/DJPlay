const field = document.querySelector('.field'), a_to_h = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

let selected_piece;


// заполнить поле
function fillField(color) {
    if (color === 'white') {
        for (let i = 8; i >= 1; i--) { // строка (число)
            for (let j = 0; j < 8; j++) { // столбец (буква)
                const letter = a_to_h[j],
                    id = letter + i;

                field.innerHTML += `<div id=${id} class="fieldCell"></div>`;

                const newCell = document.querySelector(`#${id}`);
                let cellColor;

                if (i <= 2) {
                    cellColor = 'white';
                } else if (i >= 7) {
                    cellColor = 'black';
                }

                if (i === 1 || i === 8) {
                    if (letter === 'a' || letter === 'h') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/rook.png"
                            alt="" class="piece rook ${cellColor}">`;
                    } else if (letter === 'b' || letter === 'g') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/knight.png"
                            alt="" class="piece knight ${cellColor}">`;
                    } else if (letter === 'c' || letter === 'f') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/bishop.png"
                            alt="" class="piece bishop ${cellColor}">`;
                    } else if (letter === 'd') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/queen.png"
                            alt="" class="piece queen ${cellColor}">`;
                    } else if (letter === 'e') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/king.png"
                            alt="" class="piece king ${cellColor}">`;
                    }
                } else if (i === 2 || i === 7) {
                    newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/pawn.png"
                        alt="" class="piece pawn ${cellColor}">`;
                }
            }
        }
    }
}


// изменение размеров .field
function resizeField() {
    field.setAttribute('style', `height: ${field.offsetWidth}px`);

    for (let cell of document.querySelectorAll('.fieldCell')) {
        cell.setAttribute('style',
            `width: ${field.offsetWidth / 8}px; height: ${field.offsetWidth / 8}px`);
    }
}


// убрать класс .selected со всех клеток
function unselectAllCells() {
    for (let cell of document.querySelectorAll('.fieldCell')) {
        cell.classList.remove('selected');
    }
}

function selectForRook(letter, number) {
    for (let i of a_to_h) {
        document.querySelector(`#${i}${number}`).classList.add('available-move');
    }
    for (let i = 1; i <= 8; i++) {
        document.querySelector(`#${letter}${i}`).classList.add('available-move');
    }
}

function selectForBishop(indexOfLetter, number) {
    for (let i = 1; i <= 8; i++) {
        try {
            document.querySelector(`#${a_to_h[indexOfLetter + i]}${number + i}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + i]}${number - i}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - i]}${number - i}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - i]}${number + i}`)
                .classList.add('available-move');
        } catch (e) {}
    }
}


// обработчик для поля
document.body.addEventListener('click', function(event) {
    for (let i of document.querySelectorAll('.available-move')) {
        i.classList.remove('available-move');
    }

    // если выбранная клетка уже выбрана, то отменить выбор и выйти из функции
    if (event.target.tagName === 'IMG') {
        if (event.target.closest('.fieldCell').classList.contains('selected')) {
            unselectAllCells();
            return;
        }
    } else if (event.target.classList.contains('fieldCell')) {
        try {
            if (event.target.classList.contains('selected')) {
                unselectAllCells();
                return;
            }
        } catch(e) {}
    }

    unselectAllCells();
    let selectedCell;

    // выбрать нажатую клетку
    if (event.target.tagName === 'IMG') {
        selectedCell = event.target.closest('.fieldCell');
    } else if (event.target.classList.contains('fieldCell')) {
        try {
            if (event.target.firstChild.tagName === 'IMG') {
                selectedCell = event.target;
            }
        } catch(e) {
            return;
        }
    }

    selectedPiece = selectedCell;

    selectedCell.classList.add('selected');

    let letter = selectedCell.id.split("")[0],
        number = Number(selectedCell.id.split("")[1]),
        piece = selectedCell.firstChild.classList[1],
        color = selectedCell.firstChild.classList[2],
        indexOfLetter = a_to_h.indexOf(letter);

    if (piece === 'pawn') {
        // выбрать доступные ходы для белой пешки
        if (color === 'white') {
            document.querySelector(`#${letter}${number+1}`).classList.add('available-move');
            document.querySelector(`#${letter}${number+2}`).classList.add('available-move');
        } else {
            document.querySelector(`#${letter}${number-1}`).classList.add('available-move');
            document.querySelector(`#${letter}${number-2}`).classList.add('available-move');
        }
    } else if (piece === 'rook') {
        selectForRook(letter, number);
    } else if (piece === 'knight') {
        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number + 2}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number + 2}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number - 2}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number - 2}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 2]}${number + 1}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 2]}${number - 1}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 2]}${number + 1}`)
                .classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 2]}${number - 1}`)
                .classList.add('available-move');
        } catch (e) {}
    } else if (piece === 'bishop') {
        selectForBishop(indexOfLetter, number);
    } else if (piece === 'queen') {
        selectForRook(letter, number);
        selectForBishop(indexOfLetter, number);
    } else if (piece === 'king') {
        try {
            document.querySelector(`#${a_to_h[indexOfLetter]}${number + 1}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number + 1}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number - 1}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter]}${number - 1}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number - 1}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number}`).classList.add('available-move');
        } catch (e) {}

        try {
            document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number + 1}`).classList.add('available-move');
        } catch (e) {}
    }
});

// обработчик escape
document.body.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
        unselectAllCells();
    }
    for (let i of document.querySelectorAll('.available-move')) {
        i.classList.remove('available-move');
    }
})


fillField('white');
resizeField();
window.addEventListener('resize', resizeField);