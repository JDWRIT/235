window.onload = (e) => {document.querySelector("#search").onclick = findData;
                        document.querySelector("#option").onchange = selectionChange;
                        optionSelector = document.querySelector("#option");
                        optionSelection = optionSelector.value;
                        searchTerm = document.querySelector("#searchterm");
                        searchTerm.innerHTML = `<h3>Pokemon's name: </h3> <input id="name" type="text" size="20" maxlength="20" autofocus value="pikachu" />`;
                        if (localStorage.getItem("jsd3713-searchTerm") != "") { searchTerm.childNodes[2].value = localStorage.getItem("jsd3713-searchTerm"); }
                        searchTerm.childNodes[2].onchange = e => { localStorage.setItem("jsd3713-searchTerm", e.target.value); };
                        content = document.querySelector("#content");
                        if (localStorage.getItem("jsd3713-optionSelection")) { 
                            optionSelector.value = localStorage.getItem("jsd3713-optionSelection");
                            selectionChange(); }
                        };

window.addEventListener("keydown", keyPressed);

function keyPressed(e) {
    if (e.code == "Enter") {
        findData();
    }
}

let optionSelector = null;
let optionSelection = null;
let searchTerm = null;
let pokemonList = null;
let content = null;

function selectionChange(){
    optionSelection = optionSelector.value
    localStorage.setItem("jsd3713-optionSelection", optionSelector.value);

    if (optionSelection == "pokemon")
    {
        searchTerm.innerHTML = `<h3>Pokemon's name: </h3> <input id="name" type="text" size="20" maxlength="20" autofocus value="pikachu" />`;
        searchTerm.childNodes[2].value = localStorage.getItem("jsd3713-searchTerm");
        searchTerm.childNodes[2].onchange = e => { localStorage.setItem("jsd3713-searchTerm", e.target.value); };
    }
    else if (optionSelection == "ability") {
        searchTerm.innerHTML = `<h3>Pokemon's ability: </h3> `
        searchTerm.innerHTML += `<select id="selector">
                                <option value="stench" selected>Stench</option>
                                <option value="speed-boost">Speed Boost</option>
                                <option value="battle-armor">Battle Armor</option>
                                <option value="sturdy">Sturdy</option>
                                <option value="damp">Damp</option>
                                <option value="limber">Limber</option>
                                <option value="sand-veil">Sand Veil</option>
                                <option value="static">Static</option>
                                <option value="volt-absorb">Volt Absorb</option>
                                <option value="water-absorb">Water Absorb</option>
                                <option value="oblivious">Oblivious</option>
                                <option value="cloud-nine">Cloud Nine</option>
                                <option value="compound-eyes">Compound Eyes</option>
                                <option value="insomnia">Insomnia</option>
                                <option value="immunity">Immunity</option>
                                <option value="flash-fire">Flash Fire</option>
                                <option value="shield-dust">Shield Dust</option>
                                <option value="own-tempo">Own Tempo</option>
                                <option value="early-bird">Early Bird</option>
                                <option value="chlorophyll">Chlorophyll</option>
                            </select>`;
        searchTerm.innerHTML += `<h3>Max number of results: </h3> <input id="resultLimit" type="number" size="20" maxlength="20" autofocus value="5" />`
        if (localStorage.getItem("jsd3713-selectedOptionAbility")) { document.querySelector("#selector").value = localStorage.getItem("jsd3713-selectedOptionAbility"); }
        if (localStorage.getItem("jsd3713-displayCountAbility")) { document.querySelector("#resultLimit").value = localStorage.getItem("jsd3713-displayCountAbility"); }
        document.querySelector("#selector").onchange = e => { localStorage.setItem("jsd3713-selectedOptionAbility", e.target.value); };
        document.querySelector("#resultLimit").onchange = e => { localStorage.setItem("jsd3713-displayCountAbility", e.target.value); };
    }
    else {
        searchTerm.innerHTML = `<h3>Pokemon's type: </h3> `;
        searchTerm.innerHTML += `<select id="selector">
                                <option value="normal" selected>Normal</option>
                                <option value="fighting">Fighting</option>
                                <option value="flying">Flying</option>
                                <option value="poison">Poison</option>
                                <option value="ground">Ground</option>
                                <option value="rock">Rock</option>
                                <option value="bug">Bug</option>
                                <option value="ghost">Ghost</option>
                                <option value="steel">Steel</option>
                                <option value="fire">Fire</option>
                                <option value="water">Water</option>
                                <option value="grass">Grass</option>
                                <option value="electric">Electric</option>
                                <option value="psychic">Psychic</option>
                                <option value="ice">Ice</option>
                                <option value="dragon">Dragon</option>
                                <option value="dark">Dark</option>
                                <option value="fairy">Fairy</option>
                            </select>`;
        searchTerm.innerHTML += `<h3>Max number of results: </h3> <input id="resultLimit" type="number" size="20" maxlength="20" autofocus value="5" />`
        if (localStorage.getItem("jsd3713-selectedOptionType")) { document.querySelector("#selector").value = localStorage.getItem("jsd3713-selectedOptionType"); }
        if (localStorage.getItem("jsd3713-displayCountType")) { document.querySelector("#resultLimit").value = localStorage.getItem("jsd3713-displayCountType"); }
        document.querySelector("#selector").onchange = e => { localStorage.setItem("jsd3713-selectedOptionType", e.target.value); };
        document.querySelector("#resultLimit").onchange = e => { localStorage.setItem("jsd3713-displayCountType", e.target.value); };
    }
}

