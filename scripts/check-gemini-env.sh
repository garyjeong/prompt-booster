#!/bin/bash

echo "=== Gemini API 환경 변수 진단 ==="
echo ""

# 로컬 환경 확인
if [ -f .env.local ]; then
  echo "✅ .env.local 파일 존재"
  if grep -q "GEMINI_API_KEY" .env.local; then
    KEY_VALUE=$(grep "GEMINI_API_KEY" .env.local | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
    if [ -n "$KEY_VALUE" ]; then
      KEY_LENGTH=${#KEY_VALUE}
      echo "✅ GEMINI_API_KEY 설정됨"
      echo "   키 길이: $KEY_LENGTH 문자"
      echo "   키 시작: ${KEY_VALUE:0:10}..."
      
      # API 키 형식 확인
      if [[ $KEY_VALUE == AIza* ]]; then
        echo "   ✅ 올바른 형식 (AIza로 시작)"
      else
        echo "   ⚠️  경고: 일반적인 Gemini API 키 형식이 아닙니다"
      fi
    else
      echo "❌ GEMINI_API_KEY 값이 비어있음"
    fi
  else
    echo "❌ GEMINI_API_KEY 미설정"
  fi
else
  echo "❌ .env.local 파일 없음"
fi

echo ""
echo "=== Node.js 환경 변수 확인 ==="
if command -v node &> /dev/null; then
  NODE_ENV_CHECK=$(node -e "console.log(process.env.GEMINI_API_KEY ? '설정됨 (' + process.env.GEMINI_API_KEY.length + '자)' : '미설정')" 2>/dev/null)
  echo "Node.js에서: $NODE_ENV_CHECK"
else
  echo "⚠️  Node.js가 설치되어 있지 않습니다"
fi

echo ""
echo "=== 다음 단계 ==="
echo "1. API 키가 없거나 만료된 경우:"
echo "   - https://aistudio.google.com/app/apikey 에서 새 키 발급"
echo "   - .env.local 파일에 GEMINI_API_KEY=your_key 형식으로 추가"
echo ""
echo "2. API 키를 업데이트한 경우:"
echo "   - 개발 서버 재시작 (pnpm dev)"
echo ""
echo "3. Fly.io 배포 환경인 경우:"
echo "   - fly secrets set GEMINI_API_KEY=your_key --app prompt-booster"
echo "   - fly apps restart prompt-booster"
