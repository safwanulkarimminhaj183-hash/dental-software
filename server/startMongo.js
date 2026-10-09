// startMongo.js — run local mongod without the Windows service (no admin required)
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const mongod =
  process.env.MONGOD_PATH ||
  'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';

const dataDir = path.join(os.homedir(), 'AppData', 'Local', 'mongodb', 'data');
const logDir = path.join(os.homedir(), 'AppData', 'Local', 'mongodb', 'log');
const logPath = path.join(logDir, 'mongod.log');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });

if (!fs.existsSync(mongod)) {
  console.error(`❌ mongod not found at: ${mongod}`);
  process.exit(1);
}

console.log('Starting MongoDB on 127.0.0.1:27017 ...');
const child = spawn(
  mongod,
  ['--dbpath', dataDir, '--logpath', logPath, '--bind_ip', '127.0.0.1', '--port', '27017'],
  { detached: true, stdio: 'ignore' }
);
child.unref();
console.log(`✅ mongod started (pid ${child.pid}). Log: ${logPath}`);
console.log('Keep this process running, then use: npm run server');
