COMPOSE_FILE := docker-compose.yml
PROJECT_NAME := kamaji
WATCH_PLATFORM ?= gtr4

RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
NC=\033[0m

.PHONY: help build up down logs restart clean deep-clean test lint docs check-env \
         build-watch emulate-watch watch-logs companion-shell

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make ${YELLOW}<target>${NC}\n\nTargets:\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  ${YELLOW}%-20s${NC} %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

check-env:
	@which docker >/dev/null || (echo "${RED}Docker not found. Please install Docker.${NC}" && exit 1)
	@which docker-compose >/dev/null || (echo "${RED}docker-compose not found. Please install Docker Compose.${NC}" && exit 1)
	@echo "${GREEN}✓ Docker environment verified${NC}"

build: check-env
	@echo "${YELLOW}Building containers...${NC}"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build --no-cache
	@echo "${GREEN}✓ Build complete${NC}"

up: check-env
	@echo "${YELLOW}Starting services...${NC}"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d
	@echo "${GREEN}✓ Services running at http://localhost:3000${NC}"

down:
	@echo "${YELLOW}Stopping services...${NC}"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down
	@echo "${GREEN}✓ Services stopped${NC}"

logs:
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f

restart: down up

clean:
	@echo "${YELLOW}Cleaning up...${NC}"
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) rm -f
	@echo "${GREEN}✓ Clean complete${NC}"

deep-clean: clean
	@echo "${YELLOW}Deep cleaning...${NC}"
	@docker system prune -f --volumes
	@rm -rf companion-app/node_modules companion-app/dist
	@rm -f kamaji_architecture.png
	@echo "${GREEN}✓ Deep clean complete${NC}"

test:
	@echo "${YELLOW}Running tests...${NC}"
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) run companion-app npm test

lint:
	@echo "${YELLOW}Linting code...${NC}"
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) run companion-app npm run lint

docs:
	@echo "${YELLOW}Generating documentation...${NC}"
	@python helper/architecture.py
	@echo "${GREEN}✓ Architecture diagram generated: kamaji_architecture.png${NC}"

build-watch:
	@echo "${YELLOW}Building watch app for ${WATCH_PLATFORM}...${NC}"
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) run watch-app zeus build --platform $(WATCH_PLATFORM)

emulate-watch:
	@echo "${YELLOW}Starting emulator for ${WATCH_PLATFORM}...${NC}"
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) run watch-app zeus preview --platform $(WATCH_PLATFORM)

watch-logs:
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs watch-app

companion-shell:
	@docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec companion-app sh