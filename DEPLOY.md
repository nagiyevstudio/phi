# Инструкция по деплою проекта

Проект настроен для автоматической загрузки на FTP-сервер с разделением на два субдомена.

## Структура деплоя

- **Frontend**: `frontend/dist/` → `/finance.nagiyev.com` на FTP
- **Backend**: `backend/` → `/api.nagiyev.com` на FTP

## Команды для деплоя

## План действий по коротким запросам

### "билд/фтп"
1. Собрать фронтенд.
2. Загрузить фронтенд на FTP.

### "фул-пуш"
1. Собрать фронтенд.
2. Загрузить фронтенд на FTP.
3. Загрузить бэкенд на FTP.
4. Обновить версию приложения.
5. Добавить запись в `BUILDS.txt` (Markdown формат).
6. Сделать коммит с текстом версии.
7. Сделать push на git.

### История версий
После каждого "фул-пуш" обновляйте `BUILDS.txt` в Markdown формате.

```md
## 1.0.004
- Date: 2025-03-17
- Status: released
- Changes:
  1. Short description of the change.
```

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

Файл: `secrets/ftp.json` (секция `frontend`)

```json
{
  "frontend": {
    "host": "your-ftp-host.com",
    "user": "your-username",
    "password": "your-password",
    "port": 21,
    "localRoot": "./dist",
    "remoteRoot": "/finance.nagiyev.com",
    "secure": true
  }
}
```

### Backend

Файл: `secrets/ftp.json` (секция `backend`)

```json
{
  "backend": {
    "host": "your-ftp-host.com",
    "user": "your-username",
    "password": "your-password",
    "port": 21,
    "localRoot": ".",
    "remoteRoot": "/api.nagiyev.com",
    "secure": true
  }
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

⚠️ **Важно:** Файл `secrets/ftp.json` содержит чувствительные данные и добавлен в `.gitignore`. Он не будет коммититься в репозиторий.

## Устранение проблем

### Ошибка подключения к FTP

1. Проверьте правильность данных в `secrets/ftp.json`
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

