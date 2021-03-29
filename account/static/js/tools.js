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
    alert.classList.add(alert_level);
    alert.setAttribute('style', "");

    let h3 = document.querySelector('.alert h3');
    h3.innerHTML = message;
}