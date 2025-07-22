// --- State ---
let user = null;
let workouts = [];
let currentWorkout = null;

const API_BASE = 'http://localhost:8000';

// --- DOM Elements ---
const main = document.getElementById('main-content');
const navLogin = document.getElementById('nav-login');
const navRegister = document.getElementById('nav-register');
const navWorkouts = document.getElementById('nav-workouts');
const navLogout = document.getElementById('nav-logout');

// --- Navigation ---
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

function renderRoute() {
    const hash = window.location.hash || '#login';
    if (!user && hash !== '#register') {
        renderLogin();
        return;
    }
    switch (hash) {
        case '#login': renderLogin(); break;
        case '#register': renderRegister(); break;
        case '#workouts': renderWorkouts(); break;
        case '#logout': handleLogout(); break;
        default: renderLogin(); break;
    }
}

function setNav() {
    if (user) {
        navLogin.style.display = 'none';
        navRegister.style.display = 'none';
        navWorkouts.style.display = '';
        navLogout.style.display = '';
    } else {
        navLogin.style.display = '';
        navRegister.style.display = '';
        navWorkouts.style.display = 'none';
        navLogout.style.display = 'none';
    }
}

// --- Auth ---
function renderLogin() {
    setNav();
    main.innerHTML = `
        <h2>Login</h2>
        <form id="login-form">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="#register">Register here</a></p>
    `;
    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = await fetch(`${API_BASE}/authentication/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                username: fd.get('username'),
                password: fd.get('password')
            })
        });
        if (res.ok) {
            user = { username: fd.get('username') };
            window.location.hash = '#workouts';
        } else {
            alert('Login failed!');
        }
    };
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
}
  

function renderRegister() {
    setNav();
    main.innerHTML = `
        <h2>Register</h2>
        <form id="register-form">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="text" name="phone" placeholder="Phone (09XXXXXXXXX)" required />
            <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="#login">Login here</a></p>
    `;
    document.getElementById('register-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = await fetch(`${API_BASE}/authentication/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                username: fd.get('username'),
                password: fd.get('password'),
                phone: fd.get('phone')
            })
        });
        if (res.ok) {
            alert('Registration successful! Please login.');
            window.location.hash = '#login';
        } else {
            const data = await res.json();
            alert('Registration failed! ' + (data.errors ? JSON.stringify(data.errors) : ''));
        }
    };
}

async function handleLogout() {
    await fetch(`${API_BASE}/authentication/logout/`, { method: 'POST', credentials: 'include' });
    user = null;
    window.location.hash = '#login';
}

// --- Workouts ---
async function renderWorkouts() {
    setNav();
    main.innerHTML = '<h2>Your Workouts</h2><div class="workout-list" id="workout-list"></div><button id="add-workout">+ Add Workout</button><button id="ai-feedback" style="margin-top:1rem;">Get AI Feedback</button>';
    document.getElementById('add-workout').onclick = () => showWorkoutModal();
    document.getElementById('ai-feedback').onclick = () => showAIFeedback();
    const res = await fetch(`${API_BASE}/workout/`, { method: 'GET', credentials: 'include' });
    if (res.ok) {
        const data = await res.json();
        workouts = data.Workouts;
        renderWorkoutList();
    } else {
        main.innerHTML += '<p>Could not load workouts.</p>';
    }
}

function renderWorkoutList() {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    workouts.forEach(w => {
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.innerHTML = `
            <strong>${w.name_english || ''}</strong> <span style="color:#6366f1;">${w.name_persian || ''}</span><br>
            <span>Score: ${w.score || '-'}</span><br>
            <span>Last Weight: ${w.last_weight || '-'}</span>
        `;
        card.onclick = () => showWorkoutDetail(w);
        list.appendChild(card);
    });
}

