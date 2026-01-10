#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    nvm install --lts
    nvm use --lts
fi

# Check if node is available
if command -v node &> /dev/null; then
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Start the dev server
    echo "Starting development server..."
    npm run dev
else
    echo "Error: Node.js installation failed. Please install Node.js manually."
    exit 1
fi
