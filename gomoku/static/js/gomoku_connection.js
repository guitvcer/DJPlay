// Подключиться к вебсокету, чтобы сервер назначил пользователя как онлайн
let domain = (new URL(document.location.href)).host;
let connection = new WebSocket('ws://' + domain + '/ws');
