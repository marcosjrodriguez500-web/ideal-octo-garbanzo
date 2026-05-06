// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.clearAll = document.getElementById('clearAll');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');
        this.activeTasksSpan = document.getElementById('activeTasks');
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.render();
    }
    
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
        
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
        this.clearAll.addEventListener('click', () => this.clearAllTodos());
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            alert('Please enter a task!');
            return;
        }
        
        if (text.length > 200) {
            alert('Task is too long! Maximum 200 characters.');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };
        
        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.todoInput.focus();
        
        this.saveToLocalStorage();
        this.render();
    }
    
    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const newText = prompt('Edit task:', todo.text);
            if (newText !== null && newText.trim() !== '') {
                if (newText.length > 200) {
                    alert('Task is too long! Maximum 200 characters.');
                    return;
                }
                todo.text = newText.trim();
                this.saveToLocalStorage();
                this.render();
            }
        }
    }
    
    clearCompletedTodos() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }
        
        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    clearAllTodos() {
        if (this.todos.length === 0) {
            alert('No tasks to clear!');
            return;
        }
        
        if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveToLocalStorage();
            this.render();
        }
    }
    
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        
        this.totalTasksSpan.textContent = `Total: ${total}`;
        this.completedTasksSpan.textContent = `Completed: ${completed}`;
        this.activeTasksSpan.textContent = `Active: ${active}`;
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear list
        this.todoList.innerHTML = '';
        
        // Show/hide empty state
        if (this.todos.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
        
        // Render todos
        if (filteredTodos.length === 0 && this.currentFilter !== 'all') {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'todo-item';
            emptyMsg.innerHTML = `
                <p style="width: 100%; text-align: center; color: #999;">
                    ${this.currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!'}
                </p>
            `;
            this.todoList.appendChild(emptyMsg);
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="edit-btn" onclick="app.editTodo(${todo.id})">Edit</button>
                        <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                    </div>
                `;
                
                this.todoList.appendChild(li);
            });
        }
        
        this.updateStats();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading todos from localStorage:', e);
                this.todos = [];
            }
        }
    }
}

// Initialize the app
const app = new TodoApp();
