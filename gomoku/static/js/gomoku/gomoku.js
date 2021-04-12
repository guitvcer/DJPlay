const username = document.querySelector('.username').innerHTML,
    startBlock = document.querySelector('.start'),
    AtoO = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];

let party_id, myMove = true,
    opponentUsername, findOpponentSocket, gomokuPartySocket, statusGomokuPartySocket = false;


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
field.addEventListener('click', function(event) {
    let target = event.target;

    if (target.classList.contains('dot') &&
        !(target.classList.contains('blue-dot') ||
        target.classList.contains('white-dot'))
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
});


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
                } else {
                    // обычный ход, продолжающий партию
                    let dot = document.getElementById(message['move']);
                    myMove = false;
                    register_move(dot);

                    try {
                        if (message['win']) {
                            // побеждает, так как сделал линию из 5 точек
                            createAlert("success-alert", "Вы выиграли.");
                            //clearField();
                            createFindOpponentButton();
                            gomokuPartySocket.close();
                            statusGomokuPartySocket = false;

                            let row_moves = JSON.parse(message['row_moves']);

                            for (let row_move of row_moves) {
                                document.getElementById(row_move).classList.add('row_move');
                            }
                        }
                    } catch(e) {}
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
                } else {
                    // обычный ход, продолжающий партию
                    let dot = document.getElementById(message['move']);
                    myMove = true;
                    register_move(dot);

                    try {
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
                        }
                    } catch(e) {}
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