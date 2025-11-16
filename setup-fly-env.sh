#!/bin/bash

# Fly.io 환경 변수 설정 스크립트
# 사용법: ./setup-fly-env.sh [GEMINI_API_KEY]

set -e

APP_NAME="prompt-booster"

echo "🚀 Fly.io 환경 변수 설정 시작..."

# NEXTAUTH_SECRET 생성
echo "📝 NEXTAUTH_SECRET 생성 중..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ NEXTAUTH_SECRET 생성 완료"

# NEXTAUTH_URL 설정
NEXTAUTH_URL="https://prompt-booster.fly.dev"

# NEXTAUTH_SECRET 설정
echo "🔐 NEXTAUTH_SECRET 설정 중..."
fly secrets set NEXTAUTH_SECRET="$NEXTAUTH_SECRET" --app "$APP_NAME"

# NEXTAUTH_URL 설정
echo "🌐 NEXTAUTH_URL 설정 중..."
fly secrets set NEXTAUTH_URL="$NEXTAUTH_URL" --app "$APP_NAME"

# GEMINI_API_KEY 설정 (인자로 전달된 경우)
if [ -n "$1" ]; then
  echo "🔑 GEMINI_API_KEY 설정 중..."
  fly secrets set GEMINI_API_KEY="$1" --app "$APP_NAME"
  echo "✅ GEMINI_API_KEY 설정 완료"
else
  echo "⚠️  GEMINI_API_KEY가 제공되지 않았습니다."
  echo "   다음 명령어로 별도로 설정하세요:"
  echo "   fly secrets set GEMINI_API_KEY=your_api_key --app $APP_NAME"
fi

echo ""
echo "✅ 환경 변수 설정 완료!"
echo ""
echo "📋 설정된 환경 변수:"
fly secrets list --app "$APP_NAME"

echo ""
echo "🔄 앱을 재시작하세요:"
echo "   fly apps restart $APP_NAME"

