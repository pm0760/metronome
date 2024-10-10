document.addEventListener('DOMContentLoaded', () => {
    const metronomeSound = document.getElementById('metronome-sound');
    let metronomeInterval = null;
    let currentBPM = 0;
    let currentQuestion = 0;
    let mode = null;
    let timer = null;
    let timerSeconds = 30;
    let timerRunning = false;
    let metronomeActive = false;
    let questionActive = false;

    // 점수 변수
    let scoreExact = 0;
    let scoreNear = 0;
    let scoreIncorrect = 0;
    let passCount = 0;

    // 요소 가져오기
    const modeSelection = document.getElementById('mode-selection');
    const practiceModeButton = document.getElementById('practice-mode');
    const realModeButton = document.getElementById('real-mode');
    const quizDiv = document.getElementById('quiz');
    const infoLabel = document.getElementById('info-label');
    const timerLabel = document.getElementById('timer-label');
    const timerBar = document.getElementById('timer-bar');
    const playButton = document.getElementById('play-button');
    const bpmInput = document.getElementById('bpm-input');
    const submitButton = document.getElementById('submit-button');
    const feedbackLabel = document.getElementById('feedback-label');
    const scoreFrame = document.getElementById('score-frame');
    const exactLabel = document.getElementById('exact-label');
    const nearLabel = document.getElementById('near-label');
    const incorrectLabel = document.getElementById('incorrect-label');
    const passLabel = document.getElementById('pass-label');
    const pauseButton = document.getElementById('pause-button');
    const retryButton = document.getElementById('retry-button');
    const passButton = document.getElementById('pass-button');
    const backButton = document.getElementById('back-button');

    // 모드 선택
    practiceModeButton.addEventListener('click', () => setMode('practice'));
    realModeButton.addEventListener('click', () => setMode('real'));

    function setMode(selectedMode) {
        mode = selectedMode;
        modeSelection.style.display = 'none';
        quizDiv.style.display = 'block';
        if (mode === 'real') {
            scoreFrame.style.display = 'block';
            timerLabel.textContent = `⏳ 남은 시간: ${timerSeconds}초`;
            retryButton.style.display = 'inline-block';
        } else {
            scoreFrame.style.display = 'none';
            timerLabel.textContent = `🕒 연습 중...`;
            retryButton.style.display = 'none';
        }
    }

    // 메트로놈 재생
    playButton.addEventListener('click', generateQuestion);

    function generateQuestion() {
        if (questionActive) {
            alert('이미 문제가 활성화되어 있어!');
            return;
        }
        currentBPM = Math.floor(Math.random() * 151) + 50; // 50 ~ 200 사이의 랜덤 값
        currentQuestion += 1;
        infoLabel.textContent = `🔥 도전: ${currentQuestion}번째 문제`;
        feedbackLabel.textContent = '';
        bpmInput.disabled = false;
        submitButton.disabled = false;
        playButton.disabled = true;
        pauseButton.textContent = '일시정지';
        metronomeActive = true;
        questionActive = true;
        bpmInput.value = '';
        bpmInput.focus();

        if (mode === 'real') {
            timerSeconds = 30;
            timerLabel.textContent = `⏳ 남은 시간: ${timerSeconds}초`;
            timerBar.style.width = '0%';
            startTimer();
        }

        startMetronome();
    }

    function startMetronome() {
        if (metronomeInterval) clearInterval(metronomeInterval);
        const interval = (60 / currentBPM) * 1000;
        metronomeInterval = setInterval(() => {
            if (metronomeActive) {
                metronomeSound.currentTime = 0;
                metronomeSound.play();
            }
        }, interval);
    }

    // 일시정지 및 재생
    pauseButton.addEventListener('click', () => {
        if (metronomeActive) {
            metronomeActive = false;
            pauseButton.textContent = '재생';
        } else {
            metronomeActive = true;
            pauseButton.textContent = '일시정지';
        }
    });

    // 답 제출
    submitButton.addEventListener('click', checkAnswer);

    function checkAnswer() {
        if (!questionActive) {
            alert('현재 활성화된 문제가 없어!');
            return;
        }
        const userGuess = parseInt(bpmInput.value);
        if (isNaN(userGuess)) {
            alert('숫자를 입력해줘!');
            return;
        }
        const difference = userGuess - currentBPM;

        if (difference === 0) {
            if (mode === 'real') {
                scoreExact += 1;
                exactLabel.textContent = `🎯 퍼펙트 히트: ${scoreExact}번`;
            }
            feedbackLabel.textContent = `🎉 맞췄어! 완전 찰떡이야! BPM: ${currentBPM}`;
            feedbackLabel.style.color = 'green';
            endQuestion();
        } else if (mode === 'real' && Math.abs(difference) <= 10) {
            scoreNear += 1;
            nearLabel.textContent = `👍 나쁘지 않아: ${scoreNear}번`;
            feedbackLabel.textContent = `😎 거의 다 왔어! BPM: ${currentBPM}`;
            feedbackLabel.style.color = 'yellow';
            endQuestion();
        } else {
            if (mode === 'real') {
                scoreIncorrect += 1;
                incorrectLabel.textContent = `❌ 아쉬웠어: ${scoreIncorrect}번`;
                feedbackLabel.textContent = `😢 아쉬웠어! 정답은 ${currentBPM} BPM이었어.`;
                feedbackLabel.style.color = 'red';
                endQuestion();
            } else {
                if (difference < 0) {
                    feedbackLabel.textContent = '⬆️ 조금 더 빠르게 느껴져!';
                    feedbackLabel.style.color = '#FF8C00'; // 오렌지색
                } else {
                    feedbackLabel.textContent = '⬇️ 조금 더 느리게 느껴져!';
                    feedbackLabel.style.color = '#1E90FF'; // 파란색
                }
            }
        }
    }

    function endQuestion() {
        bpmInput.disabled = true;
        submitButton.disabled = true;
        playButton.disabled = false;
        metronomeActive = false;
        clearInterval(metronomeInterval);
        questionActive = false;
        if (timer) clearInterval(timer);
        timerRunning = false;
    }

    // 타이머 시작
    function startTimer() {
        if (timer) clearInterval(timer);
        timerRunning = true;
        timer = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds -= 1;
                timerLabel.textContent = `⏳ 남은 시간: ${timerSeconds}초`;
                timerBar.style.width = `${(30 - timerSeconds) / 30 * 100}%`;
            } else {
                timerLabel.textContent = '⌛️ 시간 초과!';
                timerBar.style.width = '100%';
                feedbackLabel.textContent = `⌛️ 시간 초과! 정답은 ${currentBPM} BPM이었어.`;
                feedbackLabel.style.color = 'orange';
                endQuestion();
            }
        }, 1000);
    }

    // 패스 기능
    passButton.addEventListener('click', () => {
        if (!questionActive) {
            alert('현재 활성화된 문제가 없어!');
            return;
        }
        if (mode === 'real') {
            passCount += 1;
            passLabel.textContent = `⏭️ 스킵: ${passCount}번`;
        }
        feedbackLabel.textContent = `⏭️ 스킵했어! 정답은 ${currentBPM} BPM이었어.`;
        feedbackLabel.style.color = 'orange';
        endQuestion();
    });

    // 다시 하기 기능
    retryButton.addEventListener('click', () => {
        scoreExact = 0;
        scoreNear = 0;
        scoreIncorrect = 0;
        passCount = 0;
        currentQuestion = 0;
        infoLabel.textContent = `🔥 도전: ${currentQuestion}번째 문제`;
        feedbackLabel.textContent = '';
        bpmInput.value = '';
        bpmInput.disabled = true;
        submitButton.disabled = true;
        playButton.disabled = false;
        timerLabel.textContent = `⏳ 남은 시간: ${timerSeconds}초`;
        timerBar.style.width = '0%';
        exactLabel.textContent = `🎯 퍼펙트 히트: ${scoreExact}번`;
        nearLabel.textContent = `👍 나쁘지 않아: ${scoreNear}번`;
        incorrectLabel.textContent = `❌ 아쉬웠어: ${scoreIncorrect}번`;
        passLabel.textContent = `⏭️ 스킵: ${passCount}번`;
    });

    // 뒤로가기 기능
    backButton.addEventListener('click', () => {
        location.reload();
    });
});
