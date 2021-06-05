const field = document.querySelector('.field'), a_to_h = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    clearField = document.querySelector('#clear_field'),
    newMoveAudio = new Audio(src='/media/sounds/new_move.mp3');

let selected_piece, color = 'white';


// заполнить поле
function fillField(color) {
    field.innerHTML = '';

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
    for (let i of document.querySelectorAll('.available-move')) {
        i.classList.remove('available-move');
    }

    selectedPiece = null;
}


// выделить доступные клетки для ладьи
function selectForRook(letter, number) {
    // вверх по вертикали
    for (let i = number + 1; i <= 8; i++)
        if (!addAvailableMove(`${letter}${i}`)) break;

    // вниз по вертикали
    for (let i = number - 1; i >= 1; i--)
        if (!addAvailableMove(`${letter}${i}`)) break;


    let indexOfLetter = a_to_h.indexOf(letter);

    // влево по горизонтали
    for (let i = indexOfLetter - 1; i >= 0; i--)
        if (!addAvailableMove(`${a_to_h[i]}${number}`)) break;

    // вправо по горизонтали
    for (let i = indexOfLetter + 1; i <= 7; i++)
        if (!addAvailableMove(`${a_to_h[i]}${number}`)) break;
}


// выделить клетки для слона
function selectForBishop(indexOfLetter, number) {
    for (let i = 1; i <= 8; i++) {
        if (!addAvailableMove(`${a_to_h[indexOfLetter + i]}${number + i}`)) break;
    }

    for (let i = 1; i <= 8; i++) {
        if (!addAvailableMove(`${a_to_h[indexOfLetter + i]}${number - i}`)) break;
    }

    for (let i = 1; i <= 8; i++) {
        if (!addAvailableMove(`${a_to_h[indexOfLetter - i]}${number + i}`)) break;
    }

    for (let i = 1; i <= 8; i++) {
        if (!addAvailableMove(`${a_to_h[indexOfLetter - i]}${number - i}`)) break;
    }
}


// выделить клетки для пешки
function selectForPawn(colorOfPiece, letter, number) {
    let el = document.querySelector(`#${letter}${number}`);

    if (colorOfPiece === 'white') {
        let indexOfLetter = a_to_h.indexOf(letter),
            rightFrontCell = document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number + 1}`),
            leftFrontCell = document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number + 1}`),
            frontCell = document.querySelector(`#${letter}${number + 1}`);

        if (!hasElementEnemyPiece(frontCell)) {
            addAvailableMove(frontCell.id);
        }

        if (hasElementEnemyPiece(rightFrontCell)) {
            addAvailableMove(rightFrontCell.id);

            if (hasElementEnemyPiece(leftFrontCell)) {
                addAvailableMove(leftFrontCell.id);
            }
        } else if (hasElementEnemyPiece(leftFrontCell)) {
            addAvailableMove(leftFrontCell.id);
        }

        if (!el.firstChild.classList.contains('moved'))
            addAvailableMove(`${letter}${number + 2}`);
    } else {
        let indexOfLetter = a_to_h.indexOf(letter),
            rightFrontCell = document.querySelector(`#${a_to_h[indexOfLetter - 1]}${number - 1}`),
            leftFrontCell = document.querySelector(`#${a_to_h[indexOfLetter + 1]}${number - 1}`),
            frontCell = document.querySelector(`#${letter}${number - 1}`);

        if (!hasElementEnemyPiece(frontCell)) {
            addAvailableMove(frontCell.id);
        }

        if (hasElementEnemyPiece(rightFrontCell)) {
            addAvailableMove(rightFrontCell.id);

            if (hasElementEnemyPiece(leftFrontCell)) {
                addAvailableMove(leftFrontCell.id);
            }
        } else if (hasElementEnemyPiece(leftFrontCell)) {
            addAvailableMove(leftFrontCell.id);
        }

        if (!el.firstChild.classList.contains('moved'))
            addAvailableMove(`${letter}${number - 2}`);
    }
}


// выделить клетки для коня
function selectForKnight(indexOfLetter, number) {
    addAvailableMove(`${a_to_h[indexOfLetter - 1]}${number + 2}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 1]}${number + 2}`);
    addAvailableMove(`${a_to_h[indexOfLetter - 1]}${number - 2}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 1]}${number - 2}`);
    addAvailableMove(`${a_to_h[indexOfLetter - 2]}${number + 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter - 2]}${number - 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 2]}${number + 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 2]}${number - 1}`);
}


// выделить клетки для ферзя
function selectForQueen(indexOfLetter, letter, number) {
    selectForRook(letter, number);
    selectForBishop(indexOfLetter, number);
}


