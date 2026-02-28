# PHI - Веб-приложение учета расходов/доходов

Веб-приложение для учета расходов и доходов с контролем месячного бюджета и расчетом дневного лимита.

## Технологии

### Backend
- PHP 8.x (чистый PHP + PDO)
- MySQL 5.7+ / MariaDB 10.2+
- JWT для аутентификации
- REST API

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Recharts (графики)
- React Hook Form + Zod (валидация форм)

## Структура проекта

```
PHI/
├── backend/              # PHP Backend API
│   ├── api/             # API endpoints
│   ├── config/          # Конфигурация
│   ├── models/          # Модели данных
│   ├── utils/           # Утилиты
│   └── index.php        # Точка входа
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   ├── services/    # API клиент
│   │   └── store/       # Состояние приложения
│   └── package.json
├── database/            # SQL миграции
│   ├── migrations/      # Отдельные миграции
│   └── schema.sql       # Полная схема БД
└── README.md
```

## Установка и настройка

### Требования

- PHP 8.0 или выше
- MySQL 5.7+ или MariaDB 10.2+
- Node.js 18 или выше
- npm или yarn

### Backend

1. Скопируйте `.env.example` в `.env` в папке `backend/`:

```bash
cd backend
cp .env.example .env
```

2. Настройте переменные окружения в `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=phi
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-very-secret-key-change-in-production
```

3. Создайте базу данных MySQL:

```sql
CREATE DATABASE phi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Выполните миграции:

```bash
php utils/migrate.php
```

Или выполните полную схему:

```bash
mysql -u root -p phi < ../database/schema.sql
```

5. Настройте веб-сервер (Apache/Nginx) для обслуживания `backend/` через точку входа `index.php`.

**Для Apache:** Убедитесь, что включен модуль `mod_rewrite` и файл `.htaccess` используется.

**Для Nginx:** Пример конфигурации:

```nginx
location /api {
    try_files $uri $uri/ /backend/index.php?$query_string;
}
```

### Frontend

1. Перейдите в папку `frontend/`:

```bash
cd frontend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` (опционально):

```env
VITE_API_BASE_URL=http://localhost/api
```

4. Запустите dev сервер:

```bash
npm run dev
```

5. Для production сборки:

```bash
npm run build
```

Собранные файлы будут в папке `dist/`, их можно разместить на веб-сервере.

## Использование

### Регистрация и вход

1. Откройте приложение в браузере
2. Зарегистрируйтесь, указав email и пароль (минимум 8 символов)
3. После регистрации вы автоматически войдете в систему

### Основной функционал

#### Установка бюджета

1. На главной странице выберите месяц
2. Нажмите "Установить бюджет"
3. Введите сумму бюджета на месяц

#### Добавление операций

1. Нажмите "+ Добавить операцию"
2. Выберите тип (расход/доход)
3. Укажите сумму, категорию, дату и заметку
4. Сохраните операцию

#### Управление категориями

1. Перейдите на страницу "Категории"
2. Выберите вкладку "Расходы" или "Доходы"
3. Добавьте новую категорию или отредактируйте существующую
4. Можно архивировать категории (используемые категории не удаляются)

#### Аналитика

1. Перейдите на страницу "Аналитика"
2. Выберите месяц для анализа
3. Просматривайте:
   - Расходы по категориям (диаграмма)
   - Расходы по дням (график)
   - Общие итоги (доходы, расходы, итого)

#### Экспорт данных

1. Перейдите на страницу "Настройки"
2. Выберите месяц или "Все данные"
3. Нажмите "Экспорт JSON" или "Экспорт CSV"

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/me` - Профиль текущего пользователя

### Бюджеты

- `GET /api/months/:month/budget` - Получить бюджет месяца
- `PUT /api/months/:month/budget` - Установить/обновить бюджет

### Операции

- `GET /api/operations` - Список операций (с фильтрами и пагинацией)
- `GET /api/operations/:id` - Получить операцию
- `POST /api/operations` - Создать операцию
- `PUT /api/operations/:id` - Обновить операцию
- `DELETE /api/operations/:id` - Удалить операцию

### Категории

- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить категорию
- `PATCH /api/categories/:id/archive` - Архивировать категорию

### Аналитика

- `GET /api/analytics?month=YYYY-MM` - Аналитика за месяц

### Экспорт

- `GET /api/export/json?month=YYYY-MM` - Экспорт в JSON
- `GET /api/export/csv?month=YYYY-MM` - Экспорт в CSV

## Формулы расчетов

### Остаток бюджета
```
remaining = planned - expenseSum
```

### Оставшиеся дни месяца
- Для текущего месяца: `daysLeft = (lastDayOfMonth - today) + 1`
- Для прошлого месяца: `daysLeft = 0`
- Для будущего месяца: `daysLeft = количество дней в месяце`

### Дневной лимит
```
dailyLimit = max(0, remaining) / max(1, daysLeft)
```

## Развертывание

### Production Backend

1. Настройте переменные окружения в `.env`
2. Установите правильный `JWT_SECRET` (сгенерируйте случайную строку)
3. Убедитесь, что база данных настроена и миграции выполнены
4. Настройте веб-сервер для обслуживания `backend/`
5. Включите HTTPS
6. Настройте CORS для домена frontend

### Production Frontend

1. Соберите проект: `npm run build`
2. Разместите содержимое папки `dist/` на веб-сервере
3. Настройте proxy для `/api` запросов на backend сервер
4. Или настройте переменную окружения `VITE_API_BASE_URL` на полный URL backend

### Автодеплой

Деплой выполняется автоматически при `git push` в ветку `master` через GitHub Actions.
Подробности и релизный поток: `DEPLOY.md`.

## Безопасность

- Пароли хешируются с использованием bcrypt
- JWT токены используются для аутентификации
- Все запросы к данным пользователя проверяются на права доступа
- Валидация данных на стороне сервера
- SQL injection защита через PDO prepared statements

## Лицензия

MIT

## Автор

Разработано согласно ТЗ от 21.12.2025
