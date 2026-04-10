/* ═══════════════════════════════════════════════════════════
   HACKER DASHBOARD — Frontend JavaScript
   Boot sequence, matrix rain, terminal, User CRUD,
   Filtering, Sorting, Pagination, Live updates
   ═══════════════════════════════════════════════════════════ */

const API = '';
let currentPage = 1;
let currentSort = '-createdAt';
let currentSearch = '';
let currentMinAge = '';
let currentMaxAge = '';

document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    runBootSequence();
});

// ═══════════════════════════════════════════════════════════
//  MATRIX RAIN BACKGROUND
// ═══════════════════════════════════════════════════════════
function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, columns, drops;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        columns = Math.floor(w / fontSize);
        drops = Array(columns).fill(1);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#00ff41';
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// ═══════════════════════════════════════════════════════════
//  BOOT SEQUENCE
// ═══════════════════════════════════════════════════════════
function runBootSequence() {
    const asciiLogo = document.getElementById('ascii-logo');
    const bootText = document.getElementById('boot-text');
    const bootBar = document.getElementById('boot-bar');
    const bootStatus = document.getElementById('boot-status');

    asciiLogo.textContent = `
██╗  ██╗██╗  ██╗██████╗ ██████╗  █████╗ ███████╗██╗  ██╗
██║  ██║██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║  ██║
███████║█████╔╝ ██████╔╝██║  ██║███████║███████╗███████║
██╔══██║██╔═██╗ ██╔══██╗██║  ██║██╔══██║╚════██║██╔══██║
██║  ██║██║  ██╗██║  ██║██████╔╝██║  ██║███████║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

    const bootLines = [
        '[BIOS]  POST check passed ..................... OK',
        '[BOOT]  Loading kernel v5.15.0-91-generic ..... OK',
        '[INIT]  Mounting filesystems .................. OK',
        '[NET]   Initializing network interfaces ....... OK',
        '[SEC]   Loading firewall rules ................ OK',
        '[DB]    Connecting to MongoDB Atlas ........... OK',
        '[IDX]   Creating text index on bio ............ OK',
        '[IDX]   Creating hashed index on userId ....... OK',
        '[IDX]   Creating TTL index on createdAt ....... OK',
        '[AUTH]  Authentication module loaded .......... OK',
        '[CRUD]  REST API endpoints initialized ........ OK',
        '[TERM]  Terminal emulator ready ............... OK',
        '',
        '>>> SYSTEM READY — Welcome, root',
    ];

    let lineIndex = 0;
    function typeLine() {
        if (lineIndex >= bootLines.length) {
            bootStatus.textContent = 'SYSTEM ONLINE — LOADING DASHBOARD...';
            bootBar.style.width = '100%';
            setTimeout(() => {
                document.getElementById('boot-screen').classList.add('fade-out');
                setTimeout(() => {
                    document.getElementById('boot-screen').style.display = 'none';
                    document.getElementById('dashboard').classList.remove('hidden');
                    initDashboard();
                }, 800);
            }, 600);
            return;
        }
        const line = bootLines[lineIndex];
        const div = document.createElement('div');
        div.textContent = line;
        div.style.color = line.includes('>>>') ? '#00ff41' : '#00cc33';
        bootText.appendChild(div);
        bootText.scrollTop = bootText.scrollHeight;
        bootBar.style.width = ((lineIndex + 1) / bootLines.length * 100) + '%';
        bootStatus.textContent = line.split(']')[0]?.replace('[', '') || 'LOADING';
        lineIndex++;
        setTimeout(typeLine, 150 + Math.random() * 200);
    }
    setTimeout(typeLine, 1000);
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD INITIALIZATION
// ═══════════════════════════════════════════════════════════
function initDashboard() {
    initClock();
    initNavigation();
    initTerminal();
    initSearchEnter();
    loadDashboardData();
    startLiveUpdates();
}

function initClock() {
    function update() {
        const now = new Date();
        document.getElementById('clock').textContent =
            `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} — ${now.toLocaleTimeString('en-US', { hour12: false })}`;
    }
    update();
    setInterval(update, 1000);
}

function initNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.panel));
    });
}

function switchTab(panelName) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const tab = document.querySelector(`.nav-tab[data-panel="${panelName}"]`);
    const panel = document.getElementById(`panel-${panelName}`);
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');
    if (panelName === 'users') loadUsers();
    if (panelName === 'logs') loadLogs();
}

function initSearchEnter() {
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchUsers();
        });
    }
}

// ═══════════════════════════════════════════════════════════
//  LOAD DASHBOARD DATA
// ═══════════════════════════════════════════════════════════
async function loadDashboardData() {
    try {
        const [statsRes, dashRes] = await Promise.all([
            fetch(`${API}/api/stats`),
            fetch(`${API}/api/dashboard`)
        ]);
        const stats = await statsRes.json();
        const dash = await dashRes.json();

        // Stats
        updateStatValue('cpu', stats.cpu.usage, `${stats.cpu.model} (${stats.cpu.cores} cores)`);
        updateStatValue('mem', stats.memory.percent, `${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`);

        document.getElementById('stat-users').textContent = stats.counts.users;
        document.getElementById('bar-users').style.width = `${Math.min((stats.counts.users / 20) * 100, 100)}%`;

        document.getElementById('stat-threats').textContent = stats.counts.threats;
        document.getElementById('bar-threats').style.width = `${(stats.counts.threats / 10) * 100}%`;

        document.getElementById('cpu-mini').textContent = `CPU: ${stats.cpu.usage}%`;
        document.getElementById('mem-mini').textContent = `MEM: ${stats.memory.percent}%`;
        document.getElementById('threat-count').textContent = `THREATS: ${stats.counts.threats}`;

        document.getElementById('sb-uptime').textContent = `UPTIME: ${formatUptime(stats.os.uptime)}`;

        // Log feed
        renderLogFeed(dash.logs);
        // User mini list
        renderUsersMini(dash.users);
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

function updateStatValue(type, value, subtext) {
    document.getElementById(`stat-${type}`).textContent = `${value}%`;
    document.getElementById(`bar-${type}`).style.width = `${value}%`;
    const subEl = type === 'cpu' ? document.getElementById('stat-cpu-model') : document.getElementById('stat-mem-detail');
    if (subEl) subEl.textContent = subtext;
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(s) {
    return `${Math.floor(s/86400)}d ${Math.floor((s%86400)/3600)}h ${Math.floor((s%3600)/60)}m`;
}

function renderLogFeed(logs) {
    const feed = document.getElementById('live-log-feed');
    feed.innerHTML = '';
    logs.forEach((log, i) => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.style.animationDelay = `${i * 0.05}s`;
        const time = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false });
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-level ${log.level}">${log.level}</span>
            <span class="log-source">[${log.source}]</span>
            <span class="log-message">${log.message}</span>`;
        feed.appendChild(entry);
    });
}

function renderUsersMini(users) {
    const list = document.getElementById('user-list-mini');
    list.innerHTML = '';
    users.forEach(u => {
        const item = document.createElement('div');
        item.className = 'user-mini';
        item.innerHTML = `
            <span class="user-mini-name">${u.name}</span>
            <span class="user-mini-email">${u.email}</span>
            <span class="user-mini-age">Age: ${u.age || '—'}</span>`;
        list.appendChild(item);
    });
}

function startLiveUpdates() {
    setInterval(async () => {
        try {
            const res = await fetch(`${API}/api/stats`);
            const stats = await res.json();
            updateStatValue('cpu', stats.cpu.usage, `${stats.cpu.model} (${stats.cpu.cores} cores)`);
            updateStatValue('mem', stats.memory.percent, `${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`);
            document.getElementById('cpu-mini').textContent = `CPU: ${stats.cpu.usage}%`;
            document.getElementById('mem-mini').textContent = `MEM: ${stats.memory.percent}%`;
            const pkts = parseInt(document.getElementById('sb-packets').textContent.split(': ')[1] || 0);
            document.getElementById('sb-packets').textContent = `PKT: ${pkts + Math.floor(Math.random() * 50 + 10)}`;
            document.getElementById('sb-latency').textContent = `LATENCY: ${Math.floor(Math.random() * 30 + 5)}ms`;
        } catch (e) {}
    }, 5000);
}

// ═══════════════════════════════════════════════════════════
//  TERMINAL
// ═══════════════════════════════════════════════════════════
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const body = document.getElementById('terminal-body');
    const history = [];
    let hIdx = -1;

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (!cmd) return;
            history.unshift(cmd);
            hIdx = -1;
            addTermLine(`<span class="prompt-text">root@hkrdash:~$</span> <span class="cmd-text">${esc(cmd)}</span>`);
            input.value = '';
            if (cmd.toLowerCase() === 'clear') { body.innerHTML = ''; return; }
            try {
                const res = await fetch(`${API}/api/commands`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: cmd })
                });
                const data = await res.json();
                if (data.output === '__CLEAR__') { body.innerHTML = ''; return; }
                const cls = data.status === 'error' ? 'error-output' : 'output';
                data.output.split('\n').forEach(line => addTermLine(`<span>${esc(line)}</span>`, cls));
            } catch (err) {
                addTermLine(`<span>Error: Server unreachable</span>`, 'error-output');
            }
            body.scrollTop = body.scrollHeight;
        }
        if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } }
        if (e.key === 'ArrowDown') { e.preventDefault(); if (hIdx > 0) { hIdx--; input.value = history[hIdx]; } else { hIdx = -1; input.value = ''; } }
    });

    body.addEventListener('click', () => input.focus());
}

function addTermLine(content, className = '') {
    const body = document.getElementById('terminal-body');
    const line = document.createElement('div');
    line.className = `term-line ${className}`;
    line.innerHTML = content;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ═══════════════════════════════════════════════════════════
//  USERS — Full CRUD with Filtering, Sorting, Pagination
// ═══════════════════════════════════════════════════════════
async function loadUsers(page) {
    if (page) currentPage = page;
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            sort: currentSort
        });
        if (currentSearch) params.set('search', currentSearch);
        if (currentMinAge) params.set('minAge', currentMinAge);
        if (currentMaxAge) params.set('maxAge', currentMaxAge);

        const res = await fetch(`${API}/api/users?${params}`);
        const data = await res.json();
        renderUsersTable(data.users);
        renderPagination(data.pagination);
    } catch (err) {
        console.error('Load users error:', err);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No users found</td></tr>`;
        return;
    }
    users.forEach(u => {
        const tr = document.createElement('tr');
        const hobbiesHtml = (u.hobbies || []).map(h => `<span class="hobby-tag">${h}</span>`).join('');
        const created = new Date(u.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' });
        tr.innerHTML = `
            <td style="color: var(--green-dim); font-weight: 600;">${u.name}</td>
            <td style="color: var(--text-secondary); font-size: 0.7rem;">${u.email}</td>
            <td style="color: var(--cyan-dim);">${u.age || '—'}</td>
            <td><div class="hobby-tags">${hobbiesHtml || '<span style="color: var(--text-muted);">—</span>'}</div></td>
            <td style="color: var(--text-muted); font-size: 0.65rem;">${u.userId || '—'}</td>
            <td style="color: var(--text-muted); font-size: 0.65rem;">${created}</td>
            <td>
                <div class="table-actions">
                    <button class="tbl-btn" onclick='editUser(${JSON.stringify(u).replace(/'/g, "&#39;")})'>EDIT</button>
                    <button class="tbl-btn delete" onclick="deleteUser('${u._id}')">DELETE</button>
                </div>
            </td>`;
        tbody.appendChild(tr);
    });
}

function renderPagination(p) {
    const el = document.getElementById('pagination');
    if (!p || p.pages <= 1) { el.innerHTML = ''; return; }

    let html = `<button class="page-btn" onclick="loadUsers(${p.page - 1})" ${p.page <= 1 ? 'disabled' : ''}>◀ PREV</button>`;
    for (let i = 1; i <= p.pages; i++) {
        html += `<button class="page-btn ${i === p.page ? 'active' : ''}" onclick="loadUsers(${i})">${i}</button>`;
    }
    html += `<span class="page-info">${p.total} total</span>`;
    html += `<button class="page-btn" onclick="loadUsers(${p.page + 1})" ${p.page >= p.pages ? 'disabled' : ''}">NEXT ▶</button>`;
    el.innerHTML = html;
}

// ─── Search ───
function searchUsers() {
    currentSearch = document.getElementById('user-search').value.trim();
    currentPage = 1;
    loadUsers();
}

// ─── Filters ───
function applyFilters() {
    currentMinAge = document.getElementById('filter-min-age').value;
    currentMaxAge = document.getElementById('filter-max-age').value;
    currentSort = document.getElementById('filter-sort').value;
    currentPage = 1;
    loadUsers();
}

function resetFilters() {
    currentMinAge = '';
    currentMaxAge = '';
    currentSort = '-createdAt';
    currentSearch = '';
    currentPage = 1;
    document.getElementById('filter-min-age').value = '';
    document.getElementById('filter-max-age').value = '';
    document.getElementById('filter-sort').value = '-createdAt';
    document.getElementById('user-search').value = '';
    loadUsers();
}

// ─── Add / Edit User Form ───
let isEditing = false;

