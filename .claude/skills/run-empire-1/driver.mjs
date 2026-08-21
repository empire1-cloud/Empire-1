#!/usr/bin/env node
/**
 * Drive the Empire-1 frontend (static build) using puppeteer.
 * Assumes the frontend has been built (npm run build in frontend/).
 * Launches a local HTTP server, opens the site, takes a screenshot,
 * and saves it as screenshot.png in the skill directory.
 */

import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import { resolve, join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4000;
const FRONTEND_DIR = resolve(process.cwd(), '../../../frontend');
const DIST_DIR = join(FRONTEND_DIR, 'dist');
const SCREENSHOT_PATH = join(__dirname, 'screenshot.png');

async function main() {
  // Ensure dist exists
  if (!existsSync(DIST_DIR)) {
    console.error(`Build directory not found: ${DIST_DIR}`);
    console.error('Run "npm run build" in the frontend directory first.');
    process.exit(1);
  }

  // Start a simple HTTP server (Python 3)
  console.log(`Starting HTTP server on port ${PORT}...`);
  const server = spawn('python3', ['-m', 'http.server', PORT], {
    cwd: DIST_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverReady = false;
  server.stdout.on('data', (data) => {
    const line = data.toString();
    if (line.includes(`Serving HTTP on 0.0.0.0 port ${PORT}`)) {
      serverReady = true;
    }
  });

  // Wait for server to be ready (max 10 seconds)
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 10000);
    const check = () => {
      if (serverReady) {
        clearTimeout(timeout);
        resolve();
      }
    };
    const interval = setInterval(check, 200);
    server.stderr.on('data', (data) => {
      // Optional: log errors
      // process.stderr.write(data);
    });
  });

  console.log('Server ready, launching browser...');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const url = `http://localhost:${PORT}/`;
  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Optional: wait for a specific element to ensure content loaded
  await page.waitForSelector('body');

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  console.log(`Screenshot saved to ${SCREENSHOT_PATH}`);

  await browser.close();
  server.kill();
  console.log('Server stopped.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
