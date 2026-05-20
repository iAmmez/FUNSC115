const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderMath(element = document.body) {
    if (!window.MathJax?.typesetPromise) return;
    const targets = [element || document.body];

    try {
        MathJax.typesetClear?.(targets);
        MathJax.typesetPromise(targets).catch(() => {});
    } catch {
        MathJax.typesetPromise(targets).catch(() => {});
    }
}

function setFeedback(element, text, className = '') {
    if (!element) return;
    element.textContent = text;
    element.className = className;
}

function initProgressNav() {
    const progressBar = document.getElementById('progressBar');
    const navLinks = $$('.nav a');
    if (!progressBar || !navLinks.length) return;

    const navTargets = navLinks
        .map(link => link.getAttribute('href'))
        .filter(href => href?.startsWith('#'))
        .map(href => document.getElementById(href.slice(1)))
        .filter(Boolean);
    const targets = navTargets.length ? navTargets : $$('section.lesson');
    if (!targets.length) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight || 1;
        progressBar.style.width = `${Math.min(100, scrollTop / docHeight * 100)}%`;

        const current = targets.reduce(
            (active, target) => scrollTop >= target.offsetTop - 120 ? target.id : active,
            targets[0].id
        );
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
    });
}

function initPolls() {
    $$('[data-poll] .option-btn').forEach(button => {
        button.addEventListener('click', () => button.classList.toggle('correct'));
    });
}

function initSingleChoiceQuizzes() {
    $$('[data-quiz]').forEach(quiz => {
        $$('.option-btn', quiz).forEach(button => {
            button.addEventListener('click', () => {
                const feedback = quiz.nextElementSibling?.matches('[data-feedback]')
                    ? quiz.nextElementSibling
                    : quiz.parentElement.querySelector('[data-feedback]');

                $$('.option-btn', quiz).forEach(item => item.classList.remove('correct', 'wrong'));
                const isCorrect = button.dataset.choice === quiz.dataset.answer;
                button.classList.add(isCorrect ? 'correct' : 'wrong');
                setFeedback(feedback, isCorrect ? 'ถูกต้อง' : 'ยังไม่ถูก', isCorrect ? 'good' : 'bad');
            });
        });
    });
}

function initTextChecks() {
    $$('[data-text-check]').forEach(check => {
        const input = check.querySelector('input');
        const button = check.querySelector('button');
        const feedback = check.querySelector('[data-text-feedback]');
        if (!input || !button || !feedback) return;

        button.addEventListener('click', () => {
            const answer = input.value.trim().toLowerCase();
            const accepted = (check.dataset.accept || '')
                .split('|')
                .map(text => text.trim().toLowerCase())
                .filter(Boolean);
            const matched = accepted.some(key => answer.includes(key));
            setFeedback(feedback, matched ? 'ถูกต้อง' : 'ลองทบทวนคำสำคัญอีกครั้ง', matched ? 'good' : 'bad');
        });
    });
}

function initRevealBlocks() {
    $$('[data-reveal]').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.parentElement.querySelector('[data-reveal-answer]');
            if (!answer) return;

            answer.hidden = !answer.hidden;
            button.textContent = answer.hidden
                ? button.dataset.revealOpen || 'ดูแนวคำตอบ'
                : button.dataset.revealClose || 'ซ่อนแนวคำตอบ';
            if (!answer.hidden) renderMath(answer);
        });
    });
}

function initMultiChoice() {
    $$('[data-multi]').forEach(group => {
        $$('.option-btn', group).forEach(button => {
            button.addEventListener('click', () => {
                const stateClass = button.dataset.correct === 'true' ? 'correct' : 'wrong';
                button.classList.toggle(stateClass);

                const key = button.dataset.explanation;
                const explanation = key
                    ? group.closest('.interaction')?.querySelector(`[data-answer-explanation="${key}"]`)
                    : null;
                if (explanation) explanation.hidden = !button.classList.contains(stateClass);
            });
        });
    });
}

function initFinalOptionGroups() {
    $$('.final-options').forEach(group => {
        $$('.option-btn', group).forEach(button => {
            button.addEventListener('click', () => {
                $$('.option-btn', group).forEach(item => item.classList.remove('selected', 'correct', 'wrong'));
                button.classList.add('selected');
                group.dataset.value = button.dataset.value;
            });
        });
    });
}

let draggedItem = null;

function initDragAndDrop() {
    document.addEventListener('dragstart', event => {
        draggedItem = event.target.classList.contains('drag-item') ? event.target : null;
    });

    $$('.dropzone').forEach(zone => {
        zone.addEventListener('dragover', event => {
            event.preventDefault();
            zone.classList.add('over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('over'));
        zone.addEventListener('drop', event => {
            event.preventDefault();
            zone.classList.remove('over');
            if (draggedItem) zone.appendChild(draggedItem);
        });
    });
}

function checkDropzones(button) {
    const interaction = button.closest('.interaction');
    const zones = $$('.dropzone', interaction);
    const feedback = interaction.querySelector('[data-feedback]');
    let correct = 0;
    let total = 0;

    zones.forEach(zone => {
        $$('.drag-item', zone).forEach(item => {
            total += 1;
            if (item.dataset.type === zone.dataset.accept) correct += 1;
        });
    });

    const passed = total > 0 && correct === total;
    setFeedback(
        feedback,
        passed ? `ถูกต้องทั้งหมด (${correct}/${total})` : `ถูก ${correct}/${total} ลองจัดกลุ่มใหม่อีกครั้ง`,
        passed ? 'good' : 'bad'
    );
}

function resetDropzones(button) {
    const interaction = button.closest('.interaction');
    const source = interaction.querySelector('.drag-items');
    const feedback = interaction.querySelector('[data-feedback]');

    $$('.dropzone .drag-item', interaction).forEach(item => source.appendChild(item));
    setFeedback(feedback, '');
}

function closeEnough(value, target, tolerance) {
    return Math.abs(Number(value) - target) <= tolerance;
}

function gradeFinalQuiz() {
    const answers = $$('.final');
    let score = 0;

    answers.forEach(answer => {
        const value = answer.matches('select') ? answer.value : answer.dataset.value;
        const isCorrect = value === answer.dataset.answer;
        if (isCorrect) score += 1;

        if (answer.classList.contains('final-options')) {
            $$('.option-btn', answer).forEach(button => {
                button.classList.remove('correct', 'wrong');
                if (button.dataset.value === value) button.classList.add(isCorrect ? 'correct' : 'wrong');
            });
        }
    });

    const feedback = document.getElementById('finalScore');
    setFeedback(feedback, `คะแนนรวม ${score}/${answers.length}`, score === answers.length ? 'good' : 'bad');
}

document.addEventListener('DOMContentLoaded', () => {
    initProgressNav();
    initPolls();
    initSingleChoiceQuizzes();
    initTextChecks();
    initRevealBlocks();
    initMultiChoice();
    initFinalOptionGroups();
    initDragAndDrop();
});
