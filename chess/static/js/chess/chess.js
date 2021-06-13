const username = document.querySelector('.username').innerHTML,
    startBlock = document.querySelector('.start');

let findOpponentSocket, chessPartySocket, statusChessPartySocket = false, opponentUsername;


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


function createFindOpponentButton() {
    /* создать кнопки поиска соперника и игры против компьютера */

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
        + '/chess/ws/find'
    );

    // когда игра найдена
    findOpponentSocket.onmessage = function(e) {
        createGiveUpButton();

        let data = JSON.parse(e.data),
            white = JSON.parse(e.data)['white'],
            black = JSON.parse(e.data)['black'];

        console.log(data);

        party_id = data['message'];

        // задать имя дла соперника и цвет
        if (white === username) {
            opponentUsername = black;
            color = 'white';
        } else {
            opponentUsername = white;
            color = 'black';
        }

        // создать сообщение о начале игры
        createAlert('simple-alert', `Вы играете против ${opponentUsername}`);
        setEventForClose();


        // закрыть сокет для поиска соперника
        findOpponentSocket.close();

        // создать новый сокет новой игры
        gomokuPartySocket = new WebSocket(`ws://${domain}/chess/ws/play`);

        statusChessPartySocket = true;

        chessPartySocket = function(e) {}

        // получить от сервера ход
        chessPartySocket.onmessage = function(e) {}

        // отправить id партии после подключении к сокету
        setTimeout(function() {
            chessPartySocket.send(text_data=JSON.stringify({
                'party_id': party_id,
            }));
        }, 1000);
    }

    // создание кнопки игры против компьютера
    if (document.querySelector('#playVSComputer') == null) {
        let playVSComputerButton = document.createElement('button');
        playVSComputerButton.className = 'startButton';
        playVSComputerButton.id = 'playVSComputer';
        playVSComputerButton.innerHTML = 'Играть против компьютера';
        startBlock.append(playVSComputerButton);
    }

    // создание кнопки поиска соперника
    let findOpponentButton = document.createElement('button');
    findOpponentButton.className = 'findOpponentButton';
    findOpponentButton.id = 'findOpponentButton';
    findOpponentButton.innerHTML = 'Найти соперника';
    startBlock.append(findOpponentButton);

    findOpponentButton.addEventListener('click', findOpponent);
}


function createGiveUpButton() {
    /* создать кнопу сдаться удалив кнопки игры с компьютером и поиска соперника или отмены ожидаения */

    try {
        let findOpponentButton = document.querySelector('#findOpponentButton');
        findOpponentButton.remove();
    } catch (e) {}

    try {
        let cancelWaitingButton = document.querySelector('#cancelWaitingButton');
        cancelWaitingButton.remove();
    } catch (e) {}

    try {
        let playVSComputer = document.querySelector('#playVSComputer');
        playVSComputer.remove();
    } catch (e) {}

    // создание кнопки сдаться
    let giveUpButton = document.createElement('button');
    giveUpButton.className = 'giveUpButton';
    giveUpButton.id = 'giveUpButton';
    giveUpButton.innerHTML = 'Сдаться';
    startBlock.append(giveUpButton);

    giveUpButton.addEventListener('click', giveUp);
}


function createCancelWaitingButton() {
    /* создать кнопку отмены поиска соперника, удалив кнопку игры против компьютера и поиска соперника */

    let findOpponentButton = document.querySelector('#findOpponentButton');
    findOpponentButton.remove();

    let playVSComputer = document.querySelector('#playVSComputer');
    playVSComputer.remove();

    // создание кнопки отмены поиска соперника
    let cancelWaitingButton = document.createElement('button');
    cancelWaitingButton.className = 'cancelWaitingButton';
    cancelWaitingButton.id = 'cancelWaitingButton';
    cancelWaitingButton.innerHTML = 'Отменить ожидание';
    startBlock.append(cancelWaitingButton);

    cancelWaitingButton.addEventListener('click', cancelWaiting);
}


createFindOpponentButton();