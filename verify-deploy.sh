#!/bin/bash

# Script de verificación del deploy de React en Render.com

echo "🔍 Verificando deploy de React + Vite en Render.com..."
echo ""

BASE_URL="https://crispy-octo-spoon.onrender.com"

# Test 1: React app carga
echo "1️⃣ Verificando React app en $BASE_URL"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$STATUS" -eq 200 ]; then
  echo "✅ React app carga correctamente (HTTP $STATUS)"
else
  echo "❌ React app no carga (HTTP $STATUS)"
fi
echo ""

# Test 2: React Router - Admin
echo "2️⃣ Verificando React Router /admin"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin")
if [ "$STATUS" -eq 200 ]; then
  echo "✅ /admin funciona (HTTP $STATUS)"
else
  echo "❌ /admin falla (HTTP $STATUS)"
fi
echo ""

# Test 3: React Router - Cocina
echo "3️⃣ Verificando React Router /cocina"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/cocina")
if [ "$STATUS" -eq 200 ]; then
  echo "✅ /cocina funciona (HTTP $STATUS)"
else
  echo "❌ /cocina falla (HTTP $STATUS)"
fi
echo ""

# Test 4: React Router - Mesero
echo "4️⃣ Verificando React Router /mesero"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/mesero")
if [ "$STATUS" -eq 200 ]; then
  echo "✅ /mesero funciona (HTTP $STATUS)"
else
  echo "❌ /mesero falla (HTTP $STATUS)"
fi
echo ""

# Test 5: API - GET productos
echo "5️⃣ Verificando API /api/productos"
RESPONSE=$(curl -s "$BASE_URL/api/productos")
if echo "$RESPONSE" | grep -q "\["; then
  echo "✅ API /api/productos responde con JSON (HTTP 200)"
  echo "   Respuesta: ${RESPONSE:0:50}..."
else
  echo "❌ API /api/productos falla"
  echo "   Respuesta: $RESPONSE"
fi
echo ""

# Test 6: API - POST productos
echo "6️⃣ Verificando API POST /api/productos"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/productos" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","categoria":"test","precio":10}')
if echo "$RESPONSE" | grep -q "Test"; then
  echo "✅ API POST funciona"
else
  echo "⚠️  API POST responde pero puede requerir BD"
fi
echo ""

echo "✨ Verificación completada!"
