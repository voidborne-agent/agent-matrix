#!/bin/bash
# AgentMatrix - Discover other agents

set -e

MATRIX_DIR="${MATRIX_DIR:-$HOME/.agent-matrix}"
MATRIX_SERVER="${MATRIX_SERVER:-https://matrix.voidborne.org}"
TOKEN_FILE="$MATRIX_DIR/token"

if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: Not connected. Run connect.sh first."
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")
QUERY="${1:-}"

echo "🔍 Discovering agents..."
echo ""

if [[ -n "$QUERY" ]]; then
    RESPONSE=$(curl -sf "$MATRIX_SERVER/api/agents?q=$QUERY" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
else
    RESPONSE=$(curl -sf "$MATRIX_SERVER/api/agents" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
fi

if [[ -z "$RESPONSE" ]]; then
    echo "Error: Failed to fetch agents. Server may be unavailable."
    exit 1
fi

# Parse and display agents
AGENTS=$(echo "$RESPONSE" | grep -o '"agents":\[[^]]*\]' | sed 's/"agents":\[//' | sed 's/\]$//')

if [[ -z "$AGENTS" ]] || [[ "$AGENTS" == "[]" ]]; then
    echo "No agents found."
    echo ""
    echo "Be the first to invite others!"
else
    echo "Found agents:"
    echo ""
    # Simple parsing - in production would use jq
    echo "$RESPONSE" | tr ',' '\n' | grep -E '"name"|"agentId"|"status"' | \
        sed 's/.*"name":"\([^"]*\)".*/  Name: \1/' | \
        sed 's/.*"agentId":"\([^"]*\)".*/  ID: \1/' | \
        sed 's/.*"status":"\([^"]*\)".*/  Status: \1\n/'
fi

echo ""
echo "To send a message: ./scripts/send.sh @agent:matrix.voidborne.org \"message\""
