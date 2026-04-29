const progressBar = document.getElementById('progressBar');
    const navLinks = [...document.querySelectorAll('.nav a')];
    const sections = [...document.querySelectorAll('section.lesson')];

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = `${Math.min(100, (scrollTop / docHeight) * 100)}%`;

      let current = sections[0].id;
      sections.forEach(section => {
        if (scrollTop >= section.offsetTop - 120) current = section.id;
      });
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
    });

    function showRoadmap(text) {
      document.getElementById('roadmapText').textContent = text;
    }

    function explainPhenomena(type) {
      const text = {
        law: 'กฎฟิสิกส์คือความสัมพันธ์ทางคณิตศาสตร์ เช่น กฎการเคลื่อนที่หรือกฎของนิวตัน',
        rep: 'การนำเสนอช่วยให้เราเข้าใจปัญหา เช่น วาดภาพ กราฟ ตาราง หรือเขียนสมการ',
        measure: 'การวัดคือการใช้เครื่องมือหรือการทดลองเพื่อหาค่าปริมาณ เช่น วัดเวลา ความยาว หรือมวล'
      };
      document.getElementById('phenomenaText').textContent = text[type];
    }

    document.querySelectorAll('[data-poll] .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('correct');
      });
    });

    document.querySelectorAll('[data-quiz]').forEach(quiz => {
      quiz.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const answer = quiz.dataset.answer;
          const feedback = quiz.parentElement.querySelector('[data-feedback]');
          quiz.querySelectorAll('.option-btn').forEach(b => b.classList.remove('correct', 'wrong'));
          if (btn.dataset.choice === answer) {
            btn.classList.add('correct');
            feedback.textContent = 'ถูกต้อง';
            feedback.className = 'good';
          } else {
            btn.classList.add('wrong');
            feedback.textContent = 'ยังไม่ถูก ลองให้นักศึกษาอธิบายเหตุผลก่อนเฉลย';
            feedback.className = 'bad';
          }
        });
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
      fb.textContent = `ได้ ${score}/3 คำตอบที่คาดหวัง: 12 cm ≈ 4.72 inch, 5.0 pound ≈ 2.27 kg, 76 s ≈ 1.27 min`;
      fb.className = score === 3 ? 'good' : 'bad';
    }

    function checkSigCalc() {
      const input = document.getElementById('sigCalc').value.trim();
      const numeric = Number(input);
      const fb = document.getElementById('sigCalcFeedback');
      if (Math.abs(numeric - 0.00057) < 0.000005 || input === '5.7e-4' || input === '5.7×10^-4') {
        fb.textContent = 'ถูกต้อง: คำตอบควรมีเลขนัยสำคัญ 2 ตัว คือ 0.00057 หรือ 5.7×10⁻⁴';
        fb.className = 'good';
      } else {
        fb.textContent = 'ยังไม่ถูก คำนวณได้ 0.0005668 แล้วปัดตามเลขนัยสำคัญน้อยที่สุด';
        fb.className = 'bad';
      }
    }

    function gradeFinalQuiz() {
      const answers = document.querySelectorAll('.final');
      let score = 0;
      answers.forEach(sel => {
        if (sel.value === sel.dataset.answer) score++;
      });
      const fb = document.getElementById('finalScore');
      fb.textContent = `คะแนนรวม ${score}/${answers.length}`;
      fb.className = score === answers.length ? 'good' : 'bad';
    }