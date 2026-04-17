#!/usr/bin/env node
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const envFilePath = path.resolve(rootDir, ".env");
if (existsSync(envFilePath)) {
  const envFile = readFileSync(envFilePath, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const tasks = [
  {
    name: "api-server",
    dir: "artifacts/api-server",
    env: { PORT: "3000", NODE_ENV: "development" },
    healthCheck: "http://127.0.0.1:3000/api/healthz",
  },
  {
    name: "admin",
    dir: "artifacts/admin",
    env: { PORT: "5173" },
  },
  {
    name: "vendor-app",
    dir: "artifacts/vendor-app",
    env: { PORT: "5174" },
  },
  {
    name: "rider-app",
    dir: "artifacts/rider-app",
    env: { PORT: "5175" },
  },
  {
    name: "customer-app",
    dir: "artifacts/ajkmart",
    env: {
      PORT: "5200",
      CI: "1",
      EXPO_PUBLIC_DOMAIN: process.env.EXPO_PUBLIC_DOMAIN ?? "",
      EXPO_PUBLIC_REPL_ID: process.env.EXPO_PUBLIC_REPL_ID ?? "",
      REACT_NATIVE_PACKAGER_HOSTNAME: process.env.EXPO_PUBLIC_DOMAIN ?? "localhost",
    },
    command: ["run", "dev:web"],
  },
];

if (!process.env.EXPO_PUBLIC_DOMAIN) {
  console.warn(
    "[dev-all] EXPO_PUBLIC_DOMAIN is not set. ajkmart will still start, but API URL resolution may not be correct.",
  );
}

let shuttingDown = false;
const children = [];

function logPrefix(name, data) {
  const lines = data.toString().split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    process.stdout.write(`[${name}] ${line}\n`);
  }
}

function requestOk(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const statusOk = res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
      res.resume();
      resolve(statusOk);
    });

    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForHealth(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline && !shuttingDown) {
    if (await requestOk(url)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function spawnTask(task) {
  const cwd = path.resolve(rootDir, task.dir);
  const env = { ...process.env, ...task.env };
  const args = task.command ?? ["dev"];
  const child = spawn("pnpm", args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });

  child.stdout.on("data", (data) => logPrefix(task.name, data));
  child.stderr.on("data", (data) => logPrefix(task.name, data));

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const message = code === 0 ? "completed" : `exited with code ${code}${signal ? `, signal ${signal}` : ""}`;
    console.error(`[${task.name}] ${message}`);
    if (code !== 0) {
      if (task.name === "api-server") {
        console.error(
          "[api-server] startup failed. Check DATABASE_URL and backend logs in artifacts/api-server."
        );
      }
      shutdown(code ?? 1);
    }
  });

  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  for (const task of tasks) {
    children.push(spawnTask(task));
  }

  const apiTask = tasks.find((task) => task.name === "api-server");
  if (apiTask?.healthCheck) {
    const healthy = await waitForHealth(apiTask.healthCheck, 20000);
    if (!healthy) {
      console.error(
        "[api-server] HEALTH CHECK FAILED: backend did not become healthy at",
        apiTask.healthCheck,
      );
      console.error(
        "Please verify that API server logs do not show DATABASE_URL/connection errors and that the backend is not exiting early."
      );
      console.error("If using Neon, confirm the DATABASE_URL is set and reachable.");
    } else {
      console.log(`[api-server] healthy at ${apiTask.healthCheck}`);
    }
  }
}

main().catch((error) => {
  console.error("dev-all error:", error);
  shutdown(1);
});
