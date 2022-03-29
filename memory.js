// Prevent scrolling when using arrow keys
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    // if keycode in this list:
    // some browsers understand keyCode, others understand which
    if([32, 37, 38, 39, 40].indexOf(e.keyCode || e.which) > -1) {
        e.preventDefault();
    }
}, false);

// --- CONSTANTS AND GLOBALS ---
const NEW_GAME_BTN = document.getElementById("newGame-btn");
const LOAD_CARDS_BTN = document.getElementById("loadCards-btn");

const HIDDENSTYLE_SELECT = document.getElementById('hiddenstyle-select');

const A11Y_DIV = document.getElementById('a11y-alerts');
const ALLOWED_NUM_PAIRS = 8;

// Card colors
const STYLES = {
    // colorblind combo from https://davidmathlogic.com/colorblind
    'COLORBLIND1': ['DeepPink', 'Black', 'GoldenRod', 'Teal', 'HotPink', 'DeepSkyBlue', 'Olive', 'SpringGreen'],
    // from https://www.ibm.com/design/v1/language/resources/color-library/
    'COLORBLIND2': ['Black', 'Orange', 'DodgerBlue', 'MediumSeaGreen', 'SteelBlue', 'Chocolate', 'Orchid', 'Yellow'],
    // Color categories from https://www.w3schools.com/colors/colors_groups.asp
    // I used Python's library BeautifulSoup to isolate the color CSS names from the HTML page source
    'GREENS': ['AntiqueWhite', 'DarkSlateGray', 'PowderBlue', 'CadetBlue', 'GreenYellow', 'Chartreuse', 'LawnGreen', 'Aquamarine', 'Lime', 'LimeGreen', 'PaleGreen', 'DarkKhaki', 'LightGreen', 'MediumSpringGreen', 'SpringGreen', 'MediumSeaGreen', 'SeaGreen', 'ForestGreen', 'Green', 'DarkGreen', 'Olive', 'YellowGreen', 'OliveDrab', 'DarkOliveGreen', 'MediumAquaMarine', 'DarkSeaGreen'],
    'BLUES': ['LightSlateGray', 'SlateGray', 'LightSeaGreen', 'DarkCyan', 'Teal', 'MediumAquaMarine', 'Aqua', 'Cyan', 'PaleTurquoise', 'Turquoise', 'MediumTurquoise', 'DarkTurquoise', 'SteelBlue', 'LightBlue', 'LightSkyBlue', 'SkyBlue', 'CornflowerBlue', 'DeepSkyBlue', 'DodgerBlue', 'RoyalBlue', 'Blue', 'MediumBlue', 'DarkBlue', 'Navy', 'MidnightBlue'],
    'BROWNS': ['Cornsilk', 'BlanchedAlmond', 'Bisque', 'NavajoWhite', 'Wheat', 'BurlyWood', 'Tan', 'DarkGoldenRod', 'Peru', 'SaddleBrown', 'Sienna'],
    'WHITES': ['LightCyan', 'Snow', 'MintCream', 'Azure', 'AliceBlue', 'GhostWhite', 'WhiteSmoke', 'SeaShell', 'Beige', 'OldLace', 'FloralWhite', 'Ivory', 'Linen'],
    'GREYS': ['Gainsboro', 'Silver', 'DarkGray', 'DimGray', 'Gray', 'Black', '#707070', '#999999'],
    'PINKS': ['LavenderBlush', 'MistyRose', 'Pink', 'LightPink', 'HotPink', 'DeepPink', 'PaleVioletRed', 'MediumVioletRed'],
    'PURPLES': ['RosyBrown', 'Lavender', 'Thistle', 'Plum', 'Orchid', 'Violet', 'LightSteelBlue', 'Fuchsia', 'Magenta', 'MediumOrchid', 'DarkOrchid', 'DarkViolet', 'BlueViolet', 'DarkMagenta', 'Purple', 'MediumPurple', 'MediumSlateBlue', 'SlateBlue', 'DarkSlateBlue', 'RebeccaPurple', 'Indigo '],
    'REDS': ['Brown', 'Maroon', 'Salmon', 'LightCoral', 'IndianRed ', 'Crimson', 'Red', 'FireBrick', 'DarkRed'],
    'ORANGES': ['AntiqueWhite', 'PeachPuff', 'SandyBrown', 'Chocolate', 'Moccasin', 'DarkSalmon', 'LightSalmon', 'Orange', 'DarkOrange', 'Coral', 'Tomato', 'OrangeRed'],
    'YELLOWS': ['Gold', 'Yellow', 'LightYellow', 'LemonChiffon', 'LightGoldenRodYellow', 'PapayaWhip', 'GoldenRod', 'PaleGoldenRod', 'Khaki', 'DarkKhaki']
}

// Parent div that cards will be contained within
const CONTAINER_DIV = document.getElementById('container');

let firstCard = null;
let preventClick = false;

let currentFoundPairs = 0;
let selectedLevel = '';

// The level the user chose from the drop-down
// selectedLevel = document.getElementById('difficultylevel-select').value;

const ORIG_TIME_REMAINING = 100;
const TIMEREMAINING_DIV = document.getElementById("num");
TIMEREMAINING_DIV.innerHTML = ORIG_TIME_REMAINING;

let currentTimeRemaining = ORIG_TIME_REMAINING;

// --- EVENT LISTENERS ---
// Load new screen to play when the "start over" button is clicked
NEW_GAME_BTN.addEventListener("click", function(event){
    event.preventDefault();
    reset();
});

let timerAction = null;

