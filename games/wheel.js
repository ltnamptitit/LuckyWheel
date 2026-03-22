/* ========== LUCKY WHEEL GAME ========== */
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const W = canvas.width, R = W / 2;

let currentRotation = 0;
let isSpinning = false;

function drawWheel() {
  const n = students.length;
  const arc = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, W, W);
  ctx.save();
  ctx.translate(R, R);
  ctx.rotate(currentRotation);

  for (let i = 0; i < n; i++) {
    const startAngle = i * arc;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R - 6, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = sliceColors[i] || randomColor();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(startAngle + arc / 2);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.min(22, Math.max(12, Math.floor(280 / n)))}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 3;

    let name = students[i];
    if (ctx.measureText(name).width > R - 70) {
      while (ctx.measureText(name + '...').width > R - 70 && name.length > 1) {
        name = name.slice(0, -1);
      }
      name += '...';
    }
    ctx.fillText(name, R - 30, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, 2 * Math.PI);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.arc(R, R, R - 2, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,.3)';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function getWinnerIndex() {
  const n = students.length;
  const arc = (2 * Math.PI) / n;
  let localAngle = (0 - currentRotation) % (2 * Math.PI);
  if (localAngle < 0) localAngle += 2 * Math.PI;
  let idx = Math.floor(localAngle / arc) % n;
  return idx;
}

function calcRotationForIndex(targetIdx) {
  const n = students.length;
  const arc = (2 * Math.PI) / n;
  const targetAngle = -targetIdx * arc - arc / 2;
  const jitter = (Math.random() - 0.5) * arc * 0.6;
  return targetAngle + jitter;
}

const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');

spinBtn.addEventListener('click', () => {
  if (isSpinning || students.length === 0) return;
  ensureAudio();
  isSpinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = '';
  resultEl.style.color = '#fff';

  const duration = 5000 + Math.random() * 5000;
  const selectedOptions = getCheatSelectedIndices();

  let totalRotation;
  let usedCheatIdx = -1;
  if (selectedOptions.length > 0) {
    const cheatIdx = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
    usedCheatIdx = cheatIdx;
    const fullTurns = (8 + Math.floor(Math.random() * 12)) * 2 * Math.PI;
    const desiredFinal = calcRotationForIndex(cheatIdx);
    let needed = desiredFinal - currentRotation;
    needed = ((needed % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    totalRotation = fullTurns + needed;
  } else {
    const baseTurns = (8 + Math.random() * 12) * 2 * Math.PI;
    totalRotation = baseTurns + Math.random() * 2 * Math.PI;
  }

  const startRotation = currentRotation;
  const startTime = performance.now();
  let lastIdx = -1;

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    currentRotation = startRotation + totalRotation * eased;
    drawWheel();

    const idx = getWinnerIndex();
    if (idx !== lastIdx) {
      if (progress < 0.95) playTick();
      lastIdx = idx;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;
      const winner = students[getWinnerIndex()];
      resultEl.style.color = '#FFD700';
      resultEl.textContent = 'Chúc mừng: ' + winner + '!';
      const removeWinner = document.getElementById('cheatRemoveWinner').checked;
      const winnerIdx = getWinnerIndex();
      if (removeWinner && students.length > 1) {
        students.splice(winnerIdx, 1);
        generateColors();
        currentRotation = 0;
        populateCheatList();
        drawWheel();
      }
      playWinSound();
      launchConfetti();
    }
  }

  requestAnimationFrame(animate);
});

drawWheel();
