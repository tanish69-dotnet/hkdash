// ═══════════════════════════════════════════════════════════════════════
//  HACKER DASHBOARD — User Management System
//  Express + MongoDB Backend
//  Full CRUD, Validation, Indexes, Filtering, Sorting, Pagination,
//  Query Performance Analysis, Terminal Simulation
// ═══════════════════════════════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════════════════════════════
//  MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════════════════
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('[DB] ✓ MongoDB Atlas connected successfully'))
    .catch(err => console.error('[DB] ✗ MongoDB connection error:', err.message));

// ═══════════════════════════════════════════════════════════════════════
//  USER SCHEMA — Matches assignment requirements exactly
//  Fields: name, email, age, hobbies, bio, userId, createdAt
//  Includes: validations, text index, hashed index, TTL index
// ═══════════════════════════════════════════════════════════════════════
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email format`
        }
    },
    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [120, 'Age cannot exceed 120']
    },
    hobbies: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        trim: true
    },
    userId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ─── INDEXES (Assignment requirement) ───
// Text index on 'bio' for text search
userSchema.index({ bio: 'text', name: 'text' });

// Hashed index on 'userId' for hashed-based lookups
userSchema.index({ userId: 'hashed' });

// TTL index on 'createdAt' — auto-delete after 365 days (for demo; adjustable)
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Compound index for sorting/filtering
userSchema.index({ age: 1, name: 1 });

const User = mongoose.model('User', userSchema);

// ═══════════════════════════════════════════════════════════════════════
//  SYSTEM LOG SCHEMA
// ═══════════════════════════════════════════════════════════════════════
const logSchema = new mongoose.Schema({
    level:     { type: String, enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL', 'DEBUG'], default: 'INFO' },
    source:    { type: String, default: 'SYSTEM' },
    message:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata:  { type: mongoose.Schema.Types.Mixed }
});
const Log = mongoose.model('Log', logSchema);

// ═══════════════════════════════════════════════════════════════════════
//  COMMAND HISTORY SCHEMA
// ═══════════════════════════════════════════════════════════════════════
const commandSchema = new mongoose.Schema({
    command:   { type: String, required: true },
    output:    { type: String },
    status:    { type: String, enum: ['success', 'error', 'pending'], default: 'success' },
    executedBy:{ type: String, default: 'root' },
    timestamp: { type: Date, default: Date.now }
});
const Command = mongoose.model('Command', commandSchema);

// ═══════════════════════════════════════════════════════════════════════
//  SEED DATA
// ═══════════════════════════════════════════════════════════════════════
async function seedData() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            await User.insertMany([
                {
                    name: 'Tanish',
                    email: 'tanish@hkrdash.io',
                    age: 21,
                    hobbies: ['coding', 'hacking', 'cybersecurity'],
                    bio: 'Full-stack developer and cybersecurity enthusiast. Loves building terminal interfaces.',
                    userId: 'USR-001'
                },
                {
                    name: 'Cipher',
                    email: 'cipher@darknet.io',
                    age: 28,
                    hobbies: ['cryptography', 'reverse engineering', 'CTF'],
                    bio: 'Cryptography specialist working on end-to-end encryption protocols.',
                    userId: 'USR-002'
                },
                {
                    name: 'Phantom',
                    email: 'phantom@ghost.net',
                    age: 25,
                    hobbies: ['pentesting', 'network analysis', 'linux'],
                    bio: 'Network penetration tester and Linux kernel contributor.',
                    userId: 'USR-003'
                },
                {
                    name: 'Neo Matrix',
                    email: 'neo@matrix.io',
                    age: 30,
                    hobbies: ['AI', 'machine learning', 'data mining'],
                    bio: 'AI researcher exploring neural networks and deep learning for threat detection.',
                    userId: 'USR-004'
                },
                {
                    name: 'Zero Cool',
                    email: 'zero@underground.net',
                    age: 22,
                    hobbies: ['web exploitation', 'OSINT', 'scripting'],
                    bio: 'Bug bounty hunter specializing in web application security.',
                    userId: 'USR-005'
                },
                {
                    name: 'Root Access',
                    email: 'root@sysadmin.io',
                    age: 35,
                    hobbies: ['system administration', 'automation', 'docker'],
                    bio: 'Senior system administrator managing cloud infrastructure and DevOps pipelines.',
                    userId: 'USR-006'
                },
                {
                    name: 'Shadow Walker',
                    email: 'shadow@stealth.io',
                    age: 27,
                    hobbies: ['malware analysis', 'forensics', 'incident response'],
                    bio: 'Digital forensics expert and incident response team lead.',
                    userId: 'USR-007'
                },
                {
                    name: 'Byte Runner',
                    email: 'byte@runner.dev',
                    age: 19,
                    hobbies: ['competitive programming', 'algorithms', 'open source'],
                    bio: 'Competitive programmer and open-source contributor. Loves solving complex algorithm challenges.',
                    userId: 'USR-008'
                }
            ]);
            console.log('[SEED] ✓ Users seeded (8 records)');
        }

        const logCount = await Log.countDocuments();
        if (logCount === 0) {
            await Log.insertMany([
                { level: 'INFO',     source: 'AUTH',      message: 'Root user authenticated successfully' },
                { level: 'WARN',     source: 'FIREWALL',  message: 'Unusual traffic pattern detected on port 443' },
                { level: 'ERROR',    source: 'DATABASE',  message: 'Connection pool exhausted — retrying...' },
                { level: 'CRITICAL', source: 'SECURITY',  message: 'Brute force attempt detected from 192.168.1.105' },
                { level: 'INFO',     source: 'NETWORK',   message: 'VPN tunnel established to 10.0.0.1' },
                { level: 'DEBUG',    source: 'SYSTEM',    message: 'Memory garbage collection completed' },
                { level: 'WARN',     source: 'PROXY',     message: 'SSL certificate expires in 7 days' },
                { level: 'INFO',     source: 'CRON',      message: 'Scheduled backup completed successfully' },
                { level: 'ERROR',    source: 'DNS',       message: 'Failed to resolve hostname: darknode.onion' },
                { level: 'CRITICAL', source: 'INTRUSION', message: 'Unauthorized SSH access attempt on port 22' },
                { level: 'INFO',     source: 'INDEX',     message: 'Text index created on bio field' },
                { level: 'INFO',     source: 'INDEX',     message: 'Hashed index created on userId field' },
                { level: 'INFO',     source: 'INDEX',     message: 'TTL index created on createdAt field' },
                { level: 'WARN',     source: 'DISK',      message: 'Disk usage exceeds 85% on /dev/sda1' }
            ]);
            console.log('[SEED] ✓ Logs seeded (14 records)');
        }
    } catch (err) {
        console.error('[SEED] Error:', err.message);
    }
}

mongoose.connection.once('open', seedData);

// ═══════════════════════════════════════════════════════════════════════
//  API ROUTES — USERS (Full CRUD + Filtering + Sorting + Pagination)
// ═══════════════════════════════════════════════════════════════════════

// GET ALL USERS — with filtering, sorting, pagination, text search
app.get('/api/users', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            name,
            email,
            minAge,
            maxAge,
            search,
            hobbies
        } = req.query;

        const filter = {};

        // Filtering
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (email) filter.email = { $regex: email, $options: 'i' };
        if (minAge || maxAge) {
            filter.age = {};
            if (minAge) filter.age.$gte = parseInt(minAge);
            if (maxAge) filter.age.$lte = parseInt(maxAge);
        }
        if (hobbies) {
            filter.hobbies = { $in: hobbies.split(',').map(h => h.trim()) };
        }

        // Text search on bio/name (uses text index)
        if (search) {
            filter.$text = { $search: search };
        }

        // Sorting — e.g. sort=name or sort=-age
        const sortObj = {};
        if (sort.startsWith('-')) {
            sortObj[sort.slice(1)] = -1;
        } else {
            sortObj[sort] = 1;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE USER by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE USER
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, age, hobbies, bio, userId } = req.body;
        const user = await User.create({ name, email, age, hobbies, bio, userId });
        await Log.create({ level: 'INFO', source: 'AUTH', message: `New user created: ${name} (${email})` });
        res.status(201).json(user);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({ error: `${field} already exists` });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER
app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        await Log.create({ level: 'INFO', source: 'AUTH', message: `User updated: ${user.name}` });
        res.json(user);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE USER
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await Log.create({ level: 'WARN', source: 'AUTH', message: `User deleted: ${user.name} (${user.email})` });
        res.json({ message: 'User terminated', name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════
//  API ROUTES — QUERY PERFORMANCE / EXPLAIN
//  Uses .explain("executionStats") as per assignment
// ═══════════════════════════════════════════════════════════════════════

// Explain query performance for finding users
app.get('/api/explain/users', async (req, res) => {
    try {
        const filter = {};
        if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
        if (req.query.email) filter.email = req.query.email;
        if (req.query.age) filter.age = parseInt(req.query.age);
        if (req.query.userId) filter.userId = req.query.userId;

        const explanation = await User.find(filter).explain('executionStats');
        res.json(explanation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Explain text search performance
app.get('/api/explain/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
        const explanation = await User.find({ $text: { $search: q } }).explain('executionStats');
        res.json(explanation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all indexes on the users collection
app.get('/api/indexes', async (req, res) => {
    try {
        const indexes = await User.collection.indexes();
        res.json(indexes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════
//  API ROUTES — LOGS (Full CRUD)
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/logs', async (req, res) => {
    try {
        const filter = {};
        if (req.query.level) filter.level = req.query.level.toUpperCase();
        if (req.query.source) filter.source = req.query.source.toUpperCase();
        const logs = await Log.find(filter).sort({ timestamp: -1 }).limit(parseInt(req.query.limit) || 50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/logs', async (req, res) => {
    try {
        const log = await Log.create(req.body);
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/logs/:id', async (req, res) => {
    try {
        await Log.findByIdAndDelete(req.params.id);
        res.json({ message: 'Log deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/logs', async (req, res) => {
    try {
        await Log.deleteMany({});
        res.json({ message: 'All logs purged' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════
//  API ROUTES — TERMINAL COMMANDS
// ═══════════════════════════════════════════════════════════════════════

app.get('/api/commands', async (req, res) => {
    try {
        const cmds = await Command.find().sort({ timestamp: -1 }).limit(50);
        res.json(cmds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/commands', async (req, res) => {
    try {
        const { command } = req.body;
        if (!command) return res.status(400).json({ error: 'Command required' });
        const output = simulateCommand(command.trim());
        const cmd = await Command.create({
            command: command.trim(),
            output: output.text,
            status: output.status,
            executedBy: req.body.user || 'root'
        });
        await Log.create({
            level: output.status === 'error' ? 'ERROR' : 'INFO',
            source: 'TERMINAL',
            message: `Command executed: ${command.trim()}`
        });
        res.json(cmd);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Command Simulator ───
function simulateCommand(cmd) {
    const parts = cmd.toLowerCase().split(' ');
    const base = parts[0];

    const commands = {
        'help': {
            text: `Available commands:
  help          — Show this help menu
  whoami        — Display current user
  ls            — List directory contents
  pwd           — Print working directory
  date          — Show current date/time
  uptime        — Show system uptime
  ifconfig      — Network interface config
  nmap          — Scan network
  ping <host>   — Ping a host
  cat <file>    — Read file contents
  ps            — List running processes
  netstat       — Active connections
  df            — Disk usage
  uname         — System info
  clear         — Clear terminal
  status        — System overview
  indexes       — Show DB indexes
  schema        — Show User schema
  hack          — ???
  exit          — Close session`,
            status: 'success'
        },
        'whoami': { text: 'root@hkrdash', status: 'success' },
        'pwd': { text: '/root/hacker-dashboard', status: 'success' },
        'ls': {
            text: `drwxr-xr-x  4 root root 4096 ${new Date().toLocaleDateString()}  .config/
