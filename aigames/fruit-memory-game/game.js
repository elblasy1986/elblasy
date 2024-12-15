const emojis = ['🍎', '🍌', '🍇', '🍉', '🍍', '🍓', '🥝', '🍒'];
const cards = [...emojis, ...emojis];
let gameBoard = document.getElementById('game-board');
let movesDisplay = document.getElementById('moves');
let timerDisplay = document.getElementById('timer');
let restartBtn = document.getElementById('restart-btn');
let winPopup = document.getElementById('win-popup');
let winMessage = document.getElementById('win-message');
let closePopupBtn = document.getElementById('close-popup');

let flippedCards = [];
let matchedCards = [];
let moves = 0;
let timer = 0;
let timerInterval = null;

// Audio Context for generating sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a soft pop sound for flipping
function playFlipSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// Function to play a cheerful, summery win melody
function playWinSound() {
    const melody = [
        { frequency: 659, duration: 0.2 }, // E5
        { frequency: 784, duration: 0.2 }, // G5
        { frequency: 880, duration: 0.2 }, // A5
        { frequency: 784, duration: 0.2 }, // G5
        { frequency: 659, duration: 0.4 }, // E5 (longer)
        { frequency: 988, duration: 0.4 }, // B5
    ];

    let startTime = audioCtx.currentTime;

    melody.forEach(note => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.frequency, startTime);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);

        startTime += note.duration;
    });
}

// Shuffle the cards
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Initialize the game
function initGame() {
    // Reset variables
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    timer = 0;
    movesDisplay.textContent = 'Moves: 0';
    timerDisplay.textContent = 'Time: 0s';
    clearInterval(timerInterval);
    winPopup.style.display = 'none';

    // Start timer
    startTimer();

    // Shuffle and create cards
    shuffle(cards);
    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// Flip a card
function flipCard() {
    if (this.classList.contains('flipped') || this.classList.contains('matched') || flippedCards.length === 2) return;

    this.classList.add('flipped');
    this.textContent = this.dataset.emoji;
    flippedCards.push(this);
    playFlipSound();

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// Check for a match
function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCards.push(card1, card2);
        flippedCards = [];

        // Check for win condition
        if (matchedCards.length === cards.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                playWinSound();
                showWinPopup();
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = [];
        }, 1000);
    }

    moves++;
    movesDisplay.textContent = `Moves: ${moves}`;
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = `Time: ${timer}s`;
    }, 1000);
}

// Show the win popup
function showWinPopup() {
    winMessage.textContent = `You won in ${moves} moves and ${timer} seconds!`;
    winPopup.style.display = 'flex';
}

// Restart the game
restartBtn.addEventListener('click', initGame);
closePopupBtn.addEventListener('click', initGame);

// Initialize on load
initGame();
