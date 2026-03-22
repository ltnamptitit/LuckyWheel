/* ========== RANDOM PICK GAME ========== */
const pickBtn = document.getElementById('pickBtn');
const pickNameEl = document.getElementById('pickName');
const pickResultEl = document.getElementById('pickResult');
let isPicking = false;

pickBtn.addEventListener('click', () => {
  if (isPicking || students.length === 0) return;
  ensureAudio();
  isPicking = true;
  pickBtn.disabled = true;
  pickResultEl.textContent = '';
  pickResultEl.style.color = '#fff';
  pickNameEl.classList.add('shuffling');

  const selectedOptions = getCheatSelectedIndices();
  let finalIdx;
  if (selectedOptions.length > 0) {
    finalIdx = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
  } else {
    finalIdx = Math.floor(Math.random() * students.length);
  }

  const duration = 2500 + Math.random() * 1500;
  const startTime = performance.now();
  let lastShown = -1;

  function shuffleAnim(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const interval = 50 + progress * 300;
    const randIdx = Math.floor(Math.random() * students.length);
    if (randIdx !== lastShown) {
      pickNameEl.textContent = students[randIdx];
      lastShown = randIdx;
      if (progress < 0.9) playTick();
    }

    if (progress < 1) {
      setTimeout(() => requestAnimationFrame(shuffleAnim), interval);
    } else {
      pickNameEl.classList.remove('shuffling');
      pickNameEl.textContent = students[finalIdx];
      pickResultEl.style.color = '#FFD700';
      pickResultEl.textContent = 'Chúc mừng: ' + students[finalIdx] + '!';

      const removeWinner = document.getElementById('cheatRemoveWinner').checked;
      if (removeWinner && students.length > 1) {
        students.splice(finalIdx, 1);
        generateColors();
        populateCheatList();
        if (typeof drawWheel === 'function') drawWheel();
      }

      isPicking = false;
      pickBtn.disabled = false;
      playWinSound();
      launchConfetti();
    }
  }

  requestAnimationFrame(shuffleAnim);
});
