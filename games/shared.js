/* ========== STUDENT LIST ========== */
let students = [
  "Đỗ Ngọc Khánh An",
  "Đỗ Nguyễn Tú Anh",
  "Lê Trần Quốc Anh",
  "Nguyễn Võ Minh Anh",
  "Phạm Phương Anh",
  "Tạ Vũ Minh Anh",
  "Nguyễn Hoàng Ân",
  "Nguyễn Đức Công Bình",
  "Nguyễn Thị Thùy Duyên",
  "Lê Trịnh Gia Hân",
  "Nguyễn Ngọc Bảo Hân",
  "Võ Hoàng Ngọc Hân",
  "Đỗ Ngọc Gia Hân",
  "Đỗ Minh Hiếu",
  "Vũ Gia Hòa",
  "Lê Nguyễn Thanh Huy",
  "Đặng Hoàng Hưng",
  "Nguyễn Duy Khang",
  "Nguyễn Võ Đăng Khoa",
  "Lê Nguyễn Bảo Khánh",
  "Nguyễn Lê Gia Khiêm",
  "Phạm Đăng Khôi",
  "Trần Ngọc Phúc Lâm",
  "Nguyễn Huyền Khánh Linh",
  "Cao Khánh Linh",
  "Nguyễn Trần Khánh Ly",
  "La Khải Minh",
  "Nguyễn Phương Nghi",
  "Phan Hoàng Hải Nguyên",
  "Đặng Hoàng Phương Nhi",
  "Huỳnh Mẫn Nhi",
  "Nguyễn Vũ Gia Nhi",
  "Trương Bảo Ngọc",
  "Dương Bảo Phúc",
  "Trần Phú",
  "Nguyễn Hà Khánh Phương",
  "Đàm Minh Quân",
  "Hồ Thiên Sơn",
  "Phạm Ngọc Bảo Thiên",
  "Nguyễn Cát Thịnh",
  "Nguyễn Lê Phúc Thịnh",
  "Lê Nguyễn Minh Thư",
  "Lài Xuân Tú",
  "Nguyễn Việt Anh Tài",
  "Lê Quang Thịnh",
  "Nguyễn Tường Vy",
  "Nguyễn Nhân Thiên Ý"
];

/* ========== COLORS ========== */
function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.floor(Math.random() * 35);
  const l = 40 + Math.floor(Math.random() * 25);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

let sliceColors = [];
function generateColors() {
  sliceColors = students.map(() => randomColor());
}
generateColors();

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#E74C3C', '#2ECC71', '#3498DB', '#F39C12', '#8E44AD', '#1ABC9C'
];

/* ========== AUDIO ========== */
let audioCtx;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTick() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.03);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

function playWinSound() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = t0 + i * 0.12;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

/* ========== CONFETTI ========== */
const confettiCanvas = document.getElementById('confetti');
const cctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiAnim = null;

function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

function launchConfetti() {
  confettiPieces = [];
  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
      opacity: 1
    });
  }
  if (confettiAnim) cancelAnimationFrame(confettiAnim);
  animateConfetti();
}

function animateConfetti() {
  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  let alive = false;
  confettiPieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.rot += p.rotV;
    if (p.y > confettiCanvas.height + 20) {
      p.opacity -= 0.02;
    }
    if (p.opacity <= 0) return;
    alive = true;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.globalAlpha = Math.max(0, p.opacity);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cctx.restore();
  });
  if (alive) {
    confettiAnim = requestAnimationFrame(animateConfetti);
  }
}

/* ========== CHEAT SYSTEM ========== */
const cheatPanel = document.getElementById('cheatPanel');
const cheatList = document.getElementById('cheatList');

function populateCheatList() {
  const checked = getCheatSelectedIndices();
  cheatList.innerHTML = '';
  students.forEach((name, i) => {
    const label = document.createElement('label');
    label.className = 'cheat-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = i;
    cb.checked = checked.includes(i);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(name));
    cheatList.appendChild(label);
  });
}

function getCheatSelectedIndices() {
  return Array.from(cheatList.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => parseInt(cb.value))
    .filter(v => v >= 0 && v < students.length);
}

populateCheatList();

document.getElementById('cheatAll').addEventListener('click', () => {
  cheatList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
});
document.getElementById('cheatNone').addEventListener('click', () => {
  cheatList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'K') {
    e.preventDefault();
    cheatPanel.classList.toggle('open');
    if (cheatPanel.classList.contains('open')) populateCheatList();
  }
});

/* ========== HELPER ========== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function fillQuestionsToText(questions) {
  return questions.map(q => {
    return q.sentence + '\n' + q.answers.join(' | ') + '\n' + q.options.join(' | ');
  }).join('\n\n');
}

function fillParseText(text) {
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
  const result = [];
  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 3) return;
    const sentence = lines[0];
    const answers = lines[1].split('|').map(s => s.trim()).filter(s => s);
    const options = lines[2].split('|').map(s => s.trim()).filter(s => s);
    const blankCount = (sentence.match(/___/g) || []).length;
    if (blankCount === 0 || answers.length !== blankCount) return;
    result.push({ sentence, answers, options });
  });
  return result;
}
