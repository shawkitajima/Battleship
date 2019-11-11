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
let lefterMost, righterMost, upperMost, downerMost;
let moveLeftDowner, moveLeftUpper, moveRightDowner, moveRightUpper;
let moveUpLefter, moveDownLefter, moveUpRighter, moveDownRighter;

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
        moveLeftDowner = 10;
        moveLeftUpper = -10;
        moveRightDowner = 10;
        moveRightUpper = -10;
        moveUpLefter = -1;
        moveUpRighter = 1;
        moveDownLefter = -1;
        moveDownRighter = 1;
        lefterMost = 0;
        righterMost = 0;
        downerMost = 0;
        upperMost = 0;
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



function getLinkedGuess() {
    if (moveRight && (hitIndex + moveRight) % 10 < 10 && !(computerHits.includes(hitIndex + moveRight)) && !(computerMisses.includes(hitIndex + moveRight))) {
        if (checkComputerNonRandomGuess(hitIndex + moveRight)) {
            moveRight++;
            righterMost = righterMost +1;
            checkVertical = false;
        }
        else {
            moveRight = 0;
        } 
    }
    else if (moveLeft && ((hitIndex + moveLeft) % 10 >= 0) && !(computerHits.includes(hitIndex + moveLeft)) && !(computerMisses.includes(hitIndex + moveLeft))) {
        if (checkComputerNonRandomGuess(hitIndex + moveLeft)) {
            moveLeft = moveLeft - 1;
            lefterMost--;
            checkVertical = false;
        }
        else {
            moveLeft = 0;
        }
    }
    else if (moveUp && checkVertical && (hitIndex + moveUp > 0) && !(computerHits.includes(hitIndex + moveUp)) && !(computerMisses.includes(hitIndex + moveUp))) {
        if (checkComputerNonRandomGuess(hitIndex + moveUp)) {
            moveUp = moveUp - 10;
            upperMost = upperMost - 10;
        }
        else {
            moveUp = 0;
        }
    }   
    else if (moveDown && checkVertical && ((hitIndex + moveDown) < 100) && !(computerHits.includes(hitIndex + moveDown)) && !(computerMisses.includes(hitIndex + moveDown))) {
        if (checkComputerNonRandomGuess(hitIndex + moveDown)) {
            moveDown = moveDown + 10;
            downerMost = downerMost + 10;
        }
        else {
            moveDown = 0;
        }
    } 
    else if (righterMost || lefterMost) {
        guessVertical();
    }
    else if (upperMost || downerMost) {
        guessHorizontal();
    }
    else {
        hitCheck = false;
        receiveComputerGuess();
        return;
    }  
    if (checkWinner(computerHits, allUserSpots)) {
        renderBoard(computerHits, computerMisses, allUserSpots)
        message.textContent = 'Computer Wins';
        setTimeout(function() {
            playLosing();
        }, 1500)
        return;
    }
    renderBoard(computerHits, computerMisses, allUserSpots);
    setTimeout(playerTurn, 2000);
}


function guessVertical() {
    if (moveLeftUpper && (hitIndex + lefterMost + moveLeftUpper >= 0) && !(computerHits.includes(hitIndex + lefterMost + moveLeftUpper)) && !(computerMisses.includes(hitIndex + lefterMost + moveLeftUpper))) {
        if (checkComputerNonRandomGuess(hitIndex + lefterMost + moveLeftUpper)) {
            moveLeftUpper = moveLeftUpper - 10;
        }
        else {
            moveLeftUpper = 0;
        }
    }
    else if (moveLeftDowner && (hitIndex + lefterMost + moveLeftDowner < 100) && !(computerHits.includes(hitIndex + lefterMost + moveLeftDowner)) && !(computerMisses.includes(hitIndex + lefterMost + moveLeftDowner))) {
        if (checkComputerNonRandomGuess(hitIndex + lefterMost + moveLeftDowner)) {
            moveLeftDowner = moveLeftDowner + 10;
        }
        else {
            moveLeftDowner = 0;
        }        
    }
    else if (moveRightUpper && (hitIndex + righterMost + moveRightUpper >= 0) && !(computerHits.includes(hitIndex + righterMost + moveRightUpper)) && !(computerMisses.includes(hitIndex + righterMost + moveRightUpper))) {
        if (checkComputerNonRandomGuess(hitIndex + righterMost + moveRightUpper)) {
            moveRightUpper = moveRightUpper - 10;
        }
        else {
            moveRightUpper = 0;
        }
    }
    else if (moveRightDowner && (hitIndex + righterMost + moveRightDowner < 100) && !(computerHits.includes(hitIndex + righterMost + moveRightDowner)) && !(computerMisses.includes(hitIndex + righterMost + moveRightDowner))) {
        if (checkComputerNonRandomGuess(hitIndex + righterMost + moveRightDowner)) {
            moveRightDowner = moveRightDowner + 10;
        }
        else {
            moveRightDowner = 0;
        }      
    }
    else {
        lefterMost = 0;
        righterMost = 0;
        hitCheck = false;
        receiveComputerGuess();
    }
}

function guessHorizontal() {
    if (moveUpLefter && ((hitIndex + upperMost + moveUpLefter) % 10 >= 0) && !(computerHits.includes(hitIndex + upperMost + moveUpLefter)) && !(computerMisses.includes(hitIndex + upperMost + moveUpLefter))) {
        if (checkComputerNonRandomGuess(hitIndex + upperMost + moveUpLefter)) {
            moveUpLefter = moveUpLefter - 1;
        }
        else {
            moveUpLefter = 0;
        }
    }
    else if (moveUpRighter && ((hitIndex + upperMost + moveUpRighter) % 10 > 0) && !(computerHits.includes(hitIndex + upperMost + moveUpRighter)) && !(computerMisses.includes(hitIndex + upperMost + moveUpRighter))) {
        if (checkComputerNonRandomGuess(hitIndex + upperMost + moveUpRighter)) {
            moveUpRighter = moveUpRighter + 1;
        }
        else {
            moveUpRighter = 0;
        }        
    }
    else if (moveDownLefter && ((hitIndex + downerMost + moveDownLefter) % 10 >= 0) && !(computerHits.includes(hitIndex + downerMost + moveDownLefter)) && !(computerMisses.includes(hitIndex + downerMost + moveDownLefter))) {
        if (checkComputerNonRandomGuess(hitIndex + downerMost + moveDownLefter)) {
            moveDownLefter = moveDownLefter - 1;
        }
        else {
            moveDownLefter = 0;
        }
    }
    else if (moveDownRighter && (hitIndex + downerMost + moveDownRighter >= 0) && !(computerHits.includes(hitIndex + downerMost + moveDownRighter)) && !(computerMisses.includes(hitIndex + downerMost + moveDownRighter))) {
        if (checkComputerNonRandomGuess(hitIndex + downerMost + moveDownRighter)) {
            moveDownRighter = moveDownRighter + 1;
        }
        else {
            moveDownRighter = 0;
        }      
    }
    else {
        upperMost = 0;
        downerMost = 0;
        hitCheck = false;
        receiveComputerGuess();
    } 
}