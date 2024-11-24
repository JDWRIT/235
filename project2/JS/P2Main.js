window.onload = (e) => {document.querySelector("#search").onclick = findData;
                        document.querySelector("#option").onchange = selectionChange;
                        optionSelector = document.querySelector("#option");
                        optionSelection = optionSelector.value;
                        searchTerm = document.querySelector("#searchterm");
                        searchTerm.innerHTML = `Search Term -> <input type="text" size="20" maxlength="20" autofocus value="pikachu" />`;
                        if (localStorage.getItem("jsd3713-searchTerm") != "") { searchTerm.childNodes[1].value = localStorage.getItem("jsd3713-searchTerm"); }
                        searchTerm.childNodes[1].onchange = e => { localStorage.setItem("jsd3713-searchTerm", e.target.value); };
                        content = document.querySelector("#content");
                        if (localStorage.getItem("jsd3713-optionSelection")) { 
                            optionSelector.value = localStorage.getItem("jsd3713-optionSelection");
                            selectionChange(); }
                        };

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
        searchTerm.innerHTML = `Search Term -> <input type="text" size="20" maxlength="20" autofocus value="pikachu" />`;
        searchTerm.childNodes[1].value = localStorage.getItem("jsd3713-searchTerm");
        searchTerm.childNodes[1].onchange = e => { localStorage.setItem("jsd3713-searchTerm", e.target.value); };
    }
    else if (optionSelection == "ability") {
        searchTerm.innerHTML = `Ability options -> `
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
        searchTerm.innerHTML += `<br>Result limit -> <input id="resultLimit" type="number" size="20" maxlength="20" autofocus value="5" />`
        if (localStorage.getItem("jsd3713-selectedOptionAbility")) { document.querySelector("#selector").value = localStorage.getItem("jsd3713-selectedOptionAbility"); }
        if (localStorage.getItem("jsd3713-displayCountAbility")) { document.querySelector("#resultLimit").value = localStorage.getItem("jsd3713-displayCountAbility"); }
        document.querySelector("#selector").onchange = e => { localStorage.setItem("jsd3713-selectedOptionAbility", e.target.value); };
        document.querySelector("#resultLimit").onchange = e => { localStorage.setItem("jsd3713-displayCountAbility", e.target.value); };
    }
    else {
        searchTerm.innerHTML = `Type options ->`;
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
        searchTerm.innerHTML += `<br>Result limit -> <input id="resultLimit" type="number" size="20" maxlength="20" autofocus value="5" />`
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

    let term = searchTerm.childNodes[1].value.toLowerCase().replace(" ", "-");
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
        content.innerHTML = "No Pokemon to display!";
    } else {
        let obj = JSON.parse(xhr.responseText);
        console.log(obj);

        let returnable = "";

        if (optionSelection == "pokemon") {
            returnable = makePokemon(obj);
        }
        else {
            content.innerHTML = "";

            pokemonList = obj.pokemon;
            
            for (let i = 0; i < document.querySelector("#resultLimit").value && pokemonList.length; i++)
            {
                getPokemon(pokemonList[i].pokemon.url);
            }
        }

        content.innerHTML = returnable;
    }
}

function dataError(e){
    console.log("An error occured");
    content = "No Pokemon to display!";
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

    let returnable = "";
    returnable = makePokemon(obj);
    
    document.querySelector("#content").innerHTML += returnable
}

function makePokemon(obj) {
    let returnable = `<div id='pokemon'>`;
    let pokemonImage = obj.sprites.front_default;
    returnable += `<img src='${pokemonImage}' title='pokemon_image' /><br>`;
    returnable += "Name: " + obj.name.replace("-", " ") + `<br>`;
    returnable += "HP: " + obj.stats[0].base_stat + `<br>`;
    returnable += "Attack: " + obj.stats[1].base_stat + `<br>`;
    returnable += "Defense: " + obj.stats[2].base_stat + `<br>`;
    returnable += "Speed: " + obj.stats[5].base_stat + `<br>`;
    returnable += `</div>`
    return returnable;
}