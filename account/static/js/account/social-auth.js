const hash = document.location.hash, form = document.querySelector("#socialAuthForm"),
    access_input = document.querySelector('#id_access_token');

if (hash !== "") {
    access_input.value = hash.split("=")[1].split("&")[0];
    form.submit();
}