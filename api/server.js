// Local development entry point.
// On Vercel, api/index.js is used directly as a serverless function and this
// file is never loaded (it is listed in .vercelignore).
require('dotenv').config();

const dns = require('dns');

// On this Windows setup Node's bundled resolver (c-ares) fails to read the
// adapter's DNS config and silently falls back to 127.0.0.1, where nothing is
// listening — so every lookup dies with ECONNREFUSED, including the SRV lookup
// that mongodb+srv:// needs. Windows itself resolves fine; only Node is affected.
// Override with DNS_SERVERS="192.168.31.1,1.1.1.1" if these defaults don't suit.
const configured = dns.getServers();
const allLoopback = configured.every(s => s === '127.0.0.1' || s === '::1');
if (allLoopback) {
    const servers = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()).filter(Boolean);
    dns.setServers(servers);
    console.warn(`⚠️  Node had no usable DNS server (got ${configured.join(', ')}). Using ${servers.join(', ')} instead.`);
}

const app = require('./index');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`WarrantyPro API listening on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
