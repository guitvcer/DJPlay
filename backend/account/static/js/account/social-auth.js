const hash = document.location.hash, form = document.querySelector("#socialAuthForm"),
    access_input = document.querySelector('#id_access_token'),
    backend_input = document.querySelector('#id_backend');

if (hash !== "") {
    access_input.value = hash.split("=")[1].split("&")[0];
    backend_input.value = "VKOAuth2";
    form.submit();
}