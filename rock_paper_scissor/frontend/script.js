const API_URL = 'http://localhost:3000/api';

// DOM Elements
const userScoreEl = document.getElementById('user-score');
const compScoreEl = document.getElementById('comp-score');
const tieScoreEl = document.getElementById('tie-score');
const statusMessageEl = document.getElementById('status-message');
const choiceBtns = document.querySelectorAll('.choice-btn');
const resetBtn = document.getElementById('reset-btn');
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const closeModal = document.getElementById('close-modal');
const historyList = document.getElementById('history-list');
const battleArea = document.getElementById('battle-area');
const userFighterIcon = document.querySelector('#user-fighter .fighter-icon');
const compFighterIcon = document.querySelector('#comp-fighter .fighter-icon');

const emojiMap = {
    'rock': '✊',
    'paper': '✋',
    'scissors': '✌️'
};

// Initialize
async function init() {
    await fetchScores();
    setupEventListeners();
}

// Fetch initial scores from backend
async function fetchScores() {
    try {
        const response = await fetch(`${API_URL}/scores`);
        const data = await response.json();
        updateScoreBoard(data);
    } catch (error) {
        console.error('Error fetching scores:', error);
        statusMessageEl.textContent = 'Error connecting to server.';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const choice = btn.getAttribute('data-choice');
            playGame(choice);
        });
    });

    resetBtn.addEventListener('click', resetGame);
    
    historyBtn.addEventListener('click', () => {
        historyModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });

    // Close modal if clicking outside content
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.add('hidden');
        }
    });
}

// Play a round
async function playGame(choice) {
    try {
        // Optimistic UI for selection
        statusMessageEl.textContent = 'Battling...';
        statusMessageEl.className = 'status-message';
        battleArea.classList.add('hidden');

        const response = await fetch(`${API_URL}/play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ choice })
        });

        const data = await response.json();
        
        displayResult(data);
    } catch (error) {
        console.error('Error playing game:', error);
        statusMessageEl.textContent = 'Error during gameplay.';
    }
}

// Display the result with animations
function displayResult(data) {
    const { userChoice, computerChoice, result, scores } = data;

    // Update battle area
    userFighterIcon.textContent = emojiMap[userChoice];
    compFighterIcon.textContent = emojiMap[computerChoice];
    
    // Remove animation class to re-trigger it
    userFighterIcon.style.animation = 'none';
    compFighterIcon.style.animation = 'none';
    
    // Trigger reflow
    void userFighterIcon.offsetWidth;
    
    // Re-add animation
    userFighterIcon.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    compFighterIcon.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    battleArea.classList.remove('hidden');

    // Update status message
    statusMessageEl.className = 'status-message';
    if (result === 'user') {
        statusMessageEl.textContent = 'You Win! 🎉';
        statusMessageEl.classList.add('win');
    } else if (result === 'computer') {
        statusMessageEl.textContent = 'Computer Wins! 🤖';
        statusMessageEl.classList.add('lose');
    } else {
        statusMessageEl.textContent = "It's a Tie! 🤝";
        statusMessageEl.classList.add('tie');
    }

    // Update scores
    updateScoreBoard(scores);
}

// Update DOM score elements
function updateScoreBoard(scores) {
    // Animate score change
    if(userScoreEl.textContent != scores.user) animateValue(userScoreEl, parseInt(userScoreEl.textContent), scores.user, 500);
    if(compScoreEl.textContent != scores.computer) animateValue(compScoreEl, parseInt(compScoreEl.textContent), scores.computer, 500);
    if(tieScoreEl.textContent != scores.ties) animateValue(tieScoreEl, parseInt(tieScoreEl.textContent), scores.ties, 500);
    
    if (scores.history) {
        renderHistory(scores.history);
    }
}

function renderHistory(history) {
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No history available.</p>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = `history-item ${item.result}`;
        
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        
        let resultText = "Tie";
        if (item.result === 'user') resultText = "Win";
        else if (item.result === 'computer') resultText = "Loss";

        div.innerHTML = `
            <div>
                <div class="history-match">
                    <span>${emojiMap[item.userChoice]}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted)">vs</span>
                    <span>${emojiMap[item.computerChoice]}</span>
                </div>
                <div class="history-time">${timeString}</div>
            </div>
            <div class="history-result">${resultText}</div>
        `;
        historyList.appendChild(div);
    });
}

// Reset the game
async function resetGame() {
    try {
        const response = await fetch(`${API_URL}/reset`, { method: 'POST' });
        const newScores = await response.json();
        
        updateScoreBoard(newScores);
        
        battleArea.classList.add('hidden');
        statusMessageEl.textContent = 'Game Reset! Make your move.';
        statusMessageEl.className = 'status-message';
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

// Helper to animate numbers
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Start
init();
