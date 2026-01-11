#!/bin/bash

source ../../.config/.env.development.local

echo ">> User should be able to get a nip98 token"
# http POST localhost:5173/api/nip98-token "Authorization: Nostr $(nak event --kind 27235 --tag u='http://localhost:5173/api/nip98-token' --tag method='POST' | base64 -w 0)" | jq # here we need to save .tokenData.tokenValue into a variable
tokenResponse=$(http POST localhost:5173/api/nip98-token "Authorization: Nostr $(nak event --kind 27235 --tag u='http://localhost:5173/api/nip98-token' --tag method='POST' | base64 -w 0)")
# Extract `tokenValue` from the JSON response
tokenValue=$(echo "$tokenResponse" | jq -r '.tokenData.tokenValue')

echo "Token Value: $tokenValue"

echo ">> Nakama server should be able to retrieve a nip98 token"
http GET localhost:5173/api/nip98-token/$tokenValue "Authorization: Bearer ${IPC_SECRET}"