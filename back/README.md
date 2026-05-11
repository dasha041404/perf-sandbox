# Backend (`back/`)

REST API на FastAPI с SQLite через SQLAlchemy. Код приложения — пакет `src/` в корне этой папки.

## Требования

- Python **3.11+**
- (опционально) Docker — для запуска через `docker compose` с постоянным томом для файла БД

## Локальное окружение

Все команды ниже выполняйте из каталога **`back/`**.

### 1. Виртуальное окружение

**Windows (PowerShell):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Установка зависимостей

Проект и инструменты разработки (тесты, линтеры, сборка):

```bash
pip install --upgrade pip
pip install -e ".[dev]"
```

По умолчанию SQLite использует файл `./data/local.db` (каталог `data/` создаётся при старте). Чтобы указать другой URL, задайте переменную окружения `DATABASE_URL` или создайте файл `.env` в `back/` с той же переменной. Для быстрых интеграционных проверок в памяти: `DATABASE_URL=sqlite:///:memory:`.

Если вы меняли модель таблицы `experiments`, удалите `./data/local.db`, чтобы SQLite создала таблицу заново (пока миграций Alembic нет).

### Ручки `/experiments`

- `GET /experiments?limit=&offset=` — список с пагинацией; ответ: `items`, `total`, `limit`, `offset`. Параметры: `limit` от 1 до 500, `offset` ≥ 0.
- `POST /experiments` — создание записи; в теле JSON: `engine` (один из Handlebars, Mustache, EJS, Pug, Nunjucks, Liquid), `input_template`, `input_data` (JSON-объект или массив), `output`, `execution_time` (секунды, ≥ 0), `data` (дата эксперимента, ISO `YYYY-MM-DD`).
- `DELETE /experiments/{id}` — удаление записи по `id`; при успехе возвращает `204 No Content`, если запись не найдена — `404 Not Found`.

### Ручка `GET /list_templates`

Транспиляция шаблона через [OpenRouter](https://openrouter.ai): query-параметры `engines` (список движков через запятую без пробелов, как в `TemplateEngine`), `input_engine`, `input_template`. Ответ — JSON-объект `{ "<движок>": "<строка шаблона>", ... }`.

Нужна переменная окружения **`OPENROUTER_API_KEY`** (или запись в `.env` в `back/`); ключ в репозиторий не коммитить. В Docker можно передать ту же переменную в окружение сервиса `api` (см. `docker-compose.api.yml`).

## Запуск локально

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Документация OpenAPI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Сборка дистрибутива

Нужен пакет `build` (уже входит в `[dev]`):

```bash
python -m build
```

Артефакты появятся в каталоге `dist/` (sdist и wheel).

## Тесты

```bash
pytest
```

Подробный вывод: `pytest -v`.

## Линтеры и проверка типов

**Ruff** (ошибки и импорты):

```bash
ruff check src tests
```

**Ruff** (проверка форматирования без изменений файлов):

```bash
ruff format --check src tests
```

Чтобы автоматически отформатировать код:

```bash
ruff format src tests
```

**Mypy:**

```bash
mypy src
```

## Docker

Из `back/` сначала поднимите контейнер, который держит volume для SQLite:

```bash
docker compose -f docker-compose.db.yml up -d
```

Далее запускайте API (с ребилдом при необходимости):

```bash
docker compose -f docker-compose.api.yml up --build
```

Сервис API слушает порт **8000**; файл SQLite лежит в именованном volume `sqlite_data`.
Этот volume создаётся DB-стеком и подключается к API как `external`, поэтому данные БД не зависят от ребилда/пересоздания API-контейнера.