// выделить клетки для короля
function selectForKing(indexOfLetter, number) {
    addAvailableMove(`${a_to_h[indexOfLetter]}${number + 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 1]}${number + 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 1]}${number}`);
    addAvailableMove(`${a_to_h[indexOfLetter + 1]}${number - 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter]}${number - 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter - 1]}${number - 1}`);
    addAvailableMove(`${a_to_h[indexOfLetter - 1]}${number}`);
    addAvailableMove(`${a_to_h[indexOfLetter - 1]}${number + 1}`);
}


// выбрать клетки для фигуры
function selectForPiece(selectedCell) {
    let letter = selectedCell.id.split("")[0],
        number = Number(selectedCell.id.split("")[1]),
        piece = selectedCell.firstChild.classList[1],
        colorOfPiece = selectedCell.firstChild.classList[2],
        indexOfLetter = a_to_h.indexOf(letter);

    if (piece === 'pawn') {
        selectForPawn(colorOfPiece, letter, number);
    } else if (piece === 'rook') {
        selectForRook(letter, number);
    } else if (piece === 'knight') {
        selectForKnight(indexOfLetter, number);
    } else if (piece === 'bishop') {
        selectForBishop(indexOfLetter, number);
    } else if (piece === 'queen') {
        selectForQueen(indexOfLetter, letter, number);
    } else if (piece === 'king') {
        selectForKing(indexOfLetter, number);
    }
}


// получить наружный div фигуры (img)
function getDivOfPiece(el) {
    if (el.classList.contains('fieldCell')) return el;

    if (el.closest('.fieldCell')) return el.closest('.fieldCell');

    return false;
}


// имеет ли элемент дружную фигуру
function hasElementFriendPiece(el) {
    if (el.firstChild == null) return false;

    return el.firstChild.classList.contains(color);
}

// имеет ли элемент враждебную фигуру
function hasElementEnemyPiece(el) {
    if (el == null || el.firstChild == null) return false;

    return !el.firstChild.classList.contains(color);
}


// доступна ли клетка для фигуры
function isCellAvailableForPiece(id) {
    let el = document.querySelector(`#${id}`);

    if (hasElementEnemyPiece(el)) return 'enemy_piece';

    if (hasElementFriendPiece(el)) return 'friend_piece';

    return 'empty_cell';
}


// Добавить .availableMove выбранному элементу
function addAvailableMove(id) {
    el = document.getElementById(id);

    if (el == null) return;

    if (isCellAvailableForPiece(id) === 'empty_cell') {
        el.classList.add('available-move');
        return true;
    } else if (isCellAvailableForPiece(id) === 'enemy_piece') {
        el.classList.add('available-move');
        return false;
    }
    else return false;
}

// передвинуть фигуру
function movePiece(el) {
    el = getDivOfPiece(el);

    if (!hasElementFriendPiece(el) && el.classList.contains('available-move')) {
        el.innerHTML = selectedPiece.innerHTML;
        selectedPiece.innerHTML = "";
        selectedPiece = null;
        el.firstChild.classList.add('moved');

        unselectAllCells();

        if (status === 'offline') {
            if (color === 'white') color = 'black';
            else if (color === 'black') color = 'white';
        }

        newMoveAudio.play();

        return true;
    }

    return false;
}


// обработчик для поля
document.body.addEventListener('click', function(event) {
    // ничего не делать если кликнуто за пределами поля
    if (!(event.target.classList.contains('field') || event.target.closest('.field')))
        return;

    // передвинуть фигуру или съесть
    if (movePiece(event.target)) return;

    unselectAllCells();

    // если выбранная клетка уже выбрана, то отменить выбор и выйти из функции

    el = getDivOfPiece(event.target);

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
    if (event.target.tagName === 'IMG' && event.target.classList.contains(color)) {
        selectedCell = event.target.closest('.fieldCell');
    } else if (event.target.classList.contains('fieldCell')) {
        try {
            if (event.target.firstChild.tagName === 'IMG' && event.target.firstChild.classList.contains(color)) {
                selectedCell = event.target;
            }
        } catch(e) {
            return;
        }
    } else return;

    selectedPiece = selectedCell;

    selectedCell.classList.add('selected');

    // выделить клетки для фигуры
    selectForPiece(selectedCell);
});

// обработчик escape
document.body.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
        unselectAllCells();
    }
})


clearField.addEventListener('click', function () {
    if (status === 'offline') {
        color = 'white';
        fillField(color);
        createAlert('success', 'Доска обновлена.');
    }
});


fillField(color);
resizeField();
window.addEventListener('resize', resizeField);