// Load cards when the "load cards" button is clicked
LOAD_CARDS_BTN.addEventListener("click", function(event){
    event.preventDefault();
    currentFoundPairs = 0;
    NEW_GAME_BTN.disabled = false;

    // if a game is already going, disable the Load Game button
    if (CONTAINER_DIV.hasChildNodes) {
        LOAD_CARDS_BTN.disabled = true;
    }

    // The color the user chose from the drop-down
    var selectedColor = HIDDENSTYLE_SELECT.value;

    // Create the child nodes, the cards, with the colors that the user selected
    setUpCards(STYLES, selectedColor);
    // Timer
    timerAction = setInterval(function(){
        TIMEREMAINING_DIV.innerHTML = currentTimeRemaining;
        currentTimeRemaining -= 1;
        if (currentTimeRemaining == 30) {
            A11Y_DIV.innerHTML = 'You have 30 seconds left';
        }
        if (currentTimeRemaining < 0){
            alert("Time is up! You got " + currentFoundPairs + " pairs.");
            reset();
            
        }
    }, 1000); // every 1 second, decrement the timeLeft

});

// KEY EVENT LISTENERS
$(CONTAINER_DIV).on('keyup','.card',function(e) {
    e.preventDefault();
    e.stopPropagation();

    var key = e.keyCode || e.which;

    // down arrow
    if (key == 40) {
        $(this).next('.card').next('.card').next('.card').next('.card').focus(); 
    }
    // up arrow
    else if (key == 38) {
        $(this).prev('.card').prev('.card').prev('.card').prev('.card').focus(); 
    }
    // left arrow
    else if (key == 37) {
        $(this).prev('.card').focus(); 
    }
    // right arrow
    else if (key == 39) {
        $(this).next('.card').focus(); 
    }
    // space bar or enter key for flip card
    if (key == 32 || key == 13) {
        flipCardActions(e);
    }
});

// CLICK EVENT LISTENER
$(CONTAINER_DIV).on('click','.card',function(e) {
    e.preventDefault();
    flipCardActions(e);
});

// --- FUNCTIONS ---

// Reset the game play
function reset() {
    CONTAINER_DIV.innerHTML="";
    LOAD_CARDS_BTN.disabled = false;
    NEW_GAME_BTN.disabled = true;
    currentTimeRemaining = ORIG_TIME_REMAINING;
    TIMEREMAINING_DIV.innerHTML = ORIG_TIME_REMAINING;
    HIDDENSTYLE_SELECT.focus();
    clearTimeout(timerAction);
}

// Shuffle the cards so they are in a different order each time
// Fisher–Yates Shuffle https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    let m = array.length;
    let t;
    let i;
  
    // While there remain elements to shuffle
    while (m) {
      // Pick a remaining element
      i = Math.floor(Math.random() * m--);
      // And swap it with the current element
      t = array[m];         // array[m] is the last element, now t is the temp holding the last element
      array[m] = array[i];  // value of random element is now the value of last element
      array[i] = t;         // t (which is the last element) is now where the random element was 
    }
    return array;
}

// Create and append new child nodes (card)
function setUpCards(dictionary, index) {
    // choose 8 colors from one of the colorPalettes in colorsDict
    let colors = shuffle(dictionary[index]).slice(0,ALLOWED_NUM_PAIRS)
    // double the elements, so there is each a pair 
    colors = colors.concat(colors);
    // shuffle the order so it is different
    colors = shuffle(colors);    
    for (var i = 0; i < (ALLOWED_NUM_PAIRS*2); i++) { 
        // create a new card div, one for each of the colors chosen above
        let newCard = document.createElement("div");
        newCard.setAttribute('class','card color-hidden');
        newCard.setAttribute('data-color', colors[i]);
        newCard.setAttribute('tabindex', '0');
        newCard.setAttribute('aria-label', colors[i]);
        CONTAINER_DIV.appendChild(newCard);
    }
    return CONTAINER_DIV;
}

// apply CSS class and style to show "hidden" side
function setCardToHidden(card) {
    card.style.backgroundColor = "";
    card.className = card.className.replace('color-showing', 'color-hidden');
    return;
}
    
// apply CSS class and style to show "not hidden" side
function setCardToShowing(card) {
    let hiddenstyle = card.getAttribute('data-color');
    card.style.backgroundColor = hiddenstyle;
    return;
}

// check the number of pairs and wins against the allowed number
function checkWin(pairs) {
    if (pairs == ALLOWED_NUM_PAIRS) {
        var alertMsg = 'You win! You found them all in ' + (ORIG_TIME_REMAINING - TIMEREMAINING_DIV.textContent) + ' seconds'
        alert(alertMsg);
        reset();
    }
    return;
}

// flip card
function flipCardActions(event) {

    // hold onto current card
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget
    const currentCard = event.currentTarget;
    setCardToShowing(currentCard);
    // don't do anything if I don't want the card to be clicked
    if (preventClick ||
        currentCard === firstCard || 
        currentCard.className.includes('color-showing')) {
        return;
    }
    currentCard.className = currentCard.className.replace('color-hidden', 'color-showing');

    if (!firstCard) {
        // this is the first card in the pair
        // make currentCard be the firstCard
        firstCard = currentCard;
    }
    else if (firstCard) {
        // this is the second card in the pair
        preventClick = true;
        // the 2 cards match
        if (firstCard.getAttribute('data-color') !== currentCard.getAttribute('data-color')) {
            setTimeout(() => {
                setCardToHidden(currentCard);
                setCardToHidden(firstCard);
                firstCard = null;
                preventClick = false;
            }, 500);
        }
        // the 2 cards don't match
        else {
            firstCard = null;
            preventClick = false;
            currentFoundPairs += 1;
            A11Y_DIV.innerHTML = currentFoundPairs + ' out of 8 pairs found';
        }
    }
    // check win status each time a card is flipped
    checkWin(currentFoundPairs);
    return;
}