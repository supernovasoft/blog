# Makefile for React project

# Default target
all: start

# Start the development server
start:
	npm start

# Build the production version
build:
	npm run build

# Run tests
test:
	npm test

# Deploy to GitHub Pages
deploy:
	npm run deploy
