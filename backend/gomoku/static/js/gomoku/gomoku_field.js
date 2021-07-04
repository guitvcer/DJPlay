const field = document.querySelector('.field'), new_move_sound = document.querySelector('#new_move_sound');
let n = 1, move = 1;

// создание точек
for (let i = 1; i <= 15; i++) {
    field.innerHTML += `<div class="row" id="row${i}"></div>`
    for (let j = 1; j <= 15; j++) {
        document.querySelector(`#row${i}`)
            .innerHTML += `<div class="dot" id="${String.fromCharCode(97 + i) + String(j)}" tabindex="${n}"></div>`;
    }
    n++;
}

// изменение высоты .field при изменении размера окна
function resizeFieldHeight() {
    field.setAttribute('style', `height: ${field.offsetWidth}px`);
    let value;
    if (window.innerWidth <= 600) {
        value = String((field.offsetWidth - 280) / 14) + 'px';
    } else {
        value = String((field.offsetWidth - 492) / 14) + 'px';
    }

    for (let row of document.querySelectorAll('.row')) {
        row.setAttribute('style', 'margin-right: ' + value)
    }

    for (let el of document.querySelectorAll('.dot')) {
        el.setAttribute('style', 'margin-bottom: ' + value);
    }
}

resizeFieldHeight();
window.addEventListener('resize', resizeFieldHeight);

// задать класс для точки после хода
function register_move(dot) {
    try {
        document.querySelector('.new_move').classList.remove('new_move');
    } catch(e) {}

    if (move % 2 === 0) {
        dot.classList.add('blue-dot');
    } else {
        dot.classList.add('white-dot');
    }

    dot.classList.add('new_move');
    dot.innerHTML = move;

    move++;

    new_move_sound.play();
}

// зарегистрировать ход
field.onclick = function(event) {
    let target = event.target;

    if (target.classList.contains('dot') &&
        !(target.classList.contains('blue-dot') ||
        target.classList.contains('white-dot'))
    ) {
        register_move(event.target);
    }
}