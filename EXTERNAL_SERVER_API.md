# External Server API

Инструкция для внешнего сервера, который будет работать с существующим API на `https://api.phi.nagiyev.com/api`.

## Как это работает

1. Владелец аккаунта логинится через обычный JWT.
2. Через `POST /api/api-keys` создает ключ для интеграции.
3. Сервис сохраняет ключ у себя и отправляет его в заголовке:

```bash
Authorization: Bearer phi_<prefix>_<secret>
```

Секрет ключа отдается только один раз в момент создания.

## Scope-права

- `operations:read`
- `operations:write`
- `categories:read`
- `categories:write`
- `budgets:read`
- `budgets:write`
- `analytics:read`
- `export:read`
- `profile:read`
- `*`

## Получить JWT владельца

```bash
curl -X POST "https://api.phi.nagiyev.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "your-password"
  }'
```

Из ответа сохранить `data.token`.

## Создать API key

```bash
curl -X POST "https://api.phi.nagiyev.com/api/api-keys" \
  -H "Authorization: Bearer <OWNER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "external-server",
    "scopes": ["operations:read", "operations:write", "categories:read", "analytics:read"],
    "expiresAt": "2026-12-31 23:59:59"
  }'
```

Пример ответа:

```json
{
  "success": true,
  "status": 201,
  "message": "API key created successfully",
  "data": {
    "apiKey": "phi_abc123def456_XXXXXXXXXXXXXXXXXXXXXXXX",
    "apiKeyInfo": {
      "id": "uuid",
      "name": "external-server",
      "maskedKey": "phi_abc123def456_****************",
      "keyPrefix": "abc123def456",
      "scopes": ["analytics:read", "categories:read", "operations:read", "operations:write"],
      "isActive": true,
      "lastUsedAt": null,
      "lastUsedIp": null,
      "expiresAt": "2026-12-31 23:59:59",
      "createdAt": "2026-03-19 00:00:00",
      "updatedAt": "2026-03-19 00:00:00"
    }
  }
}
```

## Список ключей

```bash
curl "https://api.phi.nagiyev.com/api/api-keys" \
  -H "Authorization: Bearer <OWNER_JWT>"
```

## Отозвать ключ

```bash
curl -X DELETE "https://api.phi.nagiyev.com/api/api-keys/<API_KEY_ID>" \
  -H "Authorization: Bearer <OWNER_JWT>"
```

## Использование ключа внешним сервером

### Получить список операций

```bash
curl "https://api.phi.nagiyev.com/api/operations?month=2026-03&page=1&pageSize=100" \
  -H "Authorization: Bearer <API_KEY>"
```

### Создать операцию

```bash
curl -X POST "https://api.phi.nagiyev.com/api/operations" \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amountMinor": 12500,
    "categoryId": "<CATEGORY_ID>",
    "date": "2026-03-19 14:30:00",
    "note": "Server-side import"
  }'
```

### Получить категории

```bash
curl "https://api.phi.nagiyev.com/api/categories?type=expense" \
  -H "Authorization: Bearer <API_KEY>"
```

### Получить бюджет месяца

```bash
curl "https://api.phi.nagiyev.com/api/months/2026-03/budget" \
  -H "Authorization: Bearer <API_KEY>"
```

### Получить аналитику

```bash
curl "https://api.phi.nagiyev.com/api/analytics?month=2026-03" \
  -H "Authorization: Bearer <API_KEY>"
```

### Экспорт

```bash
curl "https://api.phi.nagiyev.com/api/export?format=json&month=2026-03" \
  -H "Authorization: Bearer <API_KEY>" \
  -o phi_export_2026-03.json
```

## Практические рекомендации

- Делай отдельный ключ под каждый внешний сервис.
- Для чтения статистики не выдавай `operations:write`.
- Не используй ключ `*`, если можно выдать узкие scope.
- Храни ключ только на сервере, не во фронтенде.
- При утечке ключа просто отзывай его через `DELETE /api/api-keys/:id`.

# 
