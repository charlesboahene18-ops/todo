// ── State ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'doit_tasks_v1';

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks(); // [{ id, text, done }]

//DOM REF
const input     = document.getElementById('task-input');
const addBtn    = document.getElementById('add-btn');
const list      = document.getElementById('list');
const empty     = document.getElementById('empty');
const toast     = document.getElementById('toast');
const stats     = document.getElementById('stats');
const statTotal = document.getElementById('stat-total');
const statDone  = document.getElementById('stat-done');
const statLeft  = document.getElementById('stat-left');

//HELPERS
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function normalize(str) {
  return str.trim().toLowerCase();
}

let toastTimer = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

//RENDER
function render() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const left  = total - done;

  if (total === 0) {
    stats.style.display = 'none';
    empty.classList.add('visible');
  } else {
    stats.style.display = 'flex';
    empty.classList.remove('visible');
    statTotal.textContent = total;
    statDone.textContent  = done;
    statLeft.textContent  = left;
  }

  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    //CHECKBOX
    const check = document.createElement('span');
    check.className = 'check';
    check.setAttribute('aria-hidden', 'true');

    const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    checkIcon.setAttribute('class', 'check-icon');
    checkIcon.setAttribute('viewBox', '0 0 10 10');
    checkIcon.setAttribute('fill', 'none');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M1.5 5L4 7.5L8.5 2.5');
    path.setAttribute('stroke', '#0e0e0e');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    checkIcon.appendChild(path);
    check.appendChild(checkIcon);

    //TEXT
    const span = document.createElement('span');
    span.className = 'item-text';
    span.textContent = task.text;

    //DELETE BTN
    const del = document.createElement('button');
    del.className = 'btn-delete';
    del.title = 'Delete task';
    del.setAttribute('aria-label', 'Delete task');
    del.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;

    li.appendChild(check);
    li.appendChild(span);
    li.appendChild(del);

    li.addEventListener('click', (e) => {
      if (del.contains(e.target)) return;
      toggleDone(task.id);
    });

    del.addEventListener('click', (e) => {
      e.stopPropagation();
      removeTask(task.id, li);
    });

    list.appendChild(li);
  });
}

//ACTIONS
function addTask() {
  const text = input.value.trim();

  if (!text) {
    triggerShake();
    showToast('Task cannot be empty.');
    input.focus();
    return;
  }

  const isDuplicate = tasks.some(t => normalize(t.text) === normalize(text));
  if (isDuplicate) {
    triggerShake();
    showToast('That task already exists!');
    input.select();
    return;
  }

  tasks.unshift({ id: genId(), text, done: false });
  saveTasks(tasks);
  input.value = '';
  render();
  input.focus();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks(tasks);
  render();
}

function removeTask(id, liEl) {
  liEl.classList.add('removing');
  liEl.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    render();
  }, { once: true });
}

function triggerShake() {
  input.classList.add('shake');
  input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
}

//EVENT LIST
addBtn.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

//INIT
render();
input.focus();
