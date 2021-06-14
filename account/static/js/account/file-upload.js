document.querySelector("html").classList.add('js');

var fileInput         = document.querySelector( ".input-file"),
    button            = document.querySelector( ".input-file-trigger"),
    the_return        = document.querySelector(".file-return"),
    clear_image_field = document.querySelector("#clear_image_field"),
    avatar            = document.querySelector("#id_avatar"),
    image             = document.querySelector(".mainuser-avatar img"),
    remove_avatar     = document.querySelector('#id_remove_avatar');

button.addEventListener( "keydown", function( event ) {
    if (event.keyCode == 13 || event.keyCode == 32) {
        fileInput.focus();
    }
});
button.addEventListener( "click", function( event ) {
    fileInput.focus();
    return false;
});
fileInput.addEventListener( "change", function( event ) {
    remove_avatar.value = "";

    the_return.innerHTML = this.value;

    if (event.target.files && event.target.files[0]) {
        let file = event.target.files[0],
            reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = function() {
            image.src = reader.result;
        }
    }
});
clear_image_field.addEventListener("click", function() {
    remove_avatar.value = 'off';
    the_return.innerHTML = "";
    image.src = "/media/user.png";
});