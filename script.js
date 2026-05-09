// Elementi del DOM
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');

// Variabili
let tasks = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todoTasks';

// Carica i task dal localStorage
function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        tasks = JSON.parse(saved);
    }
    renderTasks();
}

// Salva i task nel localStorage
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Aggiungi un nuovo task
function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        alert('Per favore, scrivi un\'attività!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString('it-IT')
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
}

// Elimina un task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Marca un task come completato
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Filtra i task
function filterTasks() {
    switch(currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// Renderizza i task
function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = filterTasks();

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><p>Nessuna attività trovata 😴</p></div>';
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Elimina</button>
            `;
            taskList.appendChild(li);
        });
    }

    updateStats();
}

// Aggiorna le statistiche
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    
    totalTasksSpan.textContent = total;
    completedTasksSpan.textContent = completed;
}

// Pulisci i task completati
function clearCompleted() {
    if (tasks.filter(t => t.completed).length === 0) {
        alert('Nessun task completato da eliminare!');
        return;
    }
    
    if (confirm('Sei sicuro di voler eliminare tutti i task completati?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
}

// Funzione per evitare XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

clearBtn.addEventListener('click', clearCompleted);

// Carica i task all'avvio
loadTasks();