drwx------  2 root root 4096 ${new Date().toLocaleDateString()}  .ssh/
-rw-r--r--  1 root root 2048 ${new Date().toLocaleDateString()}  server.js
-rw-r--r--  1 root root  512 ${new Date().toLocaleDateString()}  .env
-rw-r--r--  1 root root 1024 ${new Date().toLocaleDateString()}  package.json
drwxr-xr-x  6 root root 4096 ${new Date().toLocaleDateString()}  public/
drwxr-xr-x  4 root root 4096 ${new Date().toLocaleDateString()}  node_modules/`,
            status: 'success'
        },
        'date': { text: new Date().toString(), status: 'success' },
        'uptime': {
            text: ` ${new Date().toLocaleTimeString()} up ${Math.floor(Math.random()*99)+1} days, ${Math.floor(Math.random()*24)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}, load average: ${(Math.random()*2).toFixed(2)}, ${(Math.random()*1.5).toFixed(2)}, ${(Math.random()*1).toFixed(2)}`,
            status: 'success'
        },
        'ifconfig': {
            text: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.42  netmask 255.255.255.0
        inet6 fe80::a00:27ff:fe4e:66a1
        ether 08:00:27:4e:66:a1  (Ethernet)
        RX packets 284521  bytes 198432512 (189.2 MiB)
        TX packets 152789  bytes 12045312 (11.4 MiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`,
            status: 'success'
        },
        'nmap': {
            text: `Starting Nmap 7.94 scan...
Host: 192.168.1.1   (gateway)     — UP [80/tcp open]
Host: 192.168.1.10  (mainframe)   — UP [22/tcp open SSH]
Host: 192.168.1.25  (db-server)   — UP [27017/tcp MongoDB]
Host: 192.168.1.42  (proxy)       — UP [8080/tcp Proxy]
Nmap done: 4 hosts scanned in 2.84 seconds`,
            status: 'success'
        },
        'ps': {
            text: `  PID TTY      TIME     CMD
    1 ?        00:05:12 systemd
   42 ?        00:02:34 sshd
  128 ?        00:12:45 node server.js
  256 ?        00:00:03 mongod
  512 pts/0    00:00:01 bash`,
            status: 'success'
        },
        'netstat': {
            text: `Proto  Local Address         Foreign Address        State
tcp    0.0.0.0:22            0.0.0.0:*              LISTEN
tcp    0.0.0.0:4000          0.0.0.0:*              LISTEN
tcp    127.0.0.1:27017       0.0.0.0:*              LISTEN`,
            status: 'success'
        },
        'df': {
            text: `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       51200000 43520000   7680000  85% /
/dev/sdb1      102400000 61440000  40960000  60% /data`,
            status: 'success'
        },
        'uname': { text: 'Linux hkrdash 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux', status: 'success' },
        'cat': {
            text: parts[1] === '.env'
                ? `PORT=4000\nMONGODB_URI=mongodb+srv://****:****@cluster0.yuahriw.mongodb.net/hackerDashboard`
                : `cat: ${parts[1] || '???'}: Permission denied`,
            status: parts[1] ? 'success' : 'error'
        },
        'ping': {
            text: parts[1]
                ? `PING ${parts[1]}: 64 bytes icmp_seq=0 ttl=64 time=${(Math.random()*20+1).toFixed(1)}ms\n64 bytes icmp_seq=1 ttl=64 time=${(Math.random()*20+1).toFixed(1)}ms\n--- ${parts[1]} 3 packets, 0% loss ---`
                : 'Usage: ping <host>',
            status: parts[1] ? 'success' : 'error'
        },
        'status': {
            text: `╔══════════════════════════════════╗
║      SYSTEM STATUS REPORT        ║
╠══════════════════════════════════╣
║  CPU:     ${String(Math.floor(Math.random()*60+20)).padStart(3)}%                  ║
║  Memory:  ${String(Math.floor(Math.random()*40+40)).padStart(3)}%                  ║
║  Disk:     85%                  ║
║  Uptime:  ${String(Math.floor(Math.random()*99+1)).padStart(2)} days               ║
╚══════════════════════════════════╝`,
            status: 'success'
        },
        'indexes': {
            text: `MongoDB Indexes on 'users' collection:
  1. _id          (default)     — Unique B-tree
  2. email        (unique)      — B-tree ascending
  3. bio, name    (text)        — Text index for search
  4. userId       (hashed)      — Hashed index
  5. createdAt    (TTL: 365d)   — TTL auto-expiry
  6. age, name    (compound)    — Compound sorting`,
            status: 'success'
        },
        'schema': {
            text: `User Schema:
  name      : String  (required, min 3 chars)
  email     : String  (required, unique, valid format)
  age       : Number  (min 0, max 120)
  hobbies   : [String]
  bio       : String  (text indexed)
  userId    : String  (unique, hashed index)
  createdAt : Date    (default now, TTL index)`,
            status: 'success'
        },
        'hack': {
            text: `[!] Initializing exploit framework...
[*] Loading payload modules...
[!] ACCESS DENIED — Nice try 😏`,
            status: 'error'
        },
        'clear': { text: '__CLEAR__', status: 'success' },
        'exit': { text: 'Session terminated.', status: 'success' },
    };

    if (commands[base]) return commands[base];
    return { text: `bash: ${base}: command not found. Type 'help' for available commands.`, status: 'error' };
}

