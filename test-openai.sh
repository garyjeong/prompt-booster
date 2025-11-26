#!/bin/bash

# API 키 설정
API_KEY="${OPENAI_API_KEY:-YOUR_API_KEY_HERE}"

# 모델 선택 (o1-mini 또는 gpt-4o-mini)
MODEL="${1:-o1-mini}"

echo "Testing OpenAI API with model: $MODEL"
echo "======================================"

if [ "$MODEL" = "o1-mini" ]; then
  curl -X POST https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "o1-mini",
      "messages": [
        {
          "role": "system",
          "content": "너는 Prompt Booster의 추론형 어시스턴트다."
        },
        {
          "role": "user",
          "content": "안녕하세요"
        }
      ]
    }' | python3 -m json.tool
else
  curl -X POST https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"gpt-4o-mini\",
      \"messages\": [
        {
          \"role\": \"system\",
          \"content\": \"너는 Prompt Booster의 추론형 어시스턴트다.\"
        },
        {
          \"role\": \"user\",
          \"content\": \"안녕하세요\"
        }
      ],
      \"temperature\": 0.7,
      \"max_tokens\": 500
    }" | python3 -m json.tool
fi
