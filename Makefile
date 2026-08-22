.PHONY: help build build-backend build-frontend start dev clean test

help:
	@echo "Available commands:"
	@echo "  make build          - Build all 5 Go microservices and 2 Next.js apps"
	@echo "  make build-backend  - Build all 5 Go backend microservices"
	@echo "  make build-frontend - Build ofia_business and ofia_admin"
	@echo "  make dev            - Start all 5 Go microservices and Next.js frontends in dev mode"
	@echo "  make start          - Start compiled microservices in background"
	@echo "  make clean          - Remove compiled binaries and build artifacts"

build: build-backend build-frontend

build-backend:
	@echo "🔨 Building service_users (:8081)..."
	@cd service_users && go build -o bin/user_service .
	@echo "🔨 Building service_ai (:8082)..."
	@cd service_ai && go build -o bin/ai_service .
	@echo "🔨 Building service_marketplace (:8083)..."
	@cd service_marketplace && go build -o bin/marketplace_service .
	@echo "🔨 Building service_erp (:8084)..."
	@cd service_erp && go build -o bin/erp_service .
	@echo "🔨 Building service_logistics (:8085)..."
	@cd service_logistics && go build -o bin/logistics_service .
	@echo "✅ All 5 Go microservices built successfully!"

build-frontend:
	@echo "🔨 Building ofia_business (:3000)..."
	@cd ofia_business && npm run build
	@echo "🔨 Building ofia_admin (:3001)..."
	@cd ofia_admin && npm run build
	@echo "✅ Both frontend apps built successfully!"

dev:
	@echo "🚀 Launching all services in development mode..."
	@./scripts/start_all.sh

clean:
	@rm -rf service_users/bin service_ai/bin service_marketplace/bin service_erp/bin service_logistics/bin
	@echo "🧹 Cleaned compiled binaries."