function findData(){
    const POKE_URL = "https://pokeapi.co/api/v2/";

    let url = POKE_URL;

    url += optionSelection;

    let term = searchTerm.childNodes[2].value.toLowerCase().replace(" ", "-");
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

    if (xhr.status == 404) {
        content.innerHTML = "No Pokemon by that name!";
    } else {
        let obj = JSON.parse(xhr.responseText);

        let returnable = "";

        if (optionSelection == "pokemon") {
            if (searchTerm.childNodes[2].value) {
                returnable = makePokemon(obj);
            } else {
                returnable = "Please enter a Pokemon's name";
            }
        }
        else {
            content.innerHTML = "";

            pokemonList = obj.pokemon;
            
            if (document.querySelector("#resultLimit").value == "" || document.querySelector("#resultLimit").value <= 0) {
                returnable = "Please enter a positive/complete number"
            } else {
                for (let i = 0; i < document.querySelector("#resultLimit").value && pokemonList.length; i++) {
                    getPokemon(pokemonList[i].pokemon.url);
                }
            }
        }

        content.innerHTML = returnable;
    }
}

function dataError(e){
    content = "No Pokemon by that name!";
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

    let returnable = "";
    returnable = makePokemon(obj);
    
    document.querySelector("#content").innerHTML += returnable
}

function makePokemon(obj) {
    if (optionSelection == "pokemon" && searchTerm.childNodes[2].value.toLowerCase().replace(" ", "-") == "") {
        content.innerHTML = "Please enter a Pokemon's name";
        return null;
    }
    let returnable = `<div id='pokemon' style="background-color:` + getColor(obj.types[0].type.name) + `">`;
    let pokemonImage = obj.sprites.front_default;
    returnable += `<img src='${pokemonImage}' title='pokemon_image' style="background-color:` + getColor(obj.types[0].type.name) + `"><br>`;
    returnable += `<p style="background-color:` + getColor(obj.types[0].type.name) + `">`;
    returnable += "Name: " + obj.name.replace("-", " ") + `<br>`;
    returnable += "HP: " + obj.stats[0].base_stat + `<br>`;
    returnable += "Attack: " + obj.stats[1].base_stat + `<br>`;
    returnable += "Defense: " + obj.stats[2].base_stat + `<br>`;
    returnable += "Speed: " + obj.stats[5].base_stat + `<br>`;
    returnable += `</p>`;
    returnable += `</div>`
    return returnable;
}

function getColor(type) {
    if (type == "fighting") {
        return "#ff8000";
    }
    else if (type == "flying") {
        return "#81b9ef";
    }
    else if (type == "poison") {
        return "#9141cb";
    }
    else if (type == "ground") {
        return "#915121";
    }
    else if (type == "rock") {
        return "#afa981";
    }
    else if (type == "bug") {
        return "#90a018";
    }
    else if (type == "ghost") {
        return "#704170";
    }
    else if (type == "steel") {
        return "#60a1b8";
    }
    else if (type == "fire") {
        return "#e62829";
    }
    else if (type == "water") {
        return "#2980ef";
    }
    else if (type == "grass") {
        return "#3fa129";
    }
    else if (type == "electric") {
        return "#fabf00";
    }
    else if (type == "psychic") {
        return "#ef4179";
    }
    else if (type == "ice") {
        return "#3dcef3";
    }
    else if (type == "dragon") {
        return "#5060e1";
    }
    else if (type == "dark") {
        return "#624d4e";
    }
    else if (type == "fairy") {
        return "#ef70ef";
    }
    else {
        return "#9fa19f";
    }
}