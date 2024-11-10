window.onload = (e) => {findData()};

function findData(){
    const POKE_URL = "https://pokeapi.co/api/v2/";

    let url = POKE_URL;

    url += "pokemon/ditto";

    getData(url);
}

function getData(url){
    let xhr = new XMLHttpRequest();

    xhr.onload = dataLoaded;

    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e){
    let xhr = e.target;

    document.querySelector("#ExampleContent").innerHTML = xhr.responseText;
}

function dataError(e){
    console.log("An error occured");
}