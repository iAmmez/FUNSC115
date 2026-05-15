function checkConversion() {
  const cmInch = document.getElementById('cmInch').value;
  const lbKg = document.getElementById('lbKg').value;
  const sMin = document.getElementById('sMin').value;
  let score = 0;

  if (closeEnough(cmInch, 4.72, 0.05)) score++;
  if (closeEnough(lbKg, 2.27, 0.05)) score++;
  if (closeEnough(sMin, 1.27, 0.05)) score++;

  const fb = document.getElementById('conversionFeedback');
  fb.textContent = `Score ${score}/3. Expected answers: 12.0 cm = 4.72 inch, 5.00 pound = 2.27 kg, 76.0 s = 1.27 min`;
  fb.className = score === 3 ? 'good' : 'bad';
}

function checkSigCalc() {
  const input = document.getElementById('sigCalc').value.trim();
  const addInput = document.getElementById('sigCalcAdd').value.trim();
  const divInput = document.getElementById('sigCalcDiv').value.trim();
  const answers = [
    Math.abs(Number(input) - 0.00057) < 0.000005 || input === '5.7e-4' || input === '5.7x10^-4',
    addInput === '30.1' || addInput === '30.1 cm',
    divInput === '6.0' || divInput === '6.0 m/s'
  ];
  const score = answers.filter(Boolean).length;
  const fb = document.getElementById('sigCalcFeedback');

  if (score === answers.length) {
    fb.textContent = 'Correct: 0.00057 or 5.7x10^-4, 30.1 cm, and 6.0 m/s';
    fb.className = 'good';
  } else {
    fb.textContent = `Score ${score}/${answers.length}. Review significant figures and decimal places.`;
    fb.className = 'bad';
  }
}
