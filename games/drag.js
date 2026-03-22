/* ========== DRAG & DROP FILL GAME ========== */
let dragQuestions = [
  {
    sentence: 'Hai bên đường, những cánh đồng ___ , những vườn cây ___ , những má nhà ẩn hiện dưới những tán cây xanh. Nhà cửa ___ , không ___ như ở thành phố. Tôi mở cửa kính xe để được hít thở không khí ___ của làng quê yên bình.',
    answers: ['mênh mông', 'xanh mát', 'thưa thớt', 'san sát', 'trong lành'],
    options: ['trong lành', 'xanh mát', 'san sát', 'mênh mông', 'thưa thớt']
  },
  {
    sentence: 'Từ bé, tôi đã quen với cảnh ___ của phố xá, xe cộ đi lại ___ , nhà cửa ___ , công viên rợp bóng cây xanh cùng những trung tâm thương mại ___ . Ban đêm, đèn điện ___ như ban ngày.',
    answers: ['nhộn nhịp', 'tấp nập', 'san sát', 'sầm uát', 'sáng trưng'],
    options: ['sầm uát', 'nhộn nhịp', 'tấp nập', 'sáng trưng', 'san sát']
  },
];

let dragCurrentQ = 0;
let dragUserAnswers = [];

const dragSentenceEl = document.getElementById('dragSentence');
const dragWordsEl = document.getElementById('dragWords');
const dragResultEl = document.getElementById('dragResult');
const dragQNumEl = document.getElementById('dragQNum');
const dragPrevBtn = document.getElementById('dragPrev');
const dragNextBtn = document.getElementById('dragNext');
const dragCheckBtn = document.getElementById('dragCheck');
const dragResetBtn = document.getElementById('dragReset');
const dragEditToggle = document.getElementById('dragEditToggle');
const dragEditorEl = document.getElementById('dragEditor');
const dragInputEl = document.getElementById('dragInput');
const dragApplyBtn = document.getElementById('dragApply');
const dragEditorCloseBtn = document.getElementById('dragEditorClose');

let dragState = null;

function dragRenderQuestion() {
  const q = dragQuestions[dragCurrentQ];
  if (!q) return;

  dragState = null;
  dragResultEl.textContent = '';
  dragResultEl.style.color = '#fff';

  const blankCount = (q.sentence.match(/___/g) || []).length;
  dragUserAnswers = new Array(blankCount).fill(null);

  dragQNumEl.textContent = `${dragCurrentQ + 1} / ${dragQuestions.length}`;
  dragPrevBtn.disabled = dragCurrentQ === 0;
  dragNextBtn.disabled = dragCurrentQ === dragQuestions.length - 1;

  let html = '';
  let bi = 0;
  const parts = q.sentence.split('___');
  parts.forEach((part, i) => {
    html += escapeHtml(part);
    if (i < parts.length - 1) {
      html += `<span class="drag-blank" data-blank="${bi}" data-dropzone="true"></span>`;
      bi++;
    }
  });
  dragSentenceEl.innerHTML = html;

  dragSentenceEl.querySelectorAll('.drag-blank').forEach(blank => {
    blank.addEventListener('dragover', e => { e.preventDefault(); blank.classList.add('drag-over'); });
    blank.addEventListener('dragleave', () => blank.classList.remove('drag-over'));
    blank.addEventListener('drop', e => {
      e.preventDefault();
      blank.classList.remove('drag-over');
      handleDropOnBlank(parseInt(blank.dataset.blank));
    });
    blank.addEventListener('mousedown', e => startDragFromBlank(e, blank));
    blank.addEventListener('touchstart', e => startDragFromBlank(e, blank), { passive: false });
  });

  const shuffled = [...q.options].sort(() => Math.random() - 0.5);
  dragRenderWords(shuffled);
}

function dragRenderWords(wordList) {
  dragWordsEl.innerHTML = '';
  wordList.forEach(word => {
    const el = document.createElement('div');
    el.className = 'drag-word';
    el.textContent = word;
    el.draggable = true;
    el.dataset.word = word;

    if (dragUserAnswers.includes(word)) {
      el.classList.add('used');
      el.draggable = false;
    }

    el.addEventListener('dragstart', e => {
      dragState = { word, sourceBlankIdx: null, ghostEl: null };
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', word);
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      dragState = null;
    });

    el.addEventListener('touchstart', e => startTouchDrag(e, el, word, null), { passive: false });

    dragWordsEl.appendChild(el);
  });
}

function handleDropOnBlank(blankIdx) {
  if (!dragState) return;
  const { word, sourceBlankIdx } = dragState;

  if (sourceBlankIdx !== null) {
    dragUserAnswers[sourceBlankIdx] = null;
    updateBlankDisplay(sourceBlankIdx);
  }

  if (dragUserAnswers[blankIdx] !== null) {
    dragUserAnswers[blankIdx] = null;
  }

  dragUserAnswers[blankIdx] = word;
  updateBlankDisplay(blankIdx);
  dragUpdateWordStates();
}

function updateBlankDisplay(blankIdx) {
  const blankEl = dragSentenceEl.querySelector(`[data-blank="${blankIdx}"]`);
  if (!blankEl) return;
  const val = dragUserAnswers[blankIdx];
  blankEl.textContent = val || '';
  blankEl.classList.toggle('filled', val !== null);
  blankEl.classList.remove('correct', 'wrong', 'drag-over');
}

