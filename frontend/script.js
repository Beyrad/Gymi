// --- State ---
let user = null;
let workouts = [];
let currentWorkout = null;
let csrfToken = null;

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

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function renderRoute() {

    fetch('http://localhost:8000/authentication/csrf-init/', {
        method: 'GET',
        credentials: 'include'
    }).then(() => {
        csrfToken = getCookie('csrftoken');
    });

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
        <h2 class="main-heading">Login</h2>
        <form id="login-form" class="p-3 rounded bg-dark-subtle shadow-sm">
            <div class="mb-3">
                <label for="login-username" class="form-label">Username</label>
                <input type="text" id="login-username" name="username" class="form-control" placeholder="Username" required />
            </div>
            <div class="mb-3">
                <label for="login-password" class="form-label">Password</label>
                <input type="password" id="login-password" name="password" class="form-control" placeholder="Password" required />
            </div>
            <button type="submit" class="btn btn-primary w-100 my-2">Login</button>
        </form>
        <p class="text-center">Don't have an account? <a href="#register">Register here</a></p>
    `;
    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = await fetch(`${API_BASE}/authentication/login/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
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

function renderRegister() {
    setNav();
    main.innerHTML = `
        <h2 class="main-heading">Register</h2>
        <form id="register-form" class="p-3 rounded bg-dark-subtle shadow-sm">
            <div class="mb-3">
                <label for="register-username" class="form-label">Username</label>
                <input type="text" id="register-username" name="username" class="form-control" placeholder="Username" required />
            </div>
            <div class="mb-3">
                <label for="register-password" class="form-label">Password</label>
                <input type="password" id="register-password" name="password" class="form-control" placeholder="Password" required />
            </div>
            <div class="mb-3">
                <label for="register-phone" class="form-label">Phone</label>
                <input type="text" id="register-phone" name="phone" class="form-control" placeholder="Phone (09XXXXXXXXX)" required />
            </div>
            <button type="submit" class="btn btn-primary w-100 my-2">Register</button>
        </form>
        <p class="text-center">Already have an account? <a href="#login">Login here</a></p>
    `;
    document.getElementById('register-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = await fetch(`${API_BASE}/authentication/register/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
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
    await fetch(`${API_BASE}/authentication/logout/`, { method: 'POST', headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    }, credentials: 'include' });
    user = null;
    window.location.hash = '#login';
}

// --- Workouts ---
async function renderWorkouts() {
    setNav();
    main.innerHTML = `
        <h2 class="main-heading">Your Workouts</h2>
        <div class="workout-list" id="workout-list"></div>
        <div class="d-flex flex-column flex-md-row gap-2 mt-3">
            <button id="add-workout" class="btn btn-success flex-fill animate__animated animate__pulse">+ Add Workout</button>
            <button id="ai-feedback" class="btn btn-info flex-fill animate__animated animate__pulse">Get AI Feedback</button>
        </div>
    `;
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
        card.className = 'workout-card card bg-dark text-white mb-4 shadow';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title mb-2 text-info">${w.name_english || ''} <span class="text-info">${w.name_persian || ''}</span></h5>
                <div class="mb-1"><b>Score:</b> ${w.score || '-'}</div>
                <div class="mb-1"><b>Last Weight:</b> ${w.last_weight || '-'}</div>
            </div>
        `;
        card.onclick = () => showWorkoutDetail(w);
        list.appendChild(card);
    });
}

function showWorkoutDetail(w) {
    currentWorkout = w;
    showModal(`
        <div class="modal-header bg-dark text-white">
          <h3 class="text-info">${w.name_english || ''} <span class="text-info">${w.name_persian || ''}</span></h3>
        </div>
        <div class="modal-body bg-dark text-white">
          <div class="mb-3"><b>Score:</b> <span>${w.score || '-'}</span></div>
          <div class="mb-3"><b>User Tips:</b> <span>${w.user_tips || '-'}</span></div>
          <div class="mb-3"><b>Sets:</b> <span>${formatSets(w.sets)}</span></div>
          <div class="mb-3"><b>Last Weight:</b> <span>${w.last_weight || '-'}</span></div>
        </div>
        <div class="modal-footer bg-dark">
          <button id="edit-workout" class="btn btn-primary w-100 my-2">Edit</button>
          <button id="ai-howto" class="btn btn-info w-100 my-2">AI: How to do?</button>
          <button id="close-modal" class="btn btn-secondary w-100 my-2">Close</button>
        </div>
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
    // Always start with a valid array for setsArr
    let setsArr = (w && Array.isArray(w.sets) && w.sets.every(x => typeof x === 'number')) ? [...w.sets] : [];

    function renderSetsInputs() {
        return `
            <div id="sets-container">
                ${setsArr.map((val, idx) => `
                    <div class="set-row d-flex align-items-center mb-2">
                        <input type="number" class="set-input form-control me-2" value="${val !== '' ? val : ''}" min="1" style="width:100px;" data-idx="${idx}" />
                        <button type="button" class="delete-set btn btn-danger btn-sm ms-2" data-idx="${idx}">&minus;</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" id="add-set" class="btn btn-success btn-sm mt-2 w-100">+ Add Set</button>
        `;
    }

    function updateSetsUI() {
        const setsArea = document.getElementById('sets-dynamic-area');
        if (setsArea) {
            setsArea.innerHTML = renderSetsInputs();
            attachSetsHandlers();
        }
    }

    function attachSetsHandlers() {
        // Add Set button
        const addSetBtn = document.getElementById('add-set');
        if (addSetBtn) {
            addSetBtn.onclick = (e) => {
                e.preventDefault();
                setsArr.push(1); // Default to 1
                updateSetsUI();
            };
        }
        // Delete Set buttons
        document.querySelectorAll('.delete-set').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const idx = parseInt(btn.getAttribute('data-idx'));
                setsArr.splice(idx, 1);
                updateSetsUI();
            };
        });
        // Update value on input change
        document.querySelectorAll('.set-input').forEach(input => {
            input.oninput = (e) => {
                const idx = parseInt(input.getAttribute('data-idx'));
                let val = parseInt(input.value);
                setsArr[idx] = (!isNaN(val) && val > 0) ? val : '';
            };
        });
    }

    showModal(`
        <h3 class="mb-3"><span class="text-info">${w ? 'Edit Workout' : 'Add Workout'}</span></h3>
        <form id="workout-form" class="p-2 rounded shadow-sm">
            <div class="mb-3">
                <label for="name_english" class="form-label">English Name</label>
                <input type="text" id="name_english" name="name_english" class="form-control" placeholder="English Name" value="${w?.name_english || ''}" required />
            </div>
            <div class="mb-3">
                <label for="name_persian" class="form-label">Persian Name</label>
                <input type="text" id="name_persian" name="name_persian" class="form-control" placeholder="Persian Name" value="${w?.name_persian || ''}" />
            </div>
            <div class="mb-3">
                <label for="score" class="form-label">Score (1-5)</label>
                <input type="number" id="score" name="score" class="form-control" placeholder="Score (1-5)" min="1" max="5" value="${w?.score || ''}" />
            </div>
            <div class="mb-3">
                <label for="user_tips" class="form-label">User Tips</label>
                <textarea id="user_tips" name="user_tips" class="form-control" placeholder="User Tips">${w?.user_tips || ''}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Sets</label>
                <div id="sets-dynamic-area">${renderSetsInputs()}</div>
            </div>
            <div class="mb-3">
                <label for="last_weight" class="form-label">Last Weight</label>
                <input type="number" id="last_weight" name="last_weight" class="form-control" placeholder="Last Weight" value="${w?.last_weight || ''}" />
            </div>
            <button type="submit" class="btn btn-primary w-100 my-2">${w ? 'Update' : 'Add'}</button>
            <button type="button" id="close-modal" class="btn btn-secondary w-100 my-2">Cancel</button>
        </form>
    `);
    document.getElementById('close-modal').onclick = closeModal;
    updateSetsUI();
    document.getElementById('workout-form').onsubmit = async (e) => {
        e.preventDefault();
        // Collect sets from setsArr
        let sets = setsArr.filter(val => typeof val === 'number' && val > 0);
        if (sets.length === 0) { alert('Please add at least one set.'); return; }
        const fd = new FormData(e.target);
        const payload = {
            name_english: fd.get('name_english'),
            name_persian: fd.get('name_persian'),
            score: fd.get('score') ? parseInt(fd.get('score')) : null,
            user_tips: fd.get('user_tips'),
            sets: sets,
            last_weight: fd.get('last_weight') ? parseFloat(fd.get('last_weight')) : null
        };
        const url = w ? `${API_BASE}/workout/${w.id}/` : `${API_BASE}/workout/`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
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
    modal.className = 'modal show d-block';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '2000';
    modal.tabIndex = -1;
    modal.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content">${html}</div></div>`;
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
}
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
    document.body.classList.remove('modal-open');
}

// --- AI Features ---
async function showAIHowTo(w) {
    showModal('<p class="text-center">Loading AI instructions...</p>');
  
    try {
      const res = await fetch(`${API_BASE}/workout/ask/${w.id}`, { credentials: 'include' });
  
      if (!res.ok) throw new Error('Fetch failed');
  
      const data = await res.json();
  
      // Parse and inject Markdown
      const html = (window.marked ? window.marked.parse : marked.parse)(data.message); // 'marked' must be loaded
      showModal(`
        <div class="modal-header bg-dark text-white">
          <h3>AI: How to do ${w.name_english}</h3>
        </div>
        <div class="modal-body bg-dark text-white">
          <div id="markdown-output" class="text-white">${html}</div>
        </div>
        <div class="modal-footer bg-dark">
          <button id="close-modal" class="btn btn-secondary w-100 my-2">Close</button>
        </div>
      `);
  
      document.getElementById('close-modal').onclick = closeModal;
    } catch (err) {
      console.error(err);
      showModal('<p class="text-center">Failed to get AI instructions.</p><button id="close-modal" class="btn btn-secondary w-100 my-2">Close</button>');
      document.getElementById('close-modal').onclick = closeModal;
    }
}
// async function showAIHowTo(w) {
//     showModal('<p>Loading AI instructions...</p>');
//     const res = await fetch(`${API_BASE}/workout/ask/${w.id}`, { credentials: 'include' });
//     if (res.ok) {
//         const data = await res.json();
//         // Render markdown using marked.js
//         let html = window.marked ? window.marked.parse(data.message) : data.message;
//         showModal(`<h3>AI: How to do ${w.name_english}</h3><div>${html}</div><button id="close-modal">Close</button>`);
//         document.getElementById('close-modal').onclick = closeModal;
//     } else {
//         showModal('<p>Failed to get AI instructions.</p><button id="close-modal">Close</button>');
//         document.getElementById('close-modal').onclick = closeModal;
//     }
// }

async function showAIFeedback() {
    showModal('<p class="text-center">Loading AI feedback...</p>');
    try {
        const res = await fetch(`${API_BASE}/workout/check/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        const html = (window.marked ? window.marked.parse : marked.parse)(data.message); // 'marked' must be loaded
        showModal(`
            <div class="modal-header bg-dark text-white">
              <h3>AI: Overall Feedback</h3>
            </div>
            <div class="modal-body bg-dark text-white">
              <div id="markdown-output" class="text-white">${html}</div>
            </div>
            <div class="modal-footer bg-dark">
              <button id="close-modal" class="btn btn-secondary w-100 my-2">Close</button>
            </div>
        `);
        document.getElementById('close-modal').onclick = closeModal;
    } catch (err) {
        console.error(err);
        showModal('<p class="text-center">Failed to get AI feedback.</p><button id="close-modal" class="btn btn-secondary w-100 my-2">Close</button>');
        document.getElementById('close-modal').onclick = closeModal;
    }
} 