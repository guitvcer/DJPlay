const chatSocket = new WebSocket('ws://' + domain + '/ws/chat');

// Получение сообщений
chatSocket.onmessage = function(e) {
    let data = JSON.parse(e.data);

    if (data.type === 'message') {
        createAlert('simple-alert', `${data.sent_from}: ${data.text}`);
    } else {
        createAlert('danger-alert', data.text);
    }
}