// ═══════════════════════════════════════════════════════════════════════
//  API ROUTES — SYSTEM STATS
// ═══════════════════════════════════════════════════════════════════════
app.get('/api/stats', async (req, res) => {
    try {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const userCount = await User.countDocuments();
        const logCount = await Log.countDocuments();
        const criticalLogs = await Log.countDocuments({ level: 'CRITICAL' });

        res.json({
            cpu: { model: cpus[0]?.model || 'Unknown', cores: cpus.length, usage: Math.floor(Math.random() * 40 + 30) },
            memory: { total: totalMem, used: usedMem, free: freeMem, percent: Math.round((usedMem / totalMem) * 100) },
            os: { platform: os.platform(), hostname: os.hostname(), uptime: os.uptime(), arch: os.arch() },
            counts: { users: userCount, logs: logCount, threats: criticalLogs }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard summary
app.get('/api/dashboard', async (req, res) => {
    try {
        const [users, logs, commands] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(10),
            Log.find().sort({ timestamp: -1 }).limit(15),
            Command.find().sort({ timestamp: -1 }).limit(10)
        ]);
        res.json({ users, logs, commands });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Catch-all → Serve frontend ───
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server (or export for Vercel) ───
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════╗
║   HACKER DASHBOARD SERVER ACTIVE         ║
║   Port: ${PORT}                              ║
║   URL:  http://localhost:${PORT}              ║
╚══════════════════════════════════════════╝
        `);
    });
}

module.exports = app;
