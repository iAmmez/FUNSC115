const progressBar = document.getElementById('progressBar');
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('section.lesson')];

if (progressBar && sections.length) window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${Math.min(100, (scrollTop / docHeight) * 100)}%`;

    let current = sections[0].id;
    sections.forEach(section => {
        if (scrollTop >= section.offsetTop - 120) current = section.id;
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
});

document.querySelectorAll('[data-poll] .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('correct');
    });
});

document.querySelectorAll('[data-quiz]').forEach(quiz => {
    quiz.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = quiz.dataset.answer;
            const feedback = quiz.nextElementSibling?.matches('[data-feedback]')
                ? quiz.nextElementSibling
                : quiz.parentElement.querySelector('[data-feedback]');
            quiz.querySelectorAll('.option-btn').forEach(b => b.classList.remove('correct', 'wrong'));
            if (btn.dataset.choice === answer) {
                btn.classList.add('correct');
                feedback.textContent = 'ถูกต้อง';
                feedback.className = 'good';
            } else {
                btn.classList.add('wrong');
                feedback.textContent = 'ยังไม่ถูก';
                feedback.className = 'bad';
            }
        });
    });
});

document.querySelectorAll('[data-text-check]').forEach(check => {
    const input = check.querySelector('input');
    const button = check.querySelector('button');
    const feedback = check.querySelector('[data-text-feedback]');
    if (!input || !button || !feedback) return;
    button.addEventListener('click', () => {
        const answer = input.value.trim().toLowerCase();
        const accepted = (check.dataset.accept || '').split('|').map(s => s.trim().toLowerCase()).filter(Boolean);
        const matched = accepted.some(key => answer.includes(key));
        feedback.textContent = matched ? 'ถูกต้อง' : 'ลองทบทวนคำสำคัญอีกครั้ง';
        feedback.className = matched ? 'good' : 'bad';
    });
});

document.querySelectorAll('[data-reveal]').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.parentElement.querySelector('[data-reveal-answer]');
        if (!answer) return;
        answer.hidden = !answer.hidden;
        button.textContent = answer.hidden ? 'ดูแนวคำตอบ' : 'ซ่อนแนวคำตอบ';
    });
});

document.querySelectorAll('[data-multi]').forEach(group => {
    group.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const correct = btn.dataset.correct === 'true';
            btn.classList.toggle(correct ? 'correct' : 'wrong');
            const explanationKey = btn.dataset.explanation;
            if (explanationKey) {
                const explanation = group.closest('.interaction')?.querySelector(`[data-answer-explanation="${explanationKey}"]`);
                if (explanation) explanation.hidden = !btn.classList.contains(correct ? 'correct' : 'wrong');
            }
        });
    });
});

document.querySelectorAll('.final-options').forEach(group => {
    group.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'correct', 'wrong'));
            btn.classList.add('selected');
            group.dataset.value = btn.dataset.value;
        });
    });
});

let dragged = null;
document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('drag-item')) dragged = e.target;
});

document.querySelectorAll('.dropzone').forEach(zone => {
    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('over');
        if (dragged) zone.appendChild(dragged);
    });
});

function checkDropzones(button) {
    const interaction = button.closest('.interaction');
    const zones = interaction.querySelectorAll('.dropzone');
    let correct = 0;
    let total = 0;
    zones.forEach(zone => {
        const accept = zone.dataset.accept;
        zone.querySelectorAll('.drag-item').forEach(item => {
            total++;
            if (item.dataset.type === accept) correct++;
        });
    });
    const feedback = interaction.querySelector('[data-feedback]');
    if (total > 0 && correct === total) {
        feedback.textContent = `ถูกต้องทั้งหมด (${correct}/${total})`;
        feedback.className = 'good';
    } else {
        feedback.textContent = `ถูก ${correct}/${total} ลองจัดกลุ่มใหม่อีกครั้ง`;
        feedback.className = 'bad';
    }
}

function resetDropzones(button) {
    const interaction = button.closest('.interaction');
    const source = interaction.querySelector('.drag-items');
    const feedback = interaction.querySelector('[data-feedback]');

    interaction.querySelectorAll('.dropzone .drag-item').forEach(item => {
        source.appendChild(item);
    });

    if (feedback) {
        feedback.textContent = '';
        feedback.className = '';
    }
}

function closeEnough(value, target, tolerance) {
    return Math.abs(Number(value) - target) <= tolerance;
}

function checkConversion() {
    const cmInch = document.getElementById('cmInch').value;
    const lbKg = document.getElementById('lbKg').value;
    const sMin = document.getElementById('sMin').value;
    let score = 0;
    if (closeEnough(cmInch, 4.72, 0.05)) score++;
    if (closeEnough(lbKg, 2.27, 0.05)) score++;
    if (closeEnough(sMin, 1.27, 0.05)) score++;
    const fb = document.getElementById('conversionFeedback');
    fb.textContent = `ได้ ${score}/3 คำตอบที่คาดหวัง: 12.0 cm = 4.72 inch, 5.00 pound = 2.27 kg, 76.0 s = 1.27 min`;
    fb.className = score === 3 ? 'good' : 'bad';
}

function checkSigCalc() {
    const input = document.getElementById('sigCalc').value.trim();
    const numeric = Number(input);
    const addInput = document.getElementById('sigCalcAdd').value.trim();
    const divInput = document.getElementById('sigCalcDiv').value.trim();
    const fb = document.getElementById('sigCalcFeedback');
    const answers = [
        Math.abs(numeric - 0.00057) < 0.000005 || input === '5.7e-4' || input === '5.7×10^-4',
        addInput === '30.1' || addInput === '30.1 cm',
        divInput === '6.0' || divInput === '6.0 m/s'
    ];
    const score = answers.filter(Boolean).length;
    if (score === answers.length) {
        fb.textContent = 'ถูกต้องทั้งหมด: 0.00057 หรือ 5.7×10⁻⁴, 30.1 cm และ 6.0 m/s';
        fb.className = 'good';
    } else {
        fb.textContent = `ถูก ${score}/${answers.length} ข้อ ทบทวนว่า คูณ/หารดูเลขนัยสำคัญ ส่วนบวก/ลบดูตำแหน่งทศนิยม`;
        fb.className = 'bad';
    }
}

function gradeFinalQuiz() {
    const answers = document.querySelectorAll('.final');
    let score = 0;
    answers.forEach(answer => {
        const value = answer.matches('select') ? answer.value : answer.dataset.value;
        if (value === answer.dataset.answer) score++;
        if (answer.classList.contains('final-options')) {
            answer.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('correct', 'wrong');
                if (btn.dataset.value === value) btn.classList.add(value === answer.dataset.answer ? 'correct' : 'wrong');
            });
        }
    });
    const fb = document.getElementById('finalScore');
    fb.textContent = `คะแนนรวม ${score}/${answers.length}`;
    fb.className = score === answers.length ? 'good' : 'bad';
}


// Shared math rendering helper
function renderMath(element = document.body) {
    if (!window.MathJax || !MathJax.typesetPromise) return;
    const targets = element ? [element] : [document.body];
    try {
        if (MathJax.typesetClear) MathJax.typesetClear(targets);
        MathJax.typesetPromise(targets).catch(() => {});
    } catch (error) {
        try { MathJax.typesetPromise(targets).catch(() => {}); } catch (_) {}
    }
}
