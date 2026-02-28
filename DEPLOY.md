# Деплой

Деплой происходит **автоматически через GitHub Actions** при пуше в ветку `master`.

## Как работает деплой

| Что изменилось | Что деплоится                                  |
| -------------- | ---------------------------------------------- |
| `frontend/**`  | Сборка фронтенда → FTP → `phi.nagiyev.com`     |
| `backend/**`   | Загрузка бэкенда → FTP → `api.phi.nagiyev.com` |

Никаких ручных команд деплоя не требуется — достаточно сделать `git push`.

## Воркфлоу: фул-пуш (релиз)

### 1. Подготовить релиз

```bash
npm run release:prepare
```

Автоматически:

- поднимает версию в `package.json` и `frontend/package.json`
- добавляет запись в `BUILDS.txt` из коммитов после прошлого релиза
- синхронизирует `DEVLOG.md`

Проверить текущий статус версии перед этим:

```bash
npm run version:status
```

### 2. Сделать коммит и запушить

```bash
git add .
git commit -m "Версия X.X.XXX: краткое описание изменений"
git push
```

После пуша GitHub Actions автоматически задеплоит изменившиеся части.

## Правила

- ✅ Версия увеличивается только через `npm run release:prepare`
- ✅ Коммит содержит номер версии в сообщении
- ⚠️ Не коммитьте `secrets/ftp.json` — он в `.gitignore`

> **Источник истины по версии — `frontend/package.json`.**
> Никогда не меняйте вручную без одновременного обновления `BUILDS.txt`.

## GitHub Actions: необходимые секреты

Настраиваются в **Settings → Secrets and variables → Actions** репозитория.

**Frontend** (`.github/workflows/deploy-frontend.yml`):

- `FRONTEND_FTP_HOST`
- `FRONTEND_FTP_USER`
- `FRONTEND_FTP_PASS`
- `FRONTEND_FTP_PORT` (опционально, по умолчанию `21`)
- `FRONTEND_FTP_REMOTE_ROOT`

**Backend** (`.github/workflows/deploy-backend.yml`):

- `BACKEND_FTP_HOST`
- `BACKEND_FTP_USER`
- `BACKEND_FTP_PASS`
- `BACKEND_FTP_PORT` (опционально, по умолчанию `21`)
- `BACKEND_FTP_REMOTE_ROOT`
- `FRONTEND_FTP_REMOTE_ROOT` (для прода: `/phi.nagiyev.com`)

`/.github/workflows/deploy-backend.yml`:

- `BACKEND_FTP_HOST`
- `BACKEND_FTP_USER`
- `BACKEND_FTP_PASS`
- `BACKEND_FTP_PORT` (опционально, обычно `21`)
- `BACKEND_FTP_REMOTE_ROOT` (для прода: `/api.phi.nagiyev.com`)

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
- `.env`
- `deploy.js`
- `ftp-config.example.json`
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
