let main = document.querySelector('main');
let menu = document.querySelector('.menu');


// обработчик всплывающего меню при нажатии на аватарку

if (menu !== null) {
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('account')
            || event.target.classList.contains('username')
            || event.target.classList.contains('user-avatar')
        ) {
            if (menu.classList.contains('menu-visible'))
                menu.classList.remove('menu-visible');
            else
                menu.classList.add('menu-visible');
        } else if (!event.target.classList.contains('account')
            || !event.target.classList.contains('username')
            || !event.target.classList.contains('user-avatar')
        ) {
            menu.classList.remove('menu-visible');
        }
    });
}