function dragUpdateWordStates() {
  dragWordsEl.querySelectorAll('.drag-word').forEach(el => {
    const used = dragUserAnswers.includes(el.dataset.word);
    el.classList.toggle('used', used);
    el.draggable = !used;
  });
}

function startDragFromBlank(e, blankEl) {
  const bi = parseInt(blankEl.dataset.blank);
  if (dragUserAnswers[bi] === null) return;

  const word = dragUserAnswers[bi];

  if (e.type === 'touchstart') {
    e.preventDefault();
    startTouchDrag(e, blankEl, word, bi);
  } else {
    blankEl.draggable = true;
    blankEl.addEventListener('dragstart', function handler(ev) {
      dragState = { word, sourceBlankIdx: bi, ghostEl: null };
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', word);
      blankEl.removeEventListener('dragstart', handler);
      setTimeout(() => {
        dragUserAnswers[bi] = null;
        updateBlankDisplay(bi);
        dragUpdateWordStates();
      }, 0);
    }, { once: true });
  }
}

function startTouchDrag(e, sourceEl, word, sourceBlankIdx) {
  e.preventDefault();
  const touch = e.touches[0];

  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.textContent = word;
  ghost.style.left = touch.clientX + 'px';
  ghost.style.top = touch.clientY + 'px';
  document.body.appendChild(ghost);

  dragState = { word, sourceBlankIdx, ghostEl: ghost };

  if (sourceEl.classList.contains('drag-word')) {
    sourceEl.classList.add('dragging');
  }

  if (sourceBlankIdx !== null) {
    dragUserAnswers[sourceBlankIdx] = null;
    updateBlankDisplay(sourceBlankIdx);
    dragUpdateWordStates();
  }

  let currentOverBlank = null;

  function onTouchMove(ev) {
    const t = ev.touches[0];
    ghost.style.left = t.clientX + 'px';
    ghost.style.top = t.clientY + 'px';

    ghost.style.display = 'none';
    const elUnder = document.elementFromPoint(t.clientX, t.clientY);
    ghost.style.display = '';

    dragSentenceEl.querySelectorAll('.drag-blank').forEach(b => b.classList.remove('drag-over'));
    currentOverBlank = null;

    if (elUnder && elUnder.classList.contains('drag-blank')) {
      elUnder.classList.add('drag-over');
      currentOverBlank = parseInt(elUnder.dataset.blank);
    }
  }

  function onTouchEnd() {
    ghost.remove();
    if (sourceEl.classList.contains('drag-word')) {
      sourceEl.classList.remove('dragging');
    }
    dragSentenceEl.querySelectorAll('.drag-blank').forEach(b => b.classList.remove('drag-over'));

    if (currentOverBlank !== null) {
      handleDropOnBlank(currentOverBlank);
    } else {
      if (sourceBlankIdx !== null) {
        dragUpdateWordStates();
      }
    }

    dragState = null;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  }

  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
}

dragWordsEl.addEventListener('dragover', e => e.preventDefault());
dragWordsEl.addEventListener('drop', e => {
  e.preventDefault();
  if (dragState && dragState.sourceBlankIdx !== null) {
    dragUpdateWordStates();
    dragState = null;
  }
});

dragCheckBtn.addEventListener('click', () => {
  const q = dragQuestions[dragCurrentQ];
  if (!q) return;

  let allCorrect = true;
  dragSentenceEl.querySelectorAll('.drag-blank').forEach((blank, i) => {
    blank.classList.remove('correct', 'wrong', 'drag-over');
    if (dragUserAnswers[i] === q.answers[i]) {
      blank.classList.add('correct');
    } else {
      blank.classList.add('wrong');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    dragResultEl.style.color = '#2ECC71';
    dragResultEl.textContent = 'Chính xác! Tuyệt vời!';
    ensureAudio();
    playWinSound();
    launchConfetti();
  } else {
    dragResultEl.style.color = '#E74C3C';
    dragResultEl.textContent = 'Chưa đúng, hãy thử lại!';
  }
});

dragResetBtn.addEventListener('click', () => dragRenderQuestion());

dragPrevBtn.addEventListener('click', () => {
  if (dragCurrentQ > 0) { dragCurrentQ--; dragRenderQuestion(); }
});
dragNextBtn.addEventListener('click', () => {
  if (dragCurrentQ < dragQuestions.length - 1) { dragCurrentQ++; dragRenderQuestion(); }
});

dragEditToggle.addEventListener('click', () => {
  dragEditorEl.classList.toggle('open');
  if (dragEditorEl.classList.contains('open')) {
    dragInputEl.value = fillQuestionsToText(dragQuestions);
  }
});
dragEditorCloseBtn.addEventListener('click', () => dragEditorEl.classList.remove('open'));
dragApplyBtn.addEventListener('click', () => {
  const parsed = fillParseText(dragInputEl.value);
  if (parsed.length === 0) { alert('Không tìm thấy câu hỏi hợp lệ!'); return; }
  dragQuestions = parsed;
  dragCurrentQ = 0;
  dragEditorEl.classList.remove('open');
  dragRenderQuestion();
});

dragRenderQuestion();
