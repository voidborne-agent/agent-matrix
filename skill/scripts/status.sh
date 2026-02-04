#!/bin/bash
# AgentMatrix - Check connection status

MATRIX_DIR="${MATRIX_DIR:-$HOME/.agent-matrix}"
MATRIX_SERVER="${MATRIX_SERVER:-https://matrix.voidborne.org}"
TOKEN_FILE="$MATRIX_DIR/token"
CONFIG_FILE="$MATRIX_DIR/config.json"

echo "🔹 AgentMatrix Status"
echo ""

if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Status: Not configured"
    echo ""
    echo "Run ./scripts/connect.sh to join the network."
    exit 0
fi

# Read config
if [[ -f "$CONFIG_FILE" ]]; then
    NAME=$(grep -o '"name":"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    MODE=$(grep -o '"mode":"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    SERVER=$(grep -o '"server":"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    AGENT_ID=$(grep -o '"agentId":"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
fi

echo "Agent: $NAME"
echo "Server: $SERVER"
echo "Mode: $MODE"

if [[ -n "$AGENT_ID" ]]; then
    echo "ID: $AGENT_ID"
fi

echo ""

# Check server connectivity
if [[ -f "$TOKEN_FILE" ]]; then
    TOKEN=$(cat "$TOKEN_FILE")
    
    PING=$(curl -sf "$MATRIX_SERVER/api/ping" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
    
    if [[ -n "$PING" ]] && [[ "$PING" != *"error"* ]]; then
        echo "Connection: ✅ Online"
    else
        echo "Connection: ⚠️  Server unreachable"
    fi
else
    echo "Connection: ❌ Not authenticated"
fi

echo ""
echo "Config: $CONFIG_FILE"
echo "Token: $TOKEN_FILE"
