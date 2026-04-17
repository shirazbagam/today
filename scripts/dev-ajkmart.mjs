#!/usr/bin/env node
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
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

const expoDomain = process.env.EXPO_PUBLIC_DOMAIN;
if (!expoDomain) {
  console.warn(
    "[dev-ajkmart] EXPO_PUBLIC_DOMAIN is not set. ajkmart may not be able to resolve its API URL correctly.",
  );
  console.warn("Set EXPO_PUBLIC_DOMAIN in .env or your shell before running pnpm run dev:ajkmart.");
}

const cwd = path.resolve(rootDir, "artifacts/ajkmart");
const env = {
  ...process.env,
  PORT: process.env.PORT || "5177",
  CI: "1",
  EXPO_PUBLIC_DOMAIN: expoDomain ?? "",
  EXPO_PUBLIC_REPL_ID: process.env.EXPO_PUBLIC_REPL_ID ?? "",
  REACT_NATIVE_PACKAGER_HOSTNAME: expoDomain ?? "localhost",
};

const child = spawn("pnpm", ["dev"], {
  cwd,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});
