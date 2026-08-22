#!/usr/bin/env bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "🚀 Starting all Nexa / Ofia services from: $PROJECT_ROOT"

# Trap SIGINT and SIGTERM to kill all background processes gracefully
trap 'echo -e "\n🛑 Shutting down all services..."; kill $(jobs -p) 2>/dev/null || true; exit 0' SIGINT SIGTERM

# 1. service_users (:8081)
echo "📦 [1/5] Starting service_users on port 8081..."
(cd "$PROJECT_ROOT/service_users" && PORT=8081 go run .) &

# 2. service_ai (:8082)
echo "🤖 [2/5] Starting service_ai on port 8082..."
(cd "$PROJECT_ROOT/service_ai" && PORT=8082 go run .) &

# 3. service_marketplace (:8083)
echo "🛒 [3/5] Starting service_marketplace on port 8083..."
(cd "$PROJECT_ROOT/service_marketplace" && PORT=8083 go run .) &

# 4. service_erp (:8084)
echo "🏢 [4/5] Starting service_erp on port 8084..."
(cd "$PROJECT_ROOT/service_erp" && PORT=8084 go run .) &

# 5. service_logistics (:8085)
echo "🚚 [5/5] Starting service_logistics on port 8085..."
(cd "$PROJECT_ROOT/service_logistics" && PORT=8085 go run .) &

# 6. ofia_business (:3000)
echo "🌐 [6/7] Starting ofia_business on port 3000..."
(cd "$PROJECT_ROOT/ofia_business" && npm run dev) &

# 7. ofia_admin (:3001)
echo "🛡️  [7/7] Starting ofia_admin on port 3001..."
(cd "$PROJECT_ROOT/ofia_admin" && npm run dev -- -p 3001) &

echo "✨ All services started! Press Ctrl+C to stop all."
wait
