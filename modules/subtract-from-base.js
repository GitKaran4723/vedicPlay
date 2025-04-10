(function () {
    const localPrefix = "base_subtract";
  
    // Always reset progress on reload
    localStorage.removeItem(`${localPrefix}_correct`);
    localStorage.removeItem(`${localPrefix}_total`);
    localStorage.removeItem(`${localPrefix}_time_taken`);
  
    const questionLimit = parseInt(
      localStorage.getItem(`${localPrefix}_question_limit`) || "10",
      10
    );
    const baseOptions = [100, 1000, 10000];
    let base = 100;
    let current = 0;
    let startTime = null;
    let totalTimeTaken = 0;
    let correct = 0;
    let total = 0;
  
    // Inject UI
    const main = document.getElementById("main");
    main.innerHTML = `
      <div class="bg-white/10 p-6 rounded-lg text-center space-y-4">
        <div class="w-full max-w-xs mx-auto mb-2">
          <div class="h-2 bg-white/20 rounded-full overflow-hidden">
            <div id="progressBar" class="h-full bg-yellow-400 transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
        <h2 id="question" class="text-2xl font-bold text-yellow-300">Loading...</h2>
        <input id="answer" type="number" class="w-full max-w-xs p-2 text-black rounded" placeholder="Enter answer" />
        <p id="status" class="text-sm text-teal-300"></p>
        <p class="text-sm text-white">
          Time Taken: <span id="timeDisplay">0</span> sec
        </p>
      </div>
    `;
  
    const questionEl = document.getElementById("question");
    const answerEl = document.getElementById("answer");
    const statusEl = document.getElementById("status");
    const timeDisplay = document.getElementById("timeDisplay");
    const progressBar = document.getElementById("progressBar");
  
    let timerInterval = null;
  
    function startTimer() {
      if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
          const currentDuration = Math.floor((Date.now() - startTime) / 1000);
          timeDisplay.textContent = totalTimeTaken + currentDuration;
        }, 1000);
      }
    }
  
    function stopTimerAndStore() {
      if (startTime) {
        const sessionTime = Math.floor((Date.now() - startTime) / 1000);
        totalTimeTaken += sessionTime;
        clearInterval(timerInterval);
      }
    }
  
    function updateProgress() {
      const progressPercent = Math.min((total / questionLimit) * 100, 100);
      progressBar.style.width = `${progressPercent}%`;
    }
  
    function subtractFromBase(base, num) {
      return base - num;
    }
  
    function saveCompletedSession(correct, total, time) {
      const historyKey = `${localPrefix}_history`;
      const entry = {
        date: new Date().toISOString(),
        correct,
        total,
        time,
      };
  
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift(entry); // Add to front
      if (history.length > 10) history.pop(); // Keep last 10 only
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  
    function showCompletionScreen() {
      stopTimerAndStore();
      const accuracy = ((correct / questionLimit) * 100).toFixed(2);
      const duration = totalTimeTaken;
  
      saveCompletedSession(correct, questionLimit, duration);
  
      main.innerHTML = `
        <div class="bg-white/10 p-6 rounded-lg text-center space-y-4">
          <h2 class="text-3xl font-bold text-yellow-300">🎉 Practice Complete!</h2>
          <input disabled class="w-full max-w-xs p-2 text-center text-black rounded bg-white/20" value="${accuracy}% Accuracy"/>
          <p class="text-green-400 text-lg font-semibold">You've completed ${questionLimit} questions!</p>
          <p class="text-white text-sm">Time Taken: ${duration} sec</p>
          <div class="flex flex-col md:flex-row gap-4 justify-center mt-4">
            <button onclick="restartPractice()" class="bg-yellow-400 text-black font-bold px-4 py-2 rounded hover:bg-yellow-300">
              🔁 Restart
            </button>
            <button onclick="window.location.href='intro-subtract-from-base.html'" class="bg-teal-400 text-black font-bold px-4 py-2 rounded hover:bg-teal-300">
              🔙 Go Back
            </button>
          </div>
        </div>
      `;
    }
  
    window.restartPractice = function () {
      location.reload(); // Already resets on reload
    };
  
    function generateQuestion() {
      if (total >= questionLimit) {
        showCompletionScreen();
        return;
      }
  
      base = baseOptions[Math.floor(Math.random() * baseOptions.length)];
      current = Math.floor(Math.random() * (base - 1));
      questionEl.textContent = `${base} - ${current} = ?`;
      answerEl.value = "";
      answerEl.focus();
      updateProgress();
      startTimer();
    }
  
    answerEl.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const userAnswer = parseInt(answerEl.value.trim(), 10);
        const expectedAnswer = subtractFromBase(base, current);
        total++;
        if (userAnswer === expectedAnswer) {
          correct++;
          statusEl.textContent = "✅ Correct!";
          statusEl.classList.remove("text-red-400");
          statusEl.classList.add("text-green-400");
        } else {
          statusEl.textContent = `❌ Incorrect. Answer was ${expectedAnswer}`;
          statusEl.classList.remove("text-green-400");
          statusEl.classList.add("text-red-400");
        }
        generateQuestion();
      }
    });
  
    generateQuestion();
  })();
  