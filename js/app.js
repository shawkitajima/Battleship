/*----- constants -----*/
let grid = document.getElementById('grid');
for (let i = 0; i < 100; i++) {
    let newEl= document.createElement('div');
    newEl.classList.add('space');
    newEl.id= i.toString();
    grid.appendChild(newEl);
}

const KERBOOM = new Audio();
const SLOOSH = new Audio();
const WINNING = new Audio();
const LOSING = new Audio();

const USERSHIPS = [
    {
        type: 'battleship',
        spotLength: 5
    },
    {
        type: 'cruiser',
        spotLength: 4
    },
    {
        type: 'carrier',
        spotLength: 3,
    }
];

const COMPUTERSHIPS = [
    {
        type: 'battleship',
        spotLength: 5
    },
    {
        type: 'cruiser',
        spotLength: 4
    },
    {
        type: 'carrier',
        spotLength: 3,
    }
];

/*----- app's state (variables) -----*/
let userShipCounter, computerShipsCounter;
let allUserSpots, allComputerSpots;
let computerShipChecker;
let computerHits, computerMisses, userHits, userMisses;
let internalCounter;
let stopper;

/*----- app's state (variables) -----*/
document.querySelector('button').addEventListener('click', function() {
    stopper = true;
});
document.querySelector('button').addEventListener('click', init);


/*----- cached element references -----*/
let spaces = document.querySelectorAll('.space');
let message = document.querySelector('h2');

/*----- functions -----*/
init();

function init() {
    stopper = false;
    internalCounter = 0;
    userShipCounter = 0;
    computerShipsCounter = 0;
    allUserSpots = [];
    allComputerSpots = [];
    USERSHIPS.forEach(ship => ship.spots = []);
    COMPUTERSHIPS.forEach(ship => ship.spots = []);
    spaces.forEach(space => space.textContent = null);
    computerMisses = [];
    computerHits = [];
    userHits = [];
    userMisses = [];
    message.textContent = `Please place your ${USERSHIPS[userShipCounter].type} - ${USERSHIPS[userShipCounter].spotLength} pieces`;
    grid.removeEventListener('click', receivePlayerGuess);
    grid.addEventListener('click', populateUserShips);
    populateComputerShips();
}


function populateUserShips(evt) {
    let spot = evt.target.id;
    message.textContent = `Please place your ${USERSHIPS[userShipCounter].type} - ${USERSHIPS[userShipCounter].spotLength} pieces`;
    try {if (internalCounter >= USERSHIPS[userShipCounter].spotLength - 1) message.textContent = `Please place your ${USERSHIPS[userShipCounter + 1].type} - ${USERSHIPS[userShipCounter + 1].spotLength} pieces`;}
    catch(error) {}
    if (!allUserSpots.includes(parseInt(spot))) {
        document.getElementById(spot).textContent = 'X';
        allUserSpots.push(parseInt(spot));
        internalCounter++;
    }
    if (internalCounter >= USERSHIPS[userShipCounter].spotLength) {
        internalCounter = 0;
        userShipCounter++;
    }
    if (userShipCounter >= USERSHIPS.length) {
        setTimeout(function() {
            spaces.forEach(space => space.textContent = null);
        }, 2000);
        grid.removeEventListener('click', populateUserShips);
        playerTurn();
        return;
    }
}


function populateComputerShips() {
    while (computerShipsCounter < COMPUTERSHIPS.length) {
        computerHorizontalStart();
    }
}

function computerHorizontalStart() {
    computerShipChecker = [];
    let y = Math.floor(Math.random() * Math.floor(90));
    y = Math.round(y / 10) * 10;
    let x = Math.floor(Math.random() * Math.floor(10 - COMPUTERSHIPS[computerShipsCounter].spotLength));
    let starting = x + y;
    for (let i = 0; i < COMPUTERSHIPS[computerShipsCounter].spotLength; i++) {
        computerShipChecker.push(starting + i);
    }
    if (!computerShipChecker.some((val) => allComputerSpots.indexOf(val) !== -1)) {
        allComputerSpots = allComputerSpots.concat(computerShipChecker);
        computerShipsCounter++;
        return;
    }
    else {
        computerHorizontalStart();
    }  
}


function renderBoard(hits, misses, locations) {
    spaces.forEach(space => space.textContent = null);
    if (locations) {
        locations.forEach(location => {
            document.getElementById(location).textContent = 'Safe!';
        })
    };
    if (hits.length > 0) {
        hits.forEach(hit => {
            document.getElementById(hit).textContent = 'Hit';
        });
    }
    if (misses.length > 0 ) {
        misses.forEach(miss => {
            document.getElementById(miss).textContent = 'Miss';
        });
    }   
}


function checkUserGuess(guess) {
    if (allComputerSpots.includes(parseInt(guess))) {
        userHits.push(parseInt(guess))
        playKerboom();
    }
    else {
        userMisses.push(parseInt(guess));
        playSploosh();
    }
}

function checkComputerGuess(guess) {
    if (allUserSpots.includes(parseInt(guess))) {
        computerHits.push(guess);
        playKerboom();
    }
    else {
        computerMisses.push(guess);
        playSploosh();
    }
}


function playerTurn() {
    message.textContent = `Player's Turn`;
    renderBoard(userHits, userMisses);
    grid.addEventListener('click', receivePlayerGuess)
}

function receivePlayerGuess(evt) {
    grid.removeEventListener('click', receivePlayerGuess);
    let guess = evt.target.id;
    checkUserGuess(guess);
    renderBoard(userHits, userMisses);  
    if (stopper) return;
    if (checkWinner(userHits, allComputerSpots)) {
        message.textContent = 'You Win!';
        setTimeout(function() {
            playWinning();
        }, 1500)
        return;
    }   
    setTimeout(receiveComputerGuess, 2000);
}

function receiveComputerGuess() {
    if (stopper) return;
    message.textContent = `Computer's Turn!`;
    computerGuess = Math.floor(Math.random() * Math.floor(100));
    while (computerHits.includes(computerGuess) && computerMisses.includes(computerGuess)) {
        computerGuess = Math.floor(Math.random() * Math.floor(100));
    }
    checkComputerGuess(computerGuess);
    renderBoard(computerHits, computerMisses, allUserSpots);
    if (checkWinner(computerHits, allUserSpots)) {
        message.textContent = 'Computer Wins';
        setTimeout(function() {
            playLosing();
        }, 1500)
        return;
    }
    setTimeout(playerTurn, 2000);
}


function checkWinner(hits, allSpots) {
    let check1 = hits.reduce((acc, val) => acc + val, 0);
    let check2 = allSpots.reduce((acc, val) => acc + val, 0);
    return check1 === check2;
}


function playKerboom() {
    KERBOOM.src = "https://noproblo.dayjo.org/ZeldaSounds/WW_New/WW_Salvatore_Kerboom.wav";
    KERBOOM.type = "audio/ogg";
    KERBOOM.play();
  }

function playSploosh() {
    SLOOSH.src = "https://noproblo.dayjo.org/ZeldaSounds/WW_New/WW_Salvatore_Sploosh.wav";
    SLOOSH.type = 'audio/ogg';
    SLOOSH.play();
}

function playWinning() {
    WINNING.src = "https://noproblo.dayjo.org/ZeldaSounds/WW_New/WW_Fanfare_Item.wav";
    WINNING.type = 'audio/ogg';
    WINNING.play();
}

function playLosing() {
    LOSING.src = "https://noproblo.dayjo.org/ZeldaSounds/WW_New/WW_GreatFairy_Laugh.wav";
    LOSING.type = 'audio/ogg';
    LOSING.play();
}