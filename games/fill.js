/* ========== FILL IN THE BLANKS GAME ========== */
let fillQuestions = [
  {
    sentence: 'Trái Đất quay quanh ___ và mất khoảng ___ để hoàn thành một vòng.',
    answers: ['Mặt Trời', '365 ngày'],
    options: ['Mặt Trời', 'Mặt Trăng', '365 ngày', '30 ngày', 'Sao Hỏa']
  },
  {
    sentence: 'Nước sôi ở ___ độ C và đóng băng ở ___ độ C.',
    answers: ['100', '0'],
    options: ['100', '0', '50', '200', '-10']
  },
  {
    sentence: 'Thủ đô của Việt Nam là ___. Thành phố lớn nhất là ___.',
    answers: ['Hà Nội', 'TP. Hồ Chí Minh'],
    options: ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Huế', 'Hải Phòng']
  }
];

let fillCurrentQ = 0;
let fillActiveBlank = null;

const fillSentenceEl = document.getElementById('fillSentence');
const fillWordsEl = document.getElementById('fillWords');
const fillResultEl = document.getElementById('fillResult');
const fillQNumEl = document.getElementById('fillQNum');
const fillPrevBtn = document.getElementById('fillPrev');
const fillNextBtn = document.getElementById('fillNext');
const fillCheckBtn = document.getElementById('fillCheck');
const fillResetBtn = document.getElementById('fillReset');
const fillEditToggle = document.getElementById('fillEditToggle');
const fillEditor = document.getElementById('fillEditor');
const fillInput = document.getElementById('fillInput');
const fillApplyBtn = document.getElementById('fillApply');
const fillEditorCloseBtn = document.getElementById('fillEditorClose');

let fillUserAnswers = [];

function fillRenderQuestion() {
  const q = fillQuestions[fillCurrentQ];
  if (!q) return;

  fillActiveBlank = null;
  fillResultEl.textContent = '';
  fillResultEl.style.color = '#fff';

  const blankCount = (q.sentence.match(/___/g) || []).length;
  fillUserAnswers = new Array(blankCount).fill(null);

  fillQNumEl.textContent = `${fillCurrentQ + 1} / ${fillQuestions.length}`;
  fillPrevBtn.disabled = fillCurrentQ === 0;
  fillNextBtn.disabled = fillCurrentQ === fillQuestions.length - 1;

  let html = '';
  let blankIdx = 0;
  const parts = q.sentence.split('___');
  parts.forEach((part, i) => {
    html += escapeHtml(part);
    if (i < parts.length - 1) {
      html += `<span class="fill-blank" data-blank="${blankIdx}"></span>`;
      blankIdx++;
    }
  });
  fillSentenceEl.innerHTML = html;

  fillSentenceEl.querySelectorAll('.fill-blank').forEach(blank => {
    blank.addEventListener('click', () => {
      const bi = parseInt(blank.dataset.blank);
      if (fillUserAnswers[bi] !== null) {
        fillUserAnswers[bi] = null;
        blank.textContent = '';
        blank.classList.remove('filled', 'correct', 'wrong');
        fillRenderWords();
      }
      fillSentenceEl.querySelectorAll('.fill-blank').forEach(b => b.classList.remove('active'));
      blank.classList.add('active');
      fillActiveBlank = bi;
    });
  });

  const shuffled = [...q.options].sort(() => Math.random() - 0.5);
  fillRenderWordsFromList(shuffled);
}

function fillRenderWordsFromList(wordList) {
  fillWordsEl.innerHTML = '';
  wordList.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'fill-word';
    btn.textContent = word;
    if (fillUserAnswers.includes(word)) {
      btn.classList.add('used');
    }
    btn.addEventListener('click', () => {
      if (btn.classList.contains('used')) return;
      if (fillActiveBlank === null) {
        const emptyIdx = fillUserAnswers.indexOf(null);
        if (emptyIdx === -1) return;
        fillActiveBlank = emptyIdx;
        const blankEl = fillSentenceEl.querySelector(`[data-blank="${emptyIdx}"]`);
        fillSentenceEl.querySelectorAll('.fill-blank').forEach(b => b.classList.remove('active'));
        blankEl.classList.add('active');
      }
      fillUserAnswers[fillActiveBlank] = word;
      const blankEl = fillSentenceEl.querySelector(`[data-blank="${fillActiveBlank}"]`);
      blankEl.textContent = word;
      blankEl.classList.add('filled');
      blankEl.classList.remove('active', 'correct', 'wrong');

      fillActiveBlank = null;
      const nextEmpty = fillUserAnswers.indexOf(null);
      if (nextEmpty !== -1) {
        fillActiveBlank = nextEmpty;
        const nextBlankEl = fillSentenceEl.querySelector(`[data-blank="${nextEmpty}"]`);
        fillSentenceEl.querySelectorAll('.fill-blank').forEach(b => b.classList.remove('active'));
        nextBlankEl.classList.add('active');
      }

      fillRenderWords();
    });
    fillWordsEl.appendChild(btn);
  });
}

function fillRenderWords() {
  fillWordsEl.querySelectorAll('.fill-word').forEach(btn => {
    if (fillUserAnswers.includes(btn.textContent)) {
      btn.classList.add('used');
    } else {
      btn.classList.remove('used');
    }
  });
}

fillCheckBtn.addEventListener('click', () => {
  const q = fillQuestions[fillCurrentQ];
  if (!q) return;

  let allCorrect = true;
  fillSentenceEl.querySelectorAll('.fill-blank').forEach((blank, i) => {
    blank.classList.remove('active', 'correct', 'wrong');
    if (fillUserAnswers[i] === q.answers[i]) {
      blank.classList.add('correct');
    } else {
      blank.classList.add('wrong');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    fillResultEl.style.color = '#2ECC71';
    fillResultEl.textContent = 'Chính xác! Tuyệt vời!';
    ensureAudio();
    playWinSound();
    launchConfetti();
  } else {
    fillResultEl.style.color = '#E74C3C';
    fillResultEl.textContent = 'Chưa đúng, hãy thử lại!';
  }
});

fillResetBtn.addEventListener('click', () => fillRenderQuestion());

fillPrevBtn.addEventListener('click', () => {
  if (fillCurrentQ > 0) { fillCurrentQ--; fillRenderQuestion(); }
});
fillNextBtn.addEventListener('click', () => {
  if (fillCurrentQ < fillQuestions.length - 1) { fillCurrentQ++; fillRenderQuestion(); }
});

fillEditToggle.addEventListener('click', () => {
  fillEditor.classList.toggle('open');
  if (fillEditor.classList.contains('open')) {
    fillInput.value = fillQuestionsToText(fillQuestions);
  }
});
fillEditorCloseBtn.addEventListener('click', () => fillEditor.classList.remove('open'));

fillApplyBtn.addEventListener('click', () => {
  const parsed = fillParseText(fillInput.value);
  if (parsed.length === 0) { alert('Không tìm thấy câu hỏi hợp lệ!'); return; }
  fillQuestions = parsed;
  fillCurrentQ = 0;
  fillEditor.classList.remove('open');
  fillRenderQuestion();
});

fillRenderQuestion();
