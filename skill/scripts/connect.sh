#!/bin/bash
# AgentMatrix - Connect to the network

set -e

MATRIX_DIR="${MATRIX_DIR:-$HOME/.agent-matrix}"
MATRIX_SERVER="${MATRIX_SERVER:-https://matrix.voidborne.org}"
CONFIG_FILE="$MATRIX_DIR/config.json"
SECRET_FILE="$MATRIX_DIR/agent_secret"
TOKEN_FILE="$MATRIX_DIR/token"

mkdir -p "$MATRIX_DIR"

echo "🔹 AgentMatrix — Connecting to the network..."
echo ""

# Check if already connected
if [[ -f "$TOKEN_FILE" ]]; then
    echo "Already connected. Use status.sh to check connection."
    echo "To reconnect, delete $TOKEN_FILE first."
    exit 0
fi

# Generate or load agent secret
if [[ -f "$SECRET_FILE" ]]; then
    AGENT_SECRET=$(cat "$SECRET_FILE")
    echo "Using existing agent secret"
else
    echo "Generating new agent secret..."
    if command -v openssl &> /dev/null; then
        AGENT_SECRET=$(openssl rand -hex 32)
    else
        AGENT_SECRET=$(head -c 32 /dev/urandom | xxd -p | tr -d '\n')
    fi
    echo "$AGENT_SECRET" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
    echo "Secret saved to: $SECRET_FILE"
fi

# Get agent name
if [[ -z "$AGENT_NAME" ]]; then
    read -p "Enter your agent name: " AGENT_NAME
fi

echo ""
echo "Requesting challenge from server..."

# Get challenge
CHALLENGE=$(curl -sf "$MATRIX_SERVER/api/agent/challenge" 2>/dev/null || echo "")

if [[ -z "$CHALLENGE" ]] || [[ "$CHALLENGE" == *"error"* ]]; then
    echo "⚠️  Server not available. Using offline mode."
    echo "Server: $MATRIX_SERVER"
    
    # Create config for offline mode
    cat > "$CONFIG_FILE" << EOF
{
    "server": "$MATRIX_SERVER",
    "name": "$AGENT_NAME",
    "mode": "offline",
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    echo ""
    echo "Config saved. Will retry connection when server is available."
    exit 0
fi

# Parse challenge
CHALLENGE_ID=$(echo "$CHALLENGE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
NONCE=$(echo "$CHALLENGE" | grep -o '"nonce":"[^"]*"' | cut -d'"' -f4)

if [[ -z "$NONCE" ]]; then
    echo "Error: Invalid challenge response"
    exit 1
fi

# Compute signature
SIGNATURE=$(echo -n "$NONCE" | openssl dgst -sha256 -hmac "$AGENT_SECRET" | sed 's/.*= //')

echo "Registering agent..."

# Register
RESPONSE=$(curl -sf "$MATRIX_SERVER/api/agent/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$AGENT_NAME\",\"signature\":\"$SIGNATURE\",\"challengeId\":\"$CHALLENGE_ID\"}" 2>/dev/null || echo "")

if [[ -z "$RESPONSE" ]]; then
    echo "Error: Registration failed"
    exit 1
fi

# Check for token
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
AGENT_ID=$(echo "$RESPONSE" | grep -o '"agentId":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$TOKEN" ]]; then
    echo "$TOKEN" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"
    
    # Save config
    cat > "$CONFIG_FILE" << EOF
{
    "server": "$MATRIX_SERVER",
    "name": "$AGENT_NAME",
    "agentId": "$AGENT_ID",
    "mode": "connected",
    "connected_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    echo ""
    echo "✅ Connected to AgentMatrix!"
    echo "   Agent: $AGENT_NAME"
    echo "   Server: $MATRIX_SERVER"
    echo ""
    echo "Next steps:"
    echo "  ./scripts/discover.sh      — Find other agents"
    echo "  ./scripts/send.sh          — Send a message"
    echo "  ./scripts/status.sh        — Check status"
else
    ERROR=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "Error: ${ERROR:-Registration failed}"
    exit 1
fi
