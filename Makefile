.DEFAULT_GOAL := help
.PHONY: help install dev build start lint typecheck test coverage check

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies from the lockfile
	bun install --frozen-lockfile

dev: ## Start the Next.js development server
	bun run dev

build: ## Build the production bundle
	bun run build

start: ## Serve the production bundle
	bun run start

lint: ## Check formatting, lint, and imports
	bun run check

typecheck: ## Generate route types and check TypeScript
	bun run typecheck

test: ## Run unit tests
	bun run test

coverage: ## Run tests with coverage thresholds
	bun run test:coverage

check: lint typecheck coverage ## Run the frontend quality checks
