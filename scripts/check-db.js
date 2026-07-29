#!/usr/bin/env node
/**
 * Diagnose a MongoDB connection string before wiring it into the app.
 *
 *   node scripts/check-db.js                 # tests MONGODB_URI from .env
 *   node scripts/check-db.js "mongodb+srv://user:pass@host/db"
 *
 * Separates the three failures that all look the same in the app logs:
 *   1. hostname does not exist   -> wrong/deleted cluster
 *   2. hostname resolves, connection times out -> IP access list
 *   3. connects, auth fails      -> wrong user/password
 */
require('dotenv').config();

const dnsSync = require('dns');
const dns = require('dns').promises;
const mongoose = require('mongoose');

// Same guard as api/server.js — Node can fall back to an unusable 127.0.0.1
// resolver on this machine, which makes every lookup fail with ECONNREFUSED.
if (dnsSync.getServers().every(s => s === '127.0.0.1' || s === '::1')) {
    dnsSync.setServers((process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()));
}

const uri = process.argv[2] || process.env.MONGODB_URI;

if (!uri) {
    console.error('No connection string. Pass one as an argument or set MONGODB_URI in .env');
    process.exit(1);
}

const parsed = uri.match(/^(mongodb(?:\+srv)?):\/\/(?:([^:]*):([^@]*)@)?([^/?]*)(?:\/([^?]*))?/);
if (!parsed) {
    console.error('Could not parse the connection string. It should start with mongodb:// or mongodb+srv://');
    process.exit(1);
}

const [, scheme, user, password, host, database] = parsed;
const isSrv = scheme === 'mongodb+srv';

const line = (label, value) => console.log('  ' + label.padEnd(12) + value);

async function main() {
    console.log('\nConnection string');
    line('scheme', scheme);
    line('host', host);
    line('user', user || '(none)');
    line('password', password ? `(${password.length} chars)` : '(none)');
    line('database', database || '(none — defaults to "test")');

    if (!database) {
        console.log('\n  ! No database name in the path. Add one, e.g. .../warranty-manager?retryWrites=true');
    }
    if (password && /[@:/?#[\]]/.test(decodeURIComponent(password)) && password === decodeURIComponent(password)) {
        console.log('\n  ! Password contains a character that must be percent-encoded (@ : / ? # [ ]).');
    }

    // ── Step 1: DNS ──────────────────────────────────────────────────────────
    console.log('\nStep 1 — DNS');
    if (isSrv) {
        const srvName = `_mongodb._tcp.${host}`;
        try {
            const records = await dns.resolveSrv(srvName);
            line('SRV', `OK — ${records.length} node(s)`);
            records.forEach(r => line('', `${r.name}:${r.port}`));
        } catch (err) {
            line('SRV', `FAILED (${err.code})`);
            console.log(`\n  The hostname "${host}" is not published in DNS.`);
            console.log('  This is almost never a network problem — it means the cluster');
            console.log('  does not exist, was deleted, or the hostname is mistyped.');
            console.log('\n  Copy the string again from Atlas: Cluster -> Connect -> Drivers.');
            process.exit(2);
        }
    } else {
        for (const hostPort of host.split(',')) {
            const name = hostPort.split(':')[0];
            try {
                const addrs = await dns.resolve4(name);
                line(name, `OK — ${addrs.join(', ')}`);
            } catch (err) {
                line(name, `FAILED (${err.code})`);
                process.exit(2);
            }
        }
    }

    // ── Step 2: connect ──────────────────────────────────────────────────────
    console.log('\nStep 2 — Connection');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 1,
        });
        line('connect', 'OK');
    } catch (err) {
        line('connect', 'FAILED');
        console.log('\n  ' + err.message);

        if (/Authentication failed|bad auth/i.test(err.message)) {
            console.log('\n  DNS resolved and the server answered, so the cluster is reachable.');
            console.log('  The username or password is wrong. Check Atlas -> Database Access.');
            console.log('  Special characters in the password must be percent-encoded.');
        } else if (/timed out|ETIMEDOUT|ServerSelectionError/i.test(err.message)) {
            console.log('\n  The hostname resolved but nothing accepted the connection.');
            console.log('  This is the IP access list. Atlas -> Network Access -> Add IP Address.');
            console.log('  Use "Allow access from anywhere" (0.0.0.0/0) to confirm, then narrow it.');
            console.log('  Note: Vercel functions have no fixed IP, so production needs 0.0.0.0/0.');
        }
        process.exit(3);
    }

    // ── Step 3: read/write ───────────────────────────────────────────────────
    console.log('\nStep 3 — Access');
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        line('database', mongoose.connection.name);
        line('collections', collections.length ? collections.map(c => c.name).join(', ') : '(empty — nothing created yet)');

        for (const name of ['users', 'warranties', 'claims', 'notifications']) {
            if (collections.some(c => c.name === name)) {
                const count = await mongoose.connection.db.collection(name).countDocuments();
                line(name, `${count} document(s)`);
            }
        }
        console.log('\nAll good — this connection string works.\n');
    } catch (err) {
        line('read', `FAILED — ${err.message}`);
        console.log('\n  Connected, but the user cannot read. Give it "Read and write to any');
        console.log('  database" in Atlas -> Database Access -> Edit user.\n');
        process.exit(4);
    }

    await mongoose.disconnect();
}

main().catch(err => {
    console.error('\nUnexpected error:', err.message);
    process.exit(1);
});
