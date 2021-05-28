const chatHeader = document.querySelector('.chatHeader'),
    chatMessages = document.querySelector('.chatMessages'),
    chatInput = document.querySelector('.chatInput'),
    username = document.querySelector('.profile_link span').innerHTML,
    messageInput = document.querySelector('#messageInput'),
    chatInterlocutor = document.querySelector('.chatInterlocutor'),
    chatForm = document.querySelector('#chatForm'),
    access = getCookie('access'),
    selectChat = document.querySelector('.selectChat'),
    chatInterlocutorAvatar = document.querySelector('.chatHeader .chatUserAvatar'),
    backButton = document.querySelector('.backButton'),
    chatBlock = document.querySelector('.chatBlock'),
    usersList = document.querySelector('.usersList'),
    current_id = +getCookie('id');

let interlocutor_id;


// Загрузить выбранный чат
function loadSelectedChat(url) {
    for (let el of document.querySelectorAll('.userBlock'))
            el.classList.remove('selected');

    interlocutor_id = window.location.href.split("/")[window.location.href.split("/").length-2];

    chatMessages.innerHTML = "";

    sendRequest(url)
        .then(data => {
            chatInterlocutorAvatar.src = data[data.length-1]['avatar'];
            chatInterlocutor.innerHTML = data[data.length-1]['interlocutor'];
            chatInterlocutor.href = data[data.length-1]['link'];

            if (data.length > 1) {
                for (let i = 0; i < data.length - 1; i++) {
                    let message = data[i];

                    if (message.sent_to === +interlocutor_id) {
                        chatMessages.innerHTML += `
                            <div class="message message-sent-wrapper">
                                <div class="message-sent">${message.text}</div>
                            </div>`;
                    } else {
                        chatMessages.innerHTML += `
                            <div class="message message-received-wrapper">
                                <div class="message-received">${message.text}</div>
                            </div>`;
                    }

                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            } else {
                chatMessages.innerHTML = `
                    <h3 class="selectChat startChat">Напишите сообщение, чтобы начать общаться</h3>`;
            }
        });
}

// Скрыть/показать блоки чата (шапка, сообщения, форма)
function showOrHideBlocks() {
    loadLastMessages();

    if (window.location.pathname !== '/account/chat/') {
        // При выборе чата, то показывает блоки и загружает чат

        loadSelectedChat(window.location.href + 'api');

        chatHeader.classList.remove('d-none');
        chatMessages.classList.remove('d-none');
        chatInput.classList.remove('d-none');
        selectChat.classList.add('d-none');

        messageInput.focus();
    } else {
        // При скрытии чата, то скрывает блоки

        chatInterlocutorAvatar.src = "";
        chatInterlocutor.href = "";
        chatInterlocutor.innerHTML = "";
        chatMessages.innerHTML = "";
        interlocutor_id = null;

        chatHeader.classList.add('d-none');
        chatMessages.classList.add('d-none');
        chatInput.classList.add('d-none');
        selectChat.classList.remove('d-none');

        history.pushState(null, null, window.location.origin + '/account/chat/');
    }
}

// Отправить GET запрос для загрузки чата
function sendRequest(url, method = 'GET', body = null) {
    return fetch(url, {
        method: method,
        headers: {
            'Authorization': 'Bearer ' + access,
        }
    }).then(response => {
        return response.json();
    });
}

// Функция загрузки последний сообщения для блока с чатами слева
function loadLastMessages() {
    sendRequest(window.location.origin + '/account/chat/api')
        .then(data => {
            for (let chat of document.querySelectorAll('.userBlock')) {
                for (let message of data) {
                    let id = +(chat.id.split('_')[1]);

                    if (message.sent_to === id && message.sent_from === current_id) {
                        document.querySelector(`#${chat.id} .lastMessage`).innerHTML = 'Вы: ' + message.text;
                    } else if (message.sent_to === current_id && message.sent_from === id) {
                        document.querySelector(`#${chat.id} .lastMessage`).innerHTML = message.text;
                    }
                }
            }
        });
}

// Обработчик для ссылок на чат слева
for (let userBlock of document.querySelectorAll('.userBlock')) {
    userBlock.addEventListener('click', function(event) {
        event.preventDefault();

        let link;

        if (event.target.tagName === 'A') {
            link = event.target;
        } else if (event.target.tagName === 'H3') {
            link = event.target.firstChild;
        } else if (event.target.classList.contains('userBlock')) {
            link = event.target.childNodes[3].childNodes[1].childNodes[0];
        } else if (event.target.classList.contains('userBlockText')) {
            link = event.target.childNodes[1].childNodes[0];
        } else if (event.target.tagName === 'IMG') {
            link = event.target.parentNode.childNodes[3].childNodes[0];
        } else if (event.target.tagName === 'P') {
            link = event.target.closest('.userBlockText').childNodes[1].childNodes[0];
        }


        history.pushState(null, null, link.href);
        showOrHideBlocks();
        showOrHideChat();
    });
}

// Два обработчика для скрытия чата
backButton.addEventListener('click', function() {
    if (window.innerWidth <= 900) {
        usersList.classList.remove('d-none');
        chatBlock.classList.add('d-none');
    }

    history.pushState(null, null, window.location.origin + '/account/chat/');

    showOrHideBlocks();
    showOrHideChat();
});
document.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
        if (window.innerWidth <= 900) {
            usersList.classList.remove('d-none');
            chatBlock.classList.add('d-none');
        }

        history.pushState(null, null, window.location.origin + '/account/chat/');
        showOrHideBlocks();
        showOrHideChat();
    }
});

// Получение сообщений
chatSocket.onmessage = function(e) {
    let data = JSON.parse(e.data);

    if (data.type === 'message') {
        if (data.sent_from === username && data.sent_to === chatInterlocutor.innerHTML) {
            chatMessages.innerHTML += `
                <div class="message message-sent-wrapper">
                    <div class="message-sent">${data.text}</div>
                </div>`;
        } else if (data.sent_from === chatInterlocutor.innerHTML && data.sent_to === username) {
            chatMessages.innerHTML += `
                <div class="message message-received-wrapper">
                    <div class="message-received">${data.text}</div>
                </div>`;
            messageSound.play();
        }
    } else {
        createNewAlert('danger-alert', data.text);
        setEventForClose();
    }

    loadLastMessages();
}

// Обработчик для отправки сообщений
chatForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (messageInput.value.length === 0) return;

    chatSocket.send(text_data=JSON.stringify({
        'message': messageInput.value,
        'interlocutor': chatInterlocutor.innerHTML,
    }));

    chatForm.reset();
    setTimeout(function() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);

    try {
        document.querySelector('.startChat').remove();
    } catch (e) {}
});


// Скрыть/показать чат при изменении ширины экрана
function showOrHideChat() {
    if (window.innerWidth <= 900) {
        if (interlocutor_id == null) {
            chatBlock.classList.add('d-none');

            usersList.classList.remove('d-none');
            usersList.classList.add('w-100');
        } else {
            usersList.classList.add('d-none');

            chatBlock.classList.remove('d-none');
            chatBlock.classList.add('w-100');
        }
    } else {
        chatBlock.classList.remove('d-none');
        chatBlock.classList.remove('w-100');

        usersList.classList.remove('d-none');
        usersList.classList.remove('w-100');
    }
}
window.addEventListener('resize', showOrHideChat);


chatSearchForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (chatSearch.value.length !== 0) {
        sendRequest(`${window.location.origin}/account/chat/search?q=${chatSearch.value}`)
            .then(data => {});
    }
});


setEventForClose();
showOrHideBlocks();
showOrHideChat();
loadLastMessages();