const chatSocket = new WebSocket('ws://' + domain + '/ws/chat'),
    messageSound = new Audio(src=`${window.location.origin}/media/sounds/message.mp3`);

// Получение сообщений
chatSocket.onmessage = function(e) {
    let data = JSON.parse(e.data);

    if (data.type === 'message' && data.sent_to === document.querySelector('.username').innerHTML) {
        createNewAlert('simple-alert', `${data.sent_from} пишет: ${data.text}`);
    } else if (data.type !== 'message' && data.sent_to === document.querySelector('.username').innerHTML) {
        createNewAlert('danger-alert', data.text);
    }

    setEventForClose();
}