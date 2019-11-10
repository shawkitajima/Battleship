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
let hitCheck, hitIndex, moveUp, moveLeft, moveRight, moveDown, checkVertical;

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
    hitCheck = false;
    moveRight = 1;
    moveLeft = 0;
    moveRight = 0;
    moveDown = 0;
    moveUp = 0;
    checkVertical = true;
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
        hitCheck = true;
        hitIndex = guess;
        checkVertical = true;
        moveRight = 1;
        moveLeft = -1;
        moveUp = -10;
        moveDown = 10;
        playKerboom();
    }
    else {
        computerMisses.push(guess);
        playSploosh();
    }
}

function checkComputerNonRandomGuess(guess) {
    if (allUserSpots.includes(parseInt(guess))) {
        computerHits.push(guess);
        playKerboom();
        return true;
    }
    else {
        computerMisses.push(guess);
        playSploosh();
        return false;
    }
}

function playerTurn() {
    message.textContent = `Player's Turn`;
    renderBoard(userHits, userMisses);
    grid.addEventListener('click', receivePlayerGuess)
}

function receivePlayerGuess(evt) {
    let guess = evt.target.id;
    if (!(userHits.includes(parseInt(guess))) && !(userMisses.includes(parseInt(guess)))) {
        grid.removeEventListener('click', receivePlayerGuess);
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
}

function receiveComputerGuess() {
    if (stopper) return;
    message.textContent = `Computer's Turn!`;
    if (hitCheck) {
        getLinkedGuess();
        return;
    }
    computerGuess = Math.floor(Math.random() * Math.floor(100));
    while (computerHits.includes(computerGuess) || computerMisses.includes(computerGuess)) {
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


// Variables:
// hitCheck (Boolean) becomes true if random guess yields a hit

// hitIndex: the index that got a hit, which triggers the getLinkedGuess function

// moveUp: moves guess -10(i) indices

// moveLeft: moves guess -1(i) indices

// moveRight: moves guess 1(i) indices

// moveDown: moves guess 10(i) indices

// BetterGuesses: array to contain linked guesses

// Functions:


function getLinkedGuess() {
    if (moveRight && (hitIndex + moveRight) % 10 < 10 && !(computerHits.includes(hitIndex + moveRight)) && !(computerMisses.includes(hitIndex + moveRight))) {
        if (checkComputerNonRandomGuess(hitIndex + moveRight)) {
            moveRight++;
            checkVertical = false;
        }
        else {
            moveRight = 0;
        } 
    }
    else if (moveLeft && ((hitIndex + moveLeft) % 10 >= 0) && !(computerHits.includes(hitIndex + moveLeft)) && !(computerMisses.includes(hitIndex + moveLeft))) {
        if (checkComputerNonRandomGuess(hitIndex + moveLeft)) {
            moveLeft = moveLeft - 1;
            checkVertical = false;
        }
        else {
            moveLeft = 0;
        }
    }
    else if (moveUp && checkVertical && (hitIndex + moveUp > 0) && !(computerHits.includes(hitIndex + moveUp)) && !(computerMisses.includes(hitIndex + moveUp))) {
        if (checkComputerNonRandomGuess(hitIndex + moveUp)) {
            moveUp = moveUp - 10;
        }
        else {
            moveUp = 0;
        }
    }   
    else if (moveDown && ((hitIndex + moveDown) < 100) && !(computerHits.includes(hitIndex + moveDown)) && !(computerMisses.includes(hitIndex + moveDown))) {
        if (checkComputerNonRandomGuess(hitIndex + moveDown)) {
            moveDown = moveDown + 10;
        }
        else {
            moveDown = 0;
            hitCheck = false;
        }
    } 
    else {
        hitCheck = false;
        receiveComputerGuess();
        return;
    }  
    if (checkWinner(computerHits, allUserSpots)) {
        message.textContent = 'Computer Wins';
        setTimeout(function() {
            playLosing();
        }, 1500)
        return;
    }
    renderBoard(computerHits, computerMisses, allUserSpots);
    setTimeout(playerTurn, 2000);
}
// function getLinkedGuess()
    // this function gets called by the general guess function if hitCheck is true, it will then set CheckIndex to the hit index
    // if this function is called, it will call the playerGuess function and return from the computerGuess function so that the random guess is not called 
    // This function has a series of if/then statements that look like:
    // if (BetterGuesses.length >= 5)
        // hitCheck = false;
        // call playerGuess
        // return;
    // if (moveRight && guess+moveRight % 10 < 9 && not guessed already)
    // else if (moveUp && guess + moveUp % 10 > 1 && not guessed already))
    // And so on
    // Here is what the moveRight will if/then will do
        //  guess the index: guess + moveRight
        //  Update computer guess arrays, and add to BetterGuesses
        // if (userArray.includes(guess + moveRight) 
            // add 1 to moveRight
        //  else 
            // moveRight = 0;