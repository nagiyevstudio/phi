# Инструкция по деплою проекта

Проект настроен для автоматической загрузки на FTP-сервер с разделением на два субдомена.

## Структура деплоя

- **Frontend**: `frontend/dist/` → `/phi.nagiyev.com` на FTP
- **Backend**: `backend/` → `/api.phi.nagiyev.com` на FTP

## Команды для деплоя

## План действий по коротким запросам

### "билд/фтп"

1. Собрать фронтенд.
2. Загрузить фронтенд на FTP.

### "фул-пуш"

Полный процесс деплоя с обновлением версии и коммитом изменений.

#### Порядок действий:

1. **Проверить расчет версии и список изменений**

   ```bash
   npm run version:status
   ```

   Команда покажет:
   - последнюю версию из `BUILDS.txt`
   - число коммитов после последнего релиза
   - рекомендуемую следующую версию

2. **Автоматически подготовить релиз**

   ```bash
   npm run release:prepare
   ```

   Команда автоматически:
   - поднимает версию в `package.json` и `frontend/package.json`
   - обновляет `frontend/package-lock.json`
   - добавляет новую запись в `BUILDS.txt` из коммитов после прошлого релиза
   - синхронизирует `DEVLOG.md`

3. **Собрать фронтенд**

   ```bash
   cd frontend
   npm run build
   cd ..
   ```

4. **Загрузить фронтенд на FTP**

   - Фронтенд автоматически загружается после сборки через Vite плагин
   - Или вручную: `npm run deploy:frontend`

5. **Загрузить бэкенд на FTP**

   ```bash
   npm run deploy:backend
   ```

6. **Сделать коммит**

   ```bash
   git add .
   git commit -m "Версия X.X.XXX: краткое описание изменений"
   ```

   - Использовать номер версии из `package.json`
   - Добавить краткое описание основных изменений

7. **Сделать push на git**
   ```bash
   git push
   ```

#### Формат записи в BUILDS.txt (если нужно вручную):

```markdown
## 1.0.XXX

- Date: YYYY-MM-DD
- Status: released
- Changes:
  1. Описание изменения 1
  2. Описание изменения 2
  3. Описание изменения 3
```

#### Важные правила:

- ✅ Всегда проверяйте, что сборка фронтенда прошла успешно перед деплоем
- ✅ Убедитесь, что все изменения протестированы локально
- ✅ Версия должна увеличиваться последовательно (не пропускать номера)
- ✅ Коммит должен содержать номер версии в сообщении
- ✅ После push проверьте, что изменения появились на сервере
- ⚠️ Не коммитьте файл `secrets/ftp.json` (он в `.gitignore`)
- ⚠️ Не коммитьте временные файлы и `node_modules`

### История версий

После каждого "фул-пуш":
- обновляйте `BUILDS.txt` (через `npm run release:prepare`)
- синхронизируйте `DEVLOG.md` (входит в `release:prepare`, можно отдельно `npm run devlog:sync`)

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
    "remoteRoot": "/phi.nagiyev.com",
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
    "remoteRoot": "/api.phi.nagiyev.com",
    "secure": true
  }
}
```

### GitHub Actions (секреты для git deploy)

`/.github/workflows/deploy-frontend.yml`:
- `FRONTEND_FTP_HOST`
- `FRONTEND_FTP_USER`
- `FRONTEND_FTP_PASS`
- `FRONTEND_FTP_PORT` (опционально, обычно `21`)
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
