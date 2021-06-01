const username = document.querySelector('.username').innerHTML,
    startBlock = document.querySelector('.start'), return_move = document.querySelector('#return_move'),
    AtoO = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'],
    clear_field = document.querySelector('#clear_field');

let party_id, myMove = true, color, opponentUsername, findOpponentSocket, gomokuPartySocket, gomokuChatSocket,
    statusGomokuPartySocket = false;


// очистить поле
function clearField() {
    let dots = document.querySelectorAll('.dot');

    for (let i of dots) {
        i.classList.remove('white-dot');
        i.classList.remove('blue-dot');
        i.classList.remove('row_move');
        i.innerHTML = '';
    }

    myMove = true;
    move = 1;
}


function findOpponent() {
    // поиск соперника
    findOpponentSocket.send(JSON.stringify({
        'message': getCookie('access'),
    }));
    createCancelWaitingButton();
}



function cancelWaiting() {
    // отменить ожидание
    findOpponentSocket.close();
    createFindOpponentButton();
}



function giveUp() {
    // сдаться
    gomokuPartySocket.send(JSON.stringify({
        'party_id': party_id,
        'move': 'give_up',
    }));
}



clear_field.addEventListener('click', function() {
    if (statusGomokuPartySocket) {
        createAlert('danger-alert', 'Во время игры нельзя очищать поле');
        return;
    }

    clearField();
});



// обработчик на нажатие стрелками/enter в поле
field.addEventListener('keydown', function(event) {
    event.preventDefault();

    if (event.target.classList.contains('dot')) {
        let id = event.target.id;

        if (event.keyCode == '13') {
            // ENTER

            event.target.click();
        } else if (event.keyCode == '37') {
            // LEFT

            if (id[0] === 'a')
                if (id.length === 2)
                    document.querySelector('#o' + id[1]).focus();
                else document.querySelector('#o' + id[1] + id[2]).focus();
            else {
                let focusTo;
                if (id.length === 2) {
                    focusTo = '#' + AtoO[AtoO.indexOf(id[0]) - 1] + id[1];
                } else {
                    focusTo = '#' + AtoO[AtoO.indexOf(id[0]) - 1] + id[1] + id[2];
                }
                document.querySelector(focusTo).focus();
            }
        } else if (event.keyCode == '38') {
            // DOWN

            if (id[1] === 1 && id.length === 2) {
                document.querySelector('#' + id[0] + '15').focus();
            } else {
                let focusTo;

                if (id.length === 2) {
                    if (id[1] === '1')
                        focusTo = "#" + id[0] + "15";
                    else focusTo = "#" + id[0] + String(+id[1] - 1);
                } else if (id.length === 3) {
                    focusTo = "#" + id[0] + String(Number(String(id[1] + id[2])) - 1);
                }
                document.querySelector(focusTo).focus();
            }
        } else if (event.keyCode == '39') {
            // RIGHT

            if (id[0] === 'o')
                if (id.length === 2)
                    document.querySelector('#a' + id[1]).focus();
                else document.querySelector('#a' + id[1] + id[2]).focus();
            else {
                let focusTo;
                if (id.length === 2) {
                    focusTo = '#' + AtoO[AtoO.indexOf(id[0]) + 1] + id[1];
                } else {
                    focusTo = '#' + AtoO[AtoO.indexOf(id[0]) + 1] + id[1] + id[2];
                }

                document.querySelector(focusTo).focus();
            }
        } else if (event.keyCode == '40') {
            // UP

            if (id[1] === 1 && id[2] === 5) {
                document.querySelector('#' + id[0] + '1').focus();
            } else {
                let focusTo;

                if (id.length === 2) {
                    focusTo = "#" + id[0] + String(+id[1] + 1);
                } else if (id.length === 3) {
                    if (id[1] + id[2] === '15')
                        focusTo = "#" + id[0] + "1";
                    else focusTo = "#" + id[0] + String(Number(String(id[1] + id[2])) + 1);
                }
                document.querySelector(focusTo).focus();
            }
        }
    }
});


// отправить ход на сервер если игра с соперником
// зарегистрировать ход
field.onclick = function(event) {
    let target = event.target;

    if (target.classList.contains('dot') &&
        !target.classList.contains('blue-dot') &&
        !target.classList.contains('white-dot')
    ) {
        if (statusGomokuPartySocket) {
            if (myMove) {
                gomokuPartySocket.send(text_data=JSON.stringify({
                    'party_id': party_id,
                    'move': target.id,
                }));
            }
        } else {
            register_move(event.target);
        }
    }
}


