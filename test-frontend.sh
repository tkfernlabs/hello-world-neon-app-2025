#!/bin/bash

# Test script for Hello World App Frontend
# This script tests the frontend and its connection to the backend

FRONTEND_URL="https://frontend-morphvm-j9mt3es5.http.cloud.morph.so"
BACKEND_URL="https://backend-morphvm-j9mt3es5.http.cloud.morph.so"

echo "=========================================="
echo "HELLO WORLD APP - FRONTEND TESTING"
echo "=========================================="
echo ""

# Test 1: Frontend Accessibility
echo "Test 1: Testing Frontend Accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✓ Frontend is accessible (HTTP $FRONTEND_RESPONSE)"
else
    echo "✗ Frontend returned HTTP $FRONTEND_RESPONSE"
fi
echo ""

# Test 2: Backend API Status
echo "Test 2: Testing Backend API Status..."
BACKEND_STATUS=$(curl -s "$BACKEND_URL/" | jq -r '.status' 2>/dev/null)
if [ "$BACKEND_STATUS" = "ok" ]; then
    echo "✓ Backend API is running"
    curl -s "$BACKEND_URL/" | jq '.'
else
    echo "✗ Backend API is not responding correctly"
fi
echo ""

# Test 3: Get Hello Message
echo "Test 3: Testing GET /hello endpoint..."
HELLO_MSG=$(curl -s "$BACKEND_URL/hello")
echo "Response: $HELLO_MSG"
if echo "$HELLO_MSG" | jq -e '.message' > /dev/null 2>&1; then
    echo "✓ /hello endpoint working"
else
    echo "✗ /hello endpoint failed"
fi
echo ""

# Test 4: Get All Messages
echo "Test 4: Testing GET /messages endpoint..."
MESSAGES=$(curl -s "$BACKEND_URL/messages")
echo "Response: $MESSAGES"
if echo "$MESSAGES" | jq -e '.messages' > /dev/null 2>&1; then
    MESSAGE_COUNT=$(echo "$MESSAGES" | jq '.messages | length')
    echo "✓ /messages endpoint working (Found $MESSAGE_COUNT messages)"
else
    echo "✗ /messages endpoint failed"
fi
echo ""

# Test 5: Create New Message
echo "Test 5: Testing POST /messages endpoint..."
TEST_MESSAGE="Frontend test at $(date +%Y-%m-%d\ %H:%M:%S)"
CREATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/messages" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$TEST_MESSAGE\"}")
echo "Response: $CREATE_RESPONSE"
if echo "$CREATE_RESPONSE" | jq -e '.message.message' > /dev/null 2>&1; then
    echo "✓ POST /messages endpoint working"
    echo "Created message: $(echo "$CREATE_RESPONSE" | jq -r '.message.message')"
else
    echo "✗ POST /messages endpoint failed"
fi
echo ""

# Test 6: Verify New Message was Created
echo "Test 6: Verifying new message in database..."
UPDATED_MESSAGES=$(curl -s "$BACKEND_URL/messages")
UPDATED_COUNT=$(echo "$UPDATED_MESSAGES" | jq '.messages | length')
if [ "$UPDATED_COUNT" -gt "$MESSAGE_COUNT" ]; then
    echo "✓ New message was successfully added to database"
    echo "Previous count: $MESSAGE_COUNT, New count: $UPDATED_COUNT"
else
    echo "✗ Message count didn't increase"
fi
echo ""

# Test 7: Health Check
echo "Test 7: Testing /health endpoint..."
HEALTH=$(curl -s "$BACKEND_URL/health")
echo "Response: $HEALTH"
if echo "$HEALTH" | jq -e '.status' > /dev/null 2>&1; then
    echo "✓ /health endpoint working"
else
    echo "✗ /health endpoint failed"
fi
echo ""

# Test 8: Frontend HTML Content
echo "Test 8: Checking Frontend HTML content..."
FRONTEND_HTML=$(curl -s "$FRONTEND_URL")
if echo "$FRONTEND_HTML" | grep -q "Hello World App"; then
    echo "✓ Frontend HTML contains expected title"
else
    echo "✗ Frontend HTML missing expected content"
fi
if echo "$FRONTEND_HTML" | grep -q "Full Stack Application"; then
    echo "✓ Frontend HTML contains full description"
else
    echo "✗ Frontend HTML missing description"
fi
echo ""

# Test 9: Check for API URL in Frontend
echo "Test 9: Verifying backend API URL is configured in frontend..."
if echo "$FRONTEND_HTML" | grep -q "backend-morphvm"; then
    echo "✓ Frontend appears to reference backend URL"
else
    echo "Note: Backend URL reference not visible in static HTML (expected in JS)"
fi
echo ""

# Summary
echo "=========================================="
echo "TESTING COMPLETE"
echo "=========================================="
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo ""
echo "You can now:"
echo "1. Open the frontend in your browser: $FRONTEND_URL"
echo "2. The app should display messages from the backend"
echo "3. You should be able to create new messages via the UI"
echo ""