function showUserForm() {
    isEditing = false;
    document.getElementById('form-title').textContent = 'CREATE USER';
    document.getElementById('form-submit-btn').textContent = 'CREATE USER ▸';
    document.getElementById('edit-user-id').value = '';
    clearFormFields();
    hideFormError();
    document.getElementById('user-form-overlay').classList.remove('hidden');
}

function hideUserForm() {
    document.getElementById('user-form-overlay').classList.add('hidden');
    clearFormFields();
    hideFormError();
}

function clearFormFields() {
    ['user-name', 'user-email', 'user-age', 'user-userid', 'user-hobbies', 'user-bio'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function showFormError(msg) {
    const el = document.getElementById('form-error');
    el.textContent = msg;
    el.classList.remove('hidden');
}

function hideFormError() {
    document.getElementById('form-error').classList.add('hidden');
}

function editUser(user) {
    isEditing = true;
    document.getElementById('form-title').textContent = 'EDIT USER';
    document.getElementById('form-submit-btn').textContent = 'UPDATE USER ▸';
    document.getElementById('edit-user-id').value = user._id;
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-age').value = user.age || '';
    document.getElementById('user-userid').value = user.userId || '';
    document.getElementById('user-hobbies').value = (user.hobbies || []).join(', ');
    document.getElementById('user-bio').value = user.bio || '';
    hideFormError();
    document.getElementById('user-form-overlay').classList.remove('hidden');
}

async function submitUserForm() {
    const data = {
        name: document.getElementById('user-name').value.trim(),
        email: document.getElementById('user-email').value.trim(),
        age: document.getElementById('user-age').value ? parseInt(document.getElementById('user-age').value) : undefined,
        userId: document.getElementById('user-userid').value.trim() || undefined,
        hobbies: document.getElementById('user-hobbies').value
            ? document.getElementById('user-hobbies').value.split(',').map(h => h.trim()).filter(h => h)
            : [],
        bio: document.getElementById('user-bio').value.trim() || undefined
    };

    if (!data.name || !data.email) {
        showFormError('Name and email are required');
        return;
    }

    const editId = document.getElementById('edit-user-id').value;

    try {
        const url = isEditing ? `${API}/api/users/${editId}` : `${API}/api/users`;
        const method = isEditing ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) {
            showFormError(result.error || 'Operation failed');
            return;
        }
        hideUserForm();
        loadUsers();
        // Refresh dashboard counts
        loadDashboardData();
    } catch (err) {
        showFormError('Network error — could not reach server');
    }
}

async function deleteUser(id) {
    if (!confirm('⚠ Terminate this user account?')) return;
    try {
        await fetch(`${API}/api/users/${id}`, { method: 'DELETE' });
        loadUsers();
        loadDashboardData();
    } catch (err) {
        alert('Error deleting user');
    }
}

// ═══════════════════════════════════════════════════════════
//  LOGS — CRUD + Filter
// ═══════════════════════════════════════════════════════════
let currentLogFilter = 'all';

async function loadLogs(level) {
    try {
        const url = level && level !== 'all' ? `${API}/api/logs?level=${level}` : `${API}/api/logs`;
        const res = await fetch(url);
        const logs = await res.json();
        renderLogs(logs);
    } catch (err) {
        console.error('Load logs error:', err);
    }
}

function renderLogs(logs) {
    const container = document.getElementById('logs-container');
    container.innerHTML = '';
    if (logs.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">No logs found</div>';
        return;
    }
    logs.forEach(log => {
        const row = document.createElement('div');
        row.className = `log-row ${log.level}`;
        const time = new Date(log.timestamp).toLocaleString('en-US', {
            month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        row.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-level ${log.level}">${log.level}</span>
            <span class="log-source">[${log.source}]</span>
            <span class="log-message">${log.message}</span>
            <button class="delete-log-btn" onclick="deleteLog('${log._id}')" title="Delete">✕</button>`;
        container.appendChild(row);
    });
}

function filterLogs(level, btn) {
    currentLogFilter = level;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    loadLogs(level);
}

async function deleteLog(id) {
    try {
        await fetch(`${API}/api/logs/${id}`, { method: 'DELETE' });
        loadLogs(currentLogFilter);
    } catch (err) { alert('Error'); }
}

async function clearLogs() {
    if (!confirm('⚠ Purge ALL system logs?')) return;
    try {
        await fetch(`${API}/api/logs`, { method: 'DELETE' });
        loadLogs();
    } catch (err) { alert('Error'); }
}