function createFindOpponentButton() {
    /* создать кнопку для поиска соперника + удалить кнопки сдаться и отменить поиск соперника + вебсокет */

    try {
        let cancelWaitingButton = document.querySelector('#cancelWaitingButton');
        cancelWaitingButton.remove();
    } catch (e) {}

    try {
        let giveUpButton = document.querySelector('#giveUpButton');
        giveUpButton.remove();
    } catch (e) {}


    findOpponentSocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/gomoku/ws/find'
    );

    // когда игра найдена
    findOpponentSocket.onmessage = function(e) {
        createGiveUpButton();
        clearField();

        party_id = JSON.parse(e.data)['message'];

        let player1 = JSON.parse(e.data)['player1'];
        let player2 = JSON.parse(e.data)['player2'];

        // задать имя для соперника
        if (player1 === username)
            opponentUsername = player2;
        else
            opponentUsername = player1;


        // создать сообщение о начале игры
        createAlert('simple-alert', 'Вы играете против ' + opponentUsername);
        setEventForClose();


        findOpponentSocket.close();


        gomokuPartySocket = new WebSocket('ws://' + domain + '/gomoku/ws/play');



        statusGomokuPartySocket = true;

        gomokuPartySocket.onclose = function(e) {

        }

        return_move.onclick = function() {
            if (statusGomokuPartySocket) {
                let moves = document.querySelectorAll('.' + color),
                    coordinate = moves[moves.length-1].id;

                gomokuChatSocket.send(text_data=JSON.stringify({
                    'party_id': party_id,
                    'text': '/return_move',
                    'coordinate': coordinate,
                }));
            }
        }

        // получить от сервера ход
        gomokuPartySocket.onmessage = function(e) {
            let message = JSON.parse(e.data);

            if (message['username'] === username) {
                // Этот игрок сделал ход...

                if (message['move'] === 'give_up') {
                    // сдается
                    createAlert("danger-alert", "Вы проиграли.");
                    createFindOpponentButton();
                    gomokuPartySocket.close();
                    statusGomokuPartySocket = false;
                } else if (message['move'] === 'exit') {
                    // вышел из игры
                    createAlert("danger-alert", "Вы проиграли.");
                    createFindOpponentButton();
                    gomokuPartySocket.close();
                    statusGomokuPartySocket = false;
                } else if (message['move'] === 'nothing') {
                    // пропуск хода, после отмены ходы
                    myMove = false;
                } else {
                    // обычный ход, продолжающий партию
                    let dot = document.getElementById(message['move']);
                    myMove = false;
                    register_move(dot);

                    if (dot.innerHTML === '1')
                        color = 'white-dot';

                    if (message['win']) {
                        // побеждает, так как сделал линию из 5 точек
                        createAlert("success-alert", "Вы выиграли.");
                        createFindOpponentButton();
                        gomokuPartySocket.close();
                        statusGomokuPartySocket = false;

                        let row_moves = JSON.parse(message['row_moves']);

                        for (let row_move of row_moves) {
                            document.getElementById(row_move).classList.add('row_move');
                        }
                    } else createAlert('simple-alert', 'Ход соперника');
                }
            } else {
                // другой пользователь сделал ход...

                if (message['move'] === 'give_up') {
                    // сдается
                    createAlert("success-alert", "Соперник сдался. Вы выиграли.");
                    createFindOpponentButton();
                    gomokuPartySocket.close();
                    statusGomokuPartySocket = false;
                } else if (message['move'] === 'exit') {
                    // вышел из игры
                    createAlert("success-alert", "Соперник вышел из игры. Вы выиграли.");
                    createFindOpponentButton();
                    gomokuPartySocket.close();
                    statusGomokuPartySocket = false;
                } else if (message['move'] === 'nothing') {
                    // пропуск хода, после отмены хода
                    myMove = true;
                } else {
                    // обычный ход, продолжающий партию
                    let dot = document.getElementById(message['move']);
                    myMove = true;
                    register_move(dot);

                    if (dot.innerHTML === '1')
                        color = 'blue-dot';

                    if (message['win']) {
                        // побеждает, так как сделал линию из 5 точек
                        createAlert("danger-alert", "Вы проиграли.");
                        createFindOpponentButton();
                        gomokuPartySocket.close();
                        statusGomokuPartySocket = false;

                        let row_moves = JSON.parse(message['row_moves']);

                        for (let row_move of row_moves) {
                            document.getElementById(row_move).classList.add('row_move');
                        }
                    } else createAlert('simple-alert', 'Ваш ход');
                }
            }
        }

        gomokuChatSocket = new WebSocket('ws://' + domain + '/gomoku/ws/chat');

        gomokuChatSocket.onmessage = function(e) {
            let data = JSON.parse(e.data);

            if (data['text'] === '/return_move') {
                if (data['username'] === username) {
                    createAlert('simple-alert', 'Запрос отправлен');
                } else {
                    createAlert('simple-alert', 'Соперник запрашивает возвращение хода' +
                        '<button id="accept_return">&#9745;</button>' +
                        '<button id="decline_return">&#9746;</button>');

                    const accept_return = document.querySelector('#accept_return'),
                        decline_return = document.querySelector('#decline_return');

                    accept_return.addEventListener('click', function(event) {
                        gomokuChatSocket.send(text_data=JSON.stringify({
                            'text': '/return_move_accept',
                            'party_id': party_id,
                            'coordinate': data['coordinate'],
                        }));
                        gomokuPartySocket.send(text_data=JSON.stringify({
                            'party_id': party_id,
                            'move': 'nothing',
                        }));
                    });

                    decline_return.addEventListener('click', function() {
                        gomokuChatSocket.send(text_data=JSON.stringify({
                            'text': '/return_move_decline',
                            'party_id': party_id,
                        }));
                    });
                }
            } else if (data['text'] === '/return_move_accept') {
                for (let coordinate of data['removable_moves']) {
                    let move_el = document.querySelector('#' + coordinate)
                    move_el.classList.remove('white-dot');
                    move_el.classList.remove('blue-dot');
                    move_el.classList.remove('new_move');
                    move_el.innerHTML = "";
                    move--;
                }

                if (data['username'] === username) {
                    createAlert('simple-alert', 'Ход соперника был отменен')
                } else {
                    createAlert('success-alert', 'Соперник отменил Ваш ход');
                }
            } else if (data['text'] === '/return_move_decline') {
                if (data['username'] === username) {
                    createAlert('simple-alert', 'Ход соперника не был отменен');
                } else {
                    createAlert('danger-alert', 'Соперник не отменил ход');
                }
            }
        }

        setTimeout(function() {
            gomokuPartySocket.send(text_data=JSON.stringify({
                'party_id': party_id,
            }));
        }, 1000);
    }

    findOpponentSocket.onclose = function(e) {

    }

    // создание самой кнопки поиска соперника
    let findOpponentButton = document.createElement('button');
    findOpponentButton.className = 'findOpponentButton';
    findOpponentButton.id = 'findOpponentButton';
    findOpponentButton.innerHTML = 'Найти соперника';
    startBlock.append(findOpponentButton);

    findOpponentButton.addEventListener('click', findOpponent);
}



