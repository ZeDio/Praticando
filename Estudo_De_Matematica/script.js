const opSelect = document.getElementById('operation');
const diffSelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start');
const popup = document.getElementById('popup');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submit');
const closeBtn = document.getElementById('close');
const scoreEl = document.getElementById('score');
const themeToggle = document.getElementById('theme-toggle');
const timerEl = document.getElementById('timer');
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');
const historyBtn = document.getElementById('history-btn');
const historyPopup = document.getElementById('history-popup');
const closeHistory = document.getElementById('close-history');
const historyList = document.getElementById('history-list');

let score = 0;
let currentAnswer = 0;
let timer;
let timeLeft = 10;
let history = JSON.parse(localStorage.getItem("mathHistory")) || [];

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    const op = opSelect.value;
    const diff = diffSelect.value;
    const ranges = { easy: [1, 10], medium: [1, 50], hard: [1, 200] };
    const [min, max] = ranges[diff];
    let a = randInt(min, max);
    let b = randInt(min, max);
    let question = '', answer = 0;

    switch (op) {
        case 'add': question = `${a} + ${b}`; answer = a + b; break;
        case 'sub': question = `${a} - ${b}`; answer = a - b; break;
        case 'mul': question = `${a} × ${b}`; answer = a * b; break;
        case 'div': b = randInt(1, max); a = b * randInt(1, 10);
            question = `${a} ÷ ${b}`; answer = a / b; break;
    }

    questionText.textContent = question + ' = ?';
    currentAnswer = answer;
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 10;
    timerEl.textContent = `⏱️ ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleAnswer(false, true);
        }
    }, 1000);
}

function saveHistory(entry) {
    history.unshift(entry);
    if (history.length > 10) history.pop();
    localStorage.setItem("mathHistory", JSON.stringify(history));
}

function updateHistoryView() {
    historyList.innerHTML = history.map(h =>
        `<li>${h.question} → ${h.correct ? '✅' : '❌'} (${h.userAnswer})</li>`
    ).join('') || "<li>Sem histórico ainda.</li>";
}

function handleAnswer(correct, timeUp = false) {
    clearInterval(timer);
    saveHistory({ question: questionText.textContent, correct, userAnswer: answerInput.value });
    if (correct) {
        score++;
        popup.classList.add('flash');
        soundCorrect.play();
    } else {
        popup.classList.add('wrong');
        soundWrong.play();
    }
    setTimeout(() => popup.classList.remove('flash', 'wrong'), 500);
    scoreEl.textContent = 'Pontuação: ' + score;
    if (!timeUp) popup.classList.remove('active');
}

startBtn.addEventListener('click', () => {
    generateQuestion();
    popup.classList.add('active');
    answerInput.value = '';
    answerInput.focus();
    startTimer();
});

submitBtn.addEventListener('click', () => {
    const userAnswer = parseFloat(answerInput.value);
    handleAnswer(userAnswer === currentAnswer);
    popup.classList.remove('active');
});

closeBtn.addEventListener('click', () => {
    clearInterval(timer);
    popup.classList.remove('active');
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent =
        document.body.classList.contains('light') ? '🌑' : '🌙';
});

historyBtn.addEventListener('click', () => {
    updateHistoryView();
    historyPopup.classList.add('active');
});

closeHistory.addEventListener('click', () => {
    historyPopup.classList.remove('active');
});