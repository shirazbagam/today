#!/bin/bash
pnpm install
cd artifacts/api-server && pnpm run dev &
cd artifacts/admin && pnpm run dev &
cd artifacts/vendor-app && pnpm run dev &
cd artifacts/rider-app && pnpm run dev &
wait
