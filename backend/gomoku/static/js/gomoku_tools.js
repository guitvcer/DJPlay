// Получить определенный куки
function getCookie(name) {
    for (let i of document.cookie.split('; ')) {
        let j = i.split('=');
        if (j[0] === name) return j[1];
    }
}

// Эффект исчезновения
function fadeOut(el){
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

// Добавить событие для кнопки закрытия всплывающего сообщения
function setEventForClose() {
    document
        .querySelector('.close')
        .addEventListener('click', function(event) {
            event.preventDefault();
            fadeOut(event.currentTarget.closest('.alert'));
        });
}


function createAlert(alert_level, message) {
    // создать уведомление

    let alert = document.querySelector('.alert');

    if (alert.classList.contains('success-alert'))
        alert.classList.remove('success-alert');
    else if (alert.classList.contains('danger-alert'))
        alert.classList.remove('danger-alert');
    else if (alert.classList.contains('warning-alert'))
        alert.classList.remove('warning-alert');
    else if (alert.classList.contains('simple-alert'))
        alert.classList.remove('simple-alert');

    alert.classList.add(alert_level);

    alert.setAttribute('style', "");

    let h3 = document.querySelector('.alert h3');
    h3.innerHTML = message;
}

function createNewAlert(alert_level, message) {
    // создать новое уведомление

    document.body.innerHTML += `
         <div class="alert ${alert_level}">
            <h3>${message}</h3>
            <a class="close">&times;</a>
        </div>`;
}