let currentUser = null;
let tasks = [];
let calendar = null;

// Initialize Dashboard and Subscriptions
async function initApp(user) {
    currentUser = user;
    loadUserAvatar(user);
    await fetchTasks();
    initCalendar();

    // Set up real-time subscription
    supabaseClient
        .channel('public:tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, async payload => {
            await fetchTasks();
            if (calendar) refreshCalendar();
        })
        .subscribe();
}

// Tab Switching Logic
function switchTab(tab) {
    const tasksView = document.getElementById('tasks-view');
    const calendarView = document.getElementById('calendar-view');
    const tasksBtn = document.getElementById('tab-tasks');
    const calendarBtn = document.getElementById('tab-calendar');

    if (tab === 'tasks') {
        tasksView.style.display = 'block';
        calendarView.style.display = 'none';
        tasksBtn.classList.add('active');
        calendarBtn.classList.remove('active');
    } else {
        tasksView.style.display = 'none';
        calendarView.style.display = 'block';
        tasksBtn.classList.remove('active');
        calendarBtn.classList.add('active');
        // Render calendar when visible
        setTimeout(() => {
            calendar.render();
            refreshCalendar();
        }, 100);
    }
}

// Calendar Initialization
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        locale: 'es',
        events: []
    });
}

function refreshCalendar() {
    if (!calendar) return;
    calendar.removeAllEvents();
    const calendarEvents = tasks.map(t => ({
        title: t.title,
        start: t.due_date || t.created_at,
        backgroundColor: t.completed ? '#10b981' : '#6366f1',
        allDay: true
    }));
    calendar.addEventSource(calendarEvents);
}

// Load Tasks
async function fetchTasks() {
    const { data, error } = await supabaseClient
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
    } else {
        tasks = data;
        renderTasks();
        updateStats();
        if (calendar && document.getElementById('calendar-view').style.display === 'block') {
            refreshCalendar();
        }
    }
}

// Add Task
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const dueDate = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;

    const { error } = await supabaseClient
        .from('tasks')
        .insert([{
            title,
            description,
            due_date: dueDate || null,
            priority: priority,
            user_id: currentUser.id,
            completed: false
        }]);

    if (error) {
        showToast('Error al crear tarea: ' + error.message, 'error');
    } else {
        showToast('¡Tarea creada con éxito!', 'success');
        e.target.reset();
        document.getElementById('task-priority').value = 'Media';
    }
});

// Toggle Complete
async function toggleTask(id, completed) {
    const { error } = await supabaseClient
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', id);

    if (error) {
        showToast('Error al actualizar', 'error');
    } else {
        showToast(!completed ? '¡Tarea completada!' : 'Tarea pendiente', 'info');
    }
}

// Delete Task
async function deleteTask(id) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) alert('Error al eliminar tarea: ' + error.message);
    }
}

// Render UI
function renderTasks() {
    const listElement = document.getElementById('task-list');
    const filter = document.getElementById('task-filter').value;
    const search = document.getElementById('task-search').value.toLowerCase();

    let filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search) || (t.description && t.description.toLowerCase().includes(search));
        if (filter === 'all') return matchesSearch;
        if (filter === 'pending') return matchesSearch && !t.completed;
        if (filter === 'completed') return matchesSearch && t.completed;
        return matchesSearch;
    });

    listElement.innerHTML = filteredTasks.map(t => `
        <div class="task-item glass-morphism ${t.completed ? 'completed' : ''}" style="${t.completed ? 'opacity: 0.6;' : ''}">
            <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask('${t.id}', ${t.completed})">
            <div class="task-content">
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.4rem;">
                    <span class="priority-tag prio-${(t.priority || 'Baja').toLowerCase()}">${t.priority || 'Baja'}</span>
                    <div class="task-title" style="${t.completed ? 'text-decoration: line-through;' : ''}">${t.title}</div>
                </div>
                <div class="task-desc">
                    ${t.due_date ? `<i class="fa-regular fa-calendar-check"></i> ${t.due_date} | ` : ''}
                    ${t.description || ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="editTaskPrompt('${t.id}', '${t.title}', '${t.description}', '${t.due_date}', '${t.priority}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteTask('${t.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Edit Prompt
async function editTaskPrompt(id, oldTitle, oldDesc, oldDate, oldPrio) {
    const newTitle = prompt('Editar título:', oldTitle);
    if (newTitle === null) return;
    const newDesc = prompt('Editar descripción:', oldDesc === 'undefined' ? '' : oldDesc);
    const newDate = prompt('Editar fecha (AAAA-MM-DD):', oldDate === 'undefined' || !oldDate ? '' : oldDate);
    const newPrio = prompt('Escoge prioridad (Baja, Media, Alta):', oldPrio === 'undefined' ? 'Media' : oldPrio);

    const { error } = await supabaseClient
        .from('tasks')
        .update({
            title: newTitle,
            description: newDesc,
            due_date: newDate || null,
            priority: newPrio || 'Baja'
        })
        .eq('id', id);

    if (error) {
        showToast('Error al editar', 'error');
    } else {
        showToast('Tarea actualizada', 'success');
    }
}

// Stats & Progress
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('stats-total').textContent = total;
    document.getElementById('stats-pending').textContent = pending;
    document.getElementById('stats-completed').textContent = completed;

    // Update Progress Bar
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const fill = document.getElementById('progress-fill');
    const percentLabel = document.getElementById('progress-percent');

    if (fill) fill.style.width = percent + '%';
    if (percentLabel) percentLabel.textContent = percent + '%';
}

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass-morphism`;

    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Avatar Management
function openAvatarModal() {
    document.getElementById('avatar-modal').style.display = 'flex';
}

function closeAvatarModal() {
    document.getElementById('avatar-modal').style.display = 'none';
}

async function selectAvatar(iconName) {
    const avatarEl = document.getElementById('user-avatar');
    avatarEl.innerHTML = `<i class="fa-solid fa-${iconName}"></i>`;

    // Save to Supabase User Metadata
    const { error } = await supabaseClient.auth.updateUser({
        data: { avatar: iconName }
    });

    if (error) {
        showToast('Error al guardar avatar', 'error');
    } else {
        showToast('Avatar actualizado', 'success');
        closeAvatarModal();
    }
}

function loadUserAvatar(user) {
    const avatarIcon = user.user_metadata?.avatar || 'user';
    document.getElementById('user-avatar').innerHTML = `<i class="fa-solid fa-${avatarIcon}"></i>`;
}

// Theme Management
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('remindify-theme', isLight ? 'light' : 'dark');
    updateThemeIcon(isLight);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('remindify-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isLight) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

// Search and Filter Listeners
document.getElementById('task-search').addEventListener('input', renderTasks);
document.getElementById('task-filter').addEventListener('change', renderTasks);

// Load startup
loadTheme();
