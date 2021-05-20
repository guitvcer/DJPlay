const chatSocket = new WebSocket('ws://' + domain + '/ws/chat'),
    messageSound = new Audio(src=`${window.location.origin}/media/sounds/message.mp3`);

// Получение сообщений
chatSocket.onmessage = function(e) {
    let data = JSON.parse(e.data);

    if (data.type === 'message') {
        createNewAlert('simple-alert', `${data.sent_from}: ${data.text}`);
        messageSound.play();
    } else {
        createNewAlert('danger-alert', data.text);
    }

    setEventForClose();
}