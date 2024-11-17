window.onload = (e) => {document.querySelector("#search").onclick = findData;
                        document.querySelector("#option").onchange = selectionChange;
                        optionSelector = document.querySelector("#option");
                        optionSelection = optionSelector.value;
                        searchTerm = document.querySelector("#searchterm");
                        searchTerm.innerHTML = `Search Term -> <input type="text" size="20" maxlength="20" autofocus value="pikachu" />`;
                        };

let optionSelector = null;
let optionSelection = null;
let searchTerm = null;
let pokemonList = null;

function selectionChange(){
    optionSelection = optionSelector.value

    if (optionSelection == "pokemon")
    {
        searchTerm.innerHTML = `Search Term -> <input type="text" size="20" maxlength="20" autofocus value="pikachu" />`;
    }
    else if (optionSelection == "ability") {
        searchTerm.innerHTML = `Ability options -> `
        searchTerm.innerHTML += `<select>
                                <option value="early-bird" selected>Early Bird</option>
                                <option value="damp">Damp</option>
                                <option value="chlorophyll">Chlorophyll</option>
                            </select>`;
        searchTerm.innerHTML += `<br>Result limit -> <input id="resultLimit" type="text" size="20" maxlength="20" autofocus value="5" />`
    }
    else {
        searchTerm.innerHTML = `Type options ->`;
        searchTerm.innerHTML += `<select>
                                <option value="normal" selected>Normal</option>
                                <option value="fire">Fire</option>
                                <option value="ice">Ice</option>
                            </select>`;
        searchTerm.innerHTML += `<br>Result limit -> <input id="resultLimit" type="text" size="20" maxlength="20" autofocus value="5" />`
    }
}

function findData(){
    const POKE_URL = "https://pokeapi.co/api/v2/";

    let url = POKE_URL;

    url += optionSelection;

    let term = searchTerm.childNodes[1].value;
    displayTerm = term;

    term = term.trim();

    url += "/" + term;

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

    let obj = JSON.parse(xhr.responseText);
    console.log(obj);

    let returnable = "";

    if (optionSelection == "pokemon") {
        returnable = `<div id='pokemon'>`;
        let pokemonImage = obj.sprites.front_default;
        returnable += `<img src='${pokemonImage}' title='pokemon_image' /><br>`;
        returnable += "Name: " + obj.name + `<br>`;
        returnable += "HP: " + obj.stats[0].base_stat + `<br>`;
        returnable += "Attack: " + obj.stats[1].base_stat + `<br>`;
        returnable += "Defense: " + obj.stats[2].base_stat + `<br>`;
        returnable += "Speed: " + obj.stats[5].base_stat + `<br>`;
        returnable += `</div>`
    }
    else {
        pokemonList = obj.pokemon;
        
        for (let i = 0; i < document.querySelector("#resultLimit").value && pokemonList.length; i++)
        {
            getPokemon(pokemonList[i].pokemon.url);
        }
    }

    document.querySelector("#content").innerHTML = returnable;
}

function dataError(e){
    console.log("An error occured");
}

function getPokemon(url){
    let xhr = new XMLHttpRequest();

    xhr.onload = addPokemon;

    xhr.onerror = dataError;

    document.querySelector("#content").innerHTML = "";

    xhr.open("GET", url);
    xhr.send();
}

function addPokemon(e){
    let xhr = e.target;

    let obj = JSON.parse(xhr.responseText);
    console.log(obj);

    let returnable = `<div id='pokemon'>`;
    let pokemonImage = obj.sprites.front_default;
    returnable += `<img src='${pokemonImage}' title='pokemon_image' /><br>`;
    returnable += "Name: " + obj.name + `<br>`;
    returnable += "HP: " + obj.stats[0].base_stat + `<br>`;
    returnable += "Attack: " + obj.stats[1].base_stat + `<br>`;
    returnable += "Defense: " + obj.stats[2].base_stat + `<br>`;
    returnable += "Speed: " + obj.stats[5].base_stat + `<br>`;
    returnable += `</div>`
    
    document.querySelector("#content").innerHTML += returnable
}