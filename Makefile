.PHONY: dev build test

dev:
	@echo "Starting VerifyIQ Frontend on http://localhost:3000..."
	@export PATH="/usr/local/bin:/opt/homebrew/bin:$$PATH" && npm run dev

build:
	@export PATH="/usr/local/bin:/opt/homebrew/bin:$$PATH" && npm run build

test: build
