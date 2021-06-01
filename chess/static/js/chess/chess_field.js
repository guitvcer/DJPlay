const field = document.querySelector('.field'), a_to_h = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


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
                            alt="" class="piece">`;
                    } else if (letter === 'b' || letter === 'g') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/knight.png"
                            alt="" class="piece">`;
                    } else if (letter === 'c' || letter === 'f') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/bishop.png"
                            alt="" class="piece">`;
                    } else if (letter === 'd') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/queen.png"
                            alt="" class="piece">`;
                    } else if (letter === 'e') {
                        newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/king.png"
                            alt="" class="piece">`;
                    }
                } else if (i === 2 || i === 7) {
                    newCell.innerHTML += `<img src="/media/chess/pieces/${cellColor}/pawn.png" alt="" class="piece">`;
                }
            }
        }
    }
}

fillField('white');

// изменение размеров .field
function resizeField() {
    field.setAttribute('style', `height: ${field.offsetWidth}px`);

    for (let cell of document.querySelectorAll('.fieldCell')) {
        cell.setAttribute('style',
            `width: ${field.offsetWidth / 8}px; height: ${field.offsetWidth / 8}px`);
    }
}

resizeField();
window.addEventListener('resize', resizeField);