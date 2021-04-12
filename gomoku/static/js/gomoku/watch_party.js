const field = document.querySelector('.field'), first_move = document.getElementById('first_move'),
    pre_move = document.getElementById('pre_move'), next_move = document.getElementById('next_move'),
    last_move = document.getElementById('last_move');

let number_of_last_move;


// добавить классы white-dot и blue-dot точкам из партии
for (let index in moves) {
    let dot = document.getElementById(moves[index].coordinate);
    dot.innerHTML = +index + 1;
    number_of_last_move = +index + 1;

    if (index % 2 === 0)
        dot.classList.add('white-dot');
    else
        dot.classList.add('blue-dot');
}


// первый ход
first_move.addEventListener('click', function() {
    for (let el of document.querySelectorAll('.dot')) {
        el.classList.remove('white-dot');
    }
    for (let el of document.querySelectorAll('.dot')) {
        el.classList.remove('blue-dot');
    }
    document.getElementById(moves[0].coordinate).classList.add('white-dot');
    number_of_last_move = 0;
});


// предыдущий ход
function pre_move_function() {
    try {
        if (number_of_last_move != 1) {
            document.getElementById(moves[number_of_last_move-1].coordinate).classList.remove('blue-dot');
            document.getElementById(moves[number_of_last_move-1].coordinate).classList.remove('white-dot');
            number_of_last_move -= 1;
        }
    } catch {}
}
pre_move.addEventListener('click', pre_move_function);


function next_move_function() {
    try {
        if (number_of_last_move % 2 == 0)
            document.getElementById(moves[number_of_last_move].coordinate).classList.add('white-dot');
        else
            document.getElementById(moves[number_of_last_move].coordinate).classList.add('blue-dot');
        number_of_last_move += 1;
    } catch {}
}

// следующий ход
next_move.addEventListener('click', next_move_function);

document.addEventListener('keydown', function(event) {
    // пред. ход
    if (event.keyCode == '37') {
        pre_move_function();
    } else if (event.keyCode == '39') {
        next_move_function();
    }
})


// последний ход
last_move.addEventListener('click', function() {
    for (let index in moves) {
        let dot = document.getElementById(moves[index].coordinate);
        dot.innerHTML = +index + 1;
        number_of_last_move = +index + 1;
        if (index % 2 === 0)
            dot.classList.add('white-dot');
        else
            dot.classList.add('blue-dot');
    }
});