SHELL:=/bin/bash

.PHONY: help build start development-server

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install-deps:
	@npm install

build: ## Build production package
	@/bin/bash -c '( test -e .env && source .env || true ) && npx nuxt-ts generate'

development-server: ## Start development server
	@/bin/bash -c 'source .env && npx nuxt-ts'

lint: ## Lint project files
	@/bin/bash -c 'npm run lint'

start: ## Start production server
	@/bin/bash -c 'source .env && npx nuxt-ts start'
