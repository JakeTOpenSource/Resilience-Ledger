/* Five reported answers, not an assessment of actual arrangements.
 * No network, storage, scoring, or automatic verification. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.HandoverCheckV1 = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => api.init(document), { once: true });
    else api.init(document);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const EXAMPLE = Object.freeze({
    task: 'Send Friday invoices',
    owner: 'Sam',
    backup: '',
    instructions: 'Shared drive > Invoices > Friday checklist',
    tried: 'no',
  });
  const FIELDS = [
    ['task', 'Task'], ['owner', 'Usual owner'], ['backup', 'Backup named as authorized'],
    ['instructions', 'Instruction location'], ['tried', 'Has the backup tried it?'],
  ];
  const TRIED = { yes: 'You reported yes — not verified', no: 'Not tried, according to your answer — not verified', unsure: 'You reported not sure — not verified' };
  function plain(value) { return typeof value === 'string' ? value.trim() : ''; }

  function buildReview(input) {
    input = input || {};
    const answers = {};
    FIELDS.forEach(([key]) => { answers[key] = plain(input[key]); });
    if (!Object.prototype.hasOwnProperty.call(TRIED, answers.tried)) answers.tried = '';
    const rows = FIELDS.map(([key, label]) => ({
      key, label, provided: Boolean(answers[key]),
      value: answers[key] ? (key === 'tried' ? TRIED[answers[key]] : answers[key]) : 'not provided',
    }));
    const questions = [];
    const task = answers.task ? '“' + answers.task + '”' : 'this task';
    const owner = answers.owner || 'the usual owner';
    const backup = answers.backup || 'the backup';
    if (!answers.task) questions.push('What task needs to be done while the usual person is away?');
    if (!answers.owner) questions.push('Who normally does this task?');
    if (!answers.backup) questions.push('Who could cover ' + task + ', and who can confirm that person is allowed to do it?');
    else questions.push('Has ' + backup + ' agreed to cover ' + task + '? Who can confirm their permission and access?');
    if (!answers.instructions) questions.push('Where can ' + backup + ' find the instructions, and can they open them?');
    else questions.push('Can ' + backup + ' open “' + answers.instructions + '” and follow the steps without relying on ' + owner + '?');
    if (answers.tried === 'yes') {
      questions.push('When did ' + backup + ' last try ' + task + ', what was completed, and where is the result recorded? A yes answer alone is not proof.');
    } else if (answers.tried === 'no') {
      questions.push('Once an authorized backup is named, when could they safely try ' + task + '? Record what they completed and where they needed help.');
    } else if (answers.tried === 'unsure') {
      questions.push('Ask ' + owner + ' whether the backup has tried ' + task + ', and what record of that attempt is available.');
    } else {
      questions.push('Has the backup actually tried ' + task + ', rather than only read about it?');
    }
    return { rows, questions, missing: rows.filter(row => !row.provided).length, verification: 'not verified' };
  }

  function renderReview(doc, container, review) {
    container.replaceChildren();
    function add(tag, text, parent) {
      const node = doc.createElement(tag);
      node.textContent = text;
      (parent || container).appendChild(node);
      return node;
    }
    const heading = add('h2', 'Your handover check');
    heading.id = 'handover-result-title';
    add('p', review.missing + ' of 5 answers not provided. Arrangements: ' + review.verification + '.');
    add('h3', 'What to ask next');
    const questions = doc.createElement('ol');
    container.appendChild(questions);
    review.questions.forEach(question => add('li', question, questions));
    const details = doc.createElement('details');
    container.appendChild(details);
    add('summary', 'Review your five answers', details);
    const list = doc.createElement('dl');
    list.className = 'handover-answers';
    details.appendChild(list);
    review.rows.forEach(row => {
      const pair = doc.createElement('div');
      list.appendChild(pair);
      add('dt', row.label, pair);
      add('dd', row.value, pair);
    });
    add('p', 'Based on your answers only. Names, instructions and a reported trial do not establish permission, access or a successful handover.');
    container.hidden = false;
  }

  function init(doc) {
    const container = doc.getElementById('handover-results');
    const status = doc.getElementById('handover-status');
    const run = doc.getElementById('handover-run');
    const example = doc.getElementById('handover-example');
    const clear = doc.getElementById('handover-clear');
    const controls = {};
    FIELDS.forEach(([key]) => { controls[key] = doc.getElementById('handover-' + key); });
    if (!container || !status || !run || !example || !clear || Object.values(controls).some(control => !control)) return;
    function show() {
      const input = {};
      FIELDS.forEach(([key]) => { input[key] = controls[key].value; });
      const review = buildReview(input);
      renderReview(doc, container, review);
      status.textContent = 'Check ready. ' + review.missing + ' of 5 answers not provided. Arrangements are not verified.';
      container.focus();
      if (container.scrollIntoView) container.scrollIntoView({ block: 'start' });
    }
    run.addEventListener('click', show);
    example.addEventListener('click', () => {
      FIELDS.forEach(([key]) => { controls[key].value = EXAMPLE[key]; });
      show();
    });
    clear.addEventListener('click', () => {
      FIELDS.forEach(([key]) => { controls[key].value = ''; });
      container.replaceChildren();
      container.hidden = true;
      status.textContent = 'Answers cleared.';
      controls.task.focus();
    });
  }
  return { buildReview, renderReview, init, EXAMPLE };
});
