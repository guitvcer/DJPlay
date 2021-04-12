let n = 1, field = document.querySelector('.field');

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