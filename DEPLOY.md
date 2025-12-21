# Инструкция по деплою проекта

Проект настроен для автоматической загрузки на FTP-сервер с разделением на два субдомена.

## Структура деплоя

- **Frontend**: `frontend/dist/` → `/finance.nagiyev.com` на FTP
- **Backend**: `backend/` → `/api.nagiyev.com` на FTP

## Команды для деплоя

### Деплой всего проекта (рекомендуется)

```bash
npm run deploy:all
```

Эта команда:
1. Соберет фронтенд (`npm run build` в `frontend/`)
2. Автоматически загрузит фронтенд на FTP (через плагин Vite)
3. Загрузит бэкенд на FTP

### Деплой только фронтенда

```bash
npm run deploy:frontend
# или
npm run build
```

Фронтенд автоматически загружается на FTP после успешной сборки.

### Деплой только бэкенда

```bash
npm run deploy:backend
```

## Конфигурация

### Frontend

Файл: `frontend/ftp-config.json`

```json
{
  "host": "ftps26.us.cloudlogin.co",
  "user": "alterace",
  "password": "8800044",
  "port": 21,
  "localRoot": "./dist",
  "remoteRoot": "/finance.nagiyev.com",
  "secure": true
}
```

### Backend

Файл: `backend/ftp-config.json`

```json
{
  "host": "ftps26.us.cloudlogin.co",
  "user": "alterace",
  "password": "8800044",
  "port": 21,
  "localRoot": ".",
  "remoteRoot": "/api.nagiyev.com",
  "secure": true
}
```

## Исключаемые файлы

### Frontend
- `.git/**`
- `.gitignore`
- `.DS_Store`
- `node_modules/**`

### Backend
- `.git/**`
- `.gitignore`
- `.DS_Store`
- `node_modules/**`
- `vendor/**`
- `error.log`
- `test-connection.php`
- `config-example.txt`

## Безопасность

⚠️ **Важно:** Файлы `ftp-config.json` содержат чувствительные данные и добавлены в `.gitignore`. Они не будут коммититься в репозиторий.

## Устранение проблем

### Ошибка подключения к FTP

1. Проверьте правильность данных в `ftp-config.json`
2. Убедитесь, что сервер доступен
3. Проверьте настройки файрвола

### Файлы не загружаются

1. Убедитесь, что папка `frontend/dist/` существует (для фронтенда)
2. Проверьте, что пути `remoteRoot` правильные
3. Проверьте права доступа на FTP-сервере

### Модуль ftp-deploy не найден

Установите зависимости:
```bash
npm install
```

