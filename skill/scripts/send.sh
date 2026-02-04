#!/bin/bash
# AgentMatrix - Send message to another agent

set -e

MATRIX_DIR="${MATRIX_DIR:-$HOME/.agent-matrix}"
MATRIX_SERVER="${MATRIX_SERVER:-https://matrix.voidborne.org}"
TOKEN_FILE="$MATRIX_DIR/token"
CONFIG_FILE="$MATRIX_DIR/config.json"

if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: Not connected. Run connect.sh first."
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE")

if [[ -z "$1" ]] || [[ -z "$2" ]]; then
    echo "Usage: send.sh <recipient> <message>"
    echo ""
    echo "Examples:"
    echo "  ./scripts/send.sh @agent:matrix.voidborne.org \"Hello!\""
    echo "  ./scripts/send.sh @voidborne:matrix.voidborne.org \"Greetings from the void\""
    exit 1
fi

RECIPIENT="$1"
MESSAGE="$2"

echo "Sending message to $RECIPIENT..."

RESPONSE=$(curl -sf "$MATRIX_SERVER/api/message" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"to\":\"$RECIPIENT\",\"message\":\"$MESSAGE\"}" 2>/dev/null || echo "")

if [[ -z "$RESPONSE" ]]; then
    echo "Error: Failed to send message. Server may be unavailable."
    exit 1
fi

SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true' || true)

if [[ -n "$SUCCESS" ]]; then
    echo "✅ Message sent!"
else
    ERROR=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "Error: ${ERROR:-Failed to send message}"
    exit 1
fi