function showWorkoutDetail(w) {
    currentWorkout = w;
    showModal(`
        <h3>${w.name_english || ''} <span style="color:#6366f1;">${w.name_persian || ''}</span></h3>
        <p><b>Score:</b> ${w.score || '-'}</p>
        <p><b>User Tips:</b> ${w.user_tips || '-'}</p>
        <p><b>Sets:</b> ${formatSets(w.sets)}</p>
        <p><b>Last Weight:</b> ${w.last_weight || '-'}</p>
        <button id="edit-workout">Edit</button>
        <button id="ai-howto">AI: How to do?</button>
        <button id="close-modal">Close</button>
    `);
    document.getElementById('edit-workout').onclick = () => showWorkoutModal(w);
    document.getElementById('ai-howto').onclick = () => showAIHowTo(w);
    document.getElementById('close-modal').onclick = closeModal;
}

function formatSets(sets) {
    if (!sets || sets.length === 0) return '-';
    return sets.map((s, i) => {
        if (typeof s === 'object') {
            return `Set ${i+1}: ` + Object.entries(s).map(([k,v]) => `${k}: ${v}`).join(', ');
        } else {
            return `Set ${i+1}: ${s}`;
        }
    }).join('<br>');
}

function showWorkoutModal(w = null) {
    showModal(`
        <h3>${w ? 'Edit Workout' : 'Add Workout'}</h3>
        <form id="workout-form">
            <input type="text" name="name_english" placeholder="English Name" value="${w?.name_english || ''}" required />
            <input type="text" name="name_persian" placeholder="Persian Name" value="${w?.name_persian || ''}" />
            <input type="number" name="score" placeholder="Score (1-5)" min="1" max="5" value="${w?.score || ''}" />
            <textarea name="user_tips" placeholder="User Tips">${w?.user_tips || ''}</textarea>
            <input type="text" name="sets" placeholder='Sets (e.g. [{"reps":10,"weight":50}])' value='${w?.sets ? JSON.stringify(w.sets) : ''}' />
            <input type="number" name="last_weight" placeholder="Last Weight" value="${w?.last_weight || ''}" />
            <button type="submit">${w ? 'Update' : 'Add'}</button>
            <button type="button" id="close-modal">Cancel</button>
        </form>
    `);
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('workout-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        let sets = [];
        try { sets = JSON.parse(fd.get('sets') || '[]'); } catch { alert('Invalid sets format!'); return; }
        const payload = {
            name_english: fd.get('name_english'),
            name_persian: fd.get('name_persian'),
            score: fd.get('score') ? parseInt(fd.get('score')) : null,
            user_tips: fd.get('user_tips'),
            sets: sets,
            last_weight: fd.get('last_weight') ? parseFloat(fd.get('last_weight')) : null
        };
        const method = w ? 'PUT' : 'POST';
        const url = w ? `${API_BASE}/workout/${w.id}/` : `${API_BASE}/workout/`;
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            closeModal();
            renderWorkouts();
        } else {
            alert('Failed to save workout!');
        }
    };
}

function showModal(html) {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content">${html}</div>`;
    document.body.appendChild(modal);
}
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// --- AI Features ---
async function showAIHowTo(w) {
    showModal('<p>Loading AI instructions...</p>');
    const res = await fetch(`${API_BASE}/workout/ask/${w.id}`, { credentials: 'include' });
    if (res.ok) {
        const data = await res.json();
        showModal(`<h3>AI: How to do ${w.name_english}</h3><p>${data.message}</p><button id="close-modal">Close</button>`);
        document.getElementById('close-modal').onclick = closeModal;
    } else {
        showModal('<p>Failed to get AI instructions.</p><button id="close-modal">Close</button>');
        document.getElementById('close-modal').onclick = closeModal;
    }
}

async function showAIFeedback() {
    showModal('<p>Loading AI feedback...</p>');
    // There is no direct endpoint for overall feedback, so show a message
    showModal('<p>AI feedback feature is not implemented in the backend API.</p><button id="close-modal">Close</button>');
    document.getElementById('close-modal').onclick = closeModal;
} 