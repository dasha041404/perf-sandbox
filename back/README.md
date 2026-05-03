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

Из `back/`:

```bash
docker compose up --build
```

Сервис API слушает порт **8000**; файл SQLite лежит в общем именованном томе `sqlite_data` (данные сохраняются между перезапусками контейнеров).
