# Деплой

Деплой происходит автоматически через GitHub Actions при пуше в ветку `master`.

## Как работает

| Что изменилось | Что запускается |
| --- | --- |
| `frontend/**` | workflow `deploy-frontend.yml` |
| `backend/**` | workflow `deploy-backend.yml` |

Ручных команд деплоя нет: достаточно сделать `git push`.

## Релизный поток

1. Подготовить релиз:

```bash
npm run release:prepare
```

Команда:
- поднимает версию в `package.json` и `frontend/package.json`
- добавляет запись в `BUILDS.txt`
- синхронизирует `DEVLOG.md`

2. Закоммитить и запушить:

```bash
git add .
git commit -m "Версия X.X.XXX: краткое описание изменений"
git push
```

## Правила

- Версию увеличивать только через `npm run release:prepare`
- Коммит релиза должен содержать номер версии
- Источник истины по версии: `frontend/package.json`

## Проверка

1. Откройте вкладку **Actions** в GitHub.
2. Убедитесь, что соответствующий workflow завершился успешно.