function createGiveUpButton() {
    /* создать кнопку сдаться удалив кнопку поиска соперника или отмены ожидания */

    try {
        let findOpponentButton = document.querySelector('#findOpponentButton');
        findOpponentButton.remove();
    } catch(e) {

    }

    try {
        let cancelWaitingButton = document.querySelector('#cancelWaitingButton');
        cancelWaitingButton.remove();
    } catch(e) {

    }


    // создание кнопки сдаться
    let giveUpButton = document.createElement('button');
    giveUpButton.className = 'giveUpButton';
    giveUpButton.id = 'giveUpButton';
    giveUpButton.innerHTML = 'Сдаться';
    startBlock.append(giveUpButton);

    giveUpButton.addEventListener('click', giveUp);
}



function createCancelWaitingButton() {
    /* создать кнопку отмены поиска соперника, удалив кнопку поиска соперника */

    let findOpponentButton = document.querySelector('#findOpponentButton');
    findOpponentButton.remove();

    let cancelWaitingButton = document.createElement('button');
    cancelWaitingButton.className = 'cancelWaitingButton';
    cancelWaitingButton.id = 'cancelWaitingButton';
    cancelWaitingButton.innerHTML = 'Отменить ожидание';
    startBlock.append(cancelWaitingButton);

    cancelWaitingButton.addEventListener('click', cancelWaiting);
}



createFindOpponentButton();