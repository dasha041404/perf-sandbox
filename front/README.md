# Фронтенд Perf Sandbox

## Содержание

- [О проекте](#о-проекте)
- [Сохранение отчета по запросам](#сохранение-отчета-по-запросам)
- [Как скачать проект](#как-скачать-проект)
- [Как запускать фронтенд локально](#как-запускать-фронтенд-локально)
- [Как подготовить backend для фронтенда](#как-подготовить-backend-для-фронтенда)
- [Как запустить весь стек через Docker](#как-запустить-весь-стек-через-docker)
- [Как подключить Figma к VS Code](#как-подключить-figma-к-vs-code)
- [Как работать с задачей](#как-работать-с-задачей)
- [Правила именования веток](#правила-именования-веток)
- [Правила коммитов](#правила-коммитов)
- [Как создать PR](#как-создать-pr)

---

## О проекте

Frontend проекта разрабатывается на основе макетов в Figma.

Макет проекта:  
https://www.figma.com/design/JoQkqEDAn8wFQIDNKAjPXy/sandbox?node-id=183-2899&t=29DZQgUG5s9dHIs0-0

---

## Сохранение отчета по запросам

Создайте файл propmts_log.md.
ИИ-агенту напишите, чтобы он сохранял ваши запросы в данный файл: запрос + его ответ кратко. Это будет заготовка для вставки в отчет.

---

## Как скачать проект

Мы работаем через **fork**.

Это значит, что изменения нужно пушить не напрямую в основной репозиторий, а в свою копию проекта.

Основной репозиторий:

```text
dasha041404/perf-sandbox
```

### Шаг 1. Создайте fork

1. Откройте репозиторий:

```text
https://github.com/dasha041404/perf-sandbox
```

2. Нажмите кнопку **Fork**.
3. GitHub создаст копию репозитория в вашем аккаунте.

После этого у вас появится свой репозиторий:

```text
<ваш-username>/perf-sandbox
```

### Шаг 2. Склонируйте свой fork

```bash
git clone https://github.com/<ваш-username>/perf-sandbox.git
cd perf-sandbox/front
```

Замените `<ваш-username>` на ваш username в GitHub.

---

## Как запускать фронтенд локально

Установите зависимости:

```bash
npm install
```

Запустите dev-сервер:

```bash
npm run dev
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:5173
```

Если порт `5173` занят, Vite может запустить проект на другом порту. Адрес будет написан в терминале.

### Если PowerShell блокирует npm

Иногда в Windows может появиться ошибка о запрете запуска скриптов.

Быстрое решение:
разрешить выполнение локальных скриптов для текущего пользователя:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

После этого можно снова использовать обычную команду:

```bash
npm run dev
```

---

## Запуск проекта локально

Фронтенд зависит от backend API, поэтому для полной работы должны быть запущены обе части.

### Вариант 1: Запуск вручную через терминалы

Backend:

1. Создайте `back/.env`, если файла еще нет.
2. Добавьте:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. Запустите backend из папки `back` по инструкции из backend README:

```bash
cd back
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

1. Создайте `front/.env`, если файла еще нет.
2. Добавьте:

```env
VITE_API_URL=/api
VITE_PROXY_TARGET=http://127.0.0.1:8000
```

3. Запустите frontend из папки `front`:

```bash
cd front
npm install
npm run dev
```

После этого:

- frontend будет доступен по адресу `http://localhost:5173`;
- Swagger backend будет доступен по адресу `http://localhost:8000/docs`.

### Вариант 2: Запуск через Docker Compose

Docker Compose запускает frontend и backend вместе.

Перед запуском Docker:

1. Создайте `back/.env`.
2. Добавьте:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

Затем запустите из корня репозитория:

```bash
docker compose up --build
```

После этого:

- frontend будет доступен по адресу `http://localhost:5173`;
- Swagger backend будет доступен по адресу `http://localhost:8000/docs`.

Полезные команды Docker:

```bash
docker compose up
docker compose up --build
docker compose up -d
docker compose down
```

Кратко:

- `docker compose up` запускает контейнеры;
- `docker compose up --build` пересобирает образы и запускает контейнеры;
- `docker compose up -d` запускает контейнеры в фоне;
- `docker compose down` останавливает и удаляет контейнеры.

Важные замечания:

- `OPENROUTER_API_KEY` нужен только backend.
- Не добавляйте `OPENROUTER_API_KEY` во frontend-файлы.
- Не коммитьте реальные файлы `.env`.
- `front/.env.example` и документацию можно коммитить.
- Docker Compose запускайте из корня репозитория, а не из `front` или `back`.
- Если запускаете только backend через его отдельный Docker Compose, используйте README backend.

В Docker frontend использует внутреннее имя backend-сервиса `http://backend:8000`, а запросы к `/api` проксируются туда.

---

---

## Как подключить Figma к VS Code

### Шаг 1. Откройте MCP configuration

В VS Code нажмите:

```text
Ctrl + Shift + P
```

Найдите команду:

```text
MCP: Open User Configuration
```

Откроется файл `mcp.json`.

### Шаг 2. Добавьте Figma MCP server

Вставьте в `mcp.json`:

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    }
  }
}
```

Сохраните файл.

### Шаг 3. Запустите Figma MCP server

После сохранения:

1. откройте список MCP-серверов;
2. найдите сервер `figma`;
3. нажмите **Start**;
4. авторизуйтесь через свой Figma-аккаунт в браузере.

После этого Copilot сможет получать контекст из Figma.

### Как правильно давать макет Copilot

Лучше копировать ссылку не на весь файл, а на конкретный **frame**.

Хорошо:

```text
https://www.figma.com/design/.../sandbox?node-id=1-2
```

Плохо:

```text
ссылка просто на весь Figma-файл без выбранного frame
```

Пример запроса к Copilot:

```text
Use this Figma frame as the design source:
<ссылка на frame>

Implement the component in React + TypeScript.
Use CSS Modules.
Do not use Tailwind.
Do not add new dependencies.
Follow the existing project structure.
```

---

## Как работать с задачей

Основной поток веток:

```text
main -> feature/*
```

Новые задачи создаются от ветки `main`.

Перед началом задачи обновите `main`:

```bash
git checkout main
git pull origin main
```

Дальше создайте отдельную ветку под задачу:

```bash
git checkout -b feature/FE-<номер-задачи>-<short-description>
```

Например:

```bash
git checkout -b feature/FE-12-add-search-form
```

---

## Правила именования веток

Все рабочие ветки должны начинаться с `feature/`.

Шаблон:

```text
feature/<FE>-<номер-задачи>-<short-description>
```

Где:

- `FE` — frontend-задача;
- `<номер-задачи>` — номер GitHub Issue;
- `<short-description>` — короткое описание в kebab-case.

### Предпочтительный способ создания ветки

Лучше создавать ветку из GitHub Issue.

Путь:

```text
Issue -> Development -> Create a branch / Checkout locally
```

Так GitHub автоматически свяжет между собой:

- Issue;
- ветку;
- будущий PR.

---

## Правила коммитов

Шаблон коммита:

```text
<type>: <short-description>
```

Основные типы:

- `feat` — новая функциональность;
- `fix` — исправление ошибки;
- `docs` — изменения в документации.

Рекомендации:

- пишите коммиты на английском языке;
- делайте описание коротким и понятным;
- не коммитьте `node_modules`;
- не добавляйте в коммит лишние файлы, которые не относятся к задаче.

---

## Как создать PR

После завершения задачи добавьте изменения в коммит:

```bash
git add .
git commit -m "feat: add search form"
```

Отправьте ветку в свой fork:

```bash
git push origin feature/FE-12-add-search-form
```

После этого откройте GitHub и создайте PR.

### Важно проверить направление PR

PR должен идти из вашего fork в основной репозиторий.

Должно быть так:

```text
base repository:  dasha041404/perf-sandbox
base:             main

head repository:  <ваш-username>/perf-sandbox
compare:          feature/FE-12-add-search-form
```

То есть:

```text
<ваш fork> -> dasha041404/perf-sandbox
feature/*  -> main
```

Если направление выбрано неправильно, PR может быть создан не туда.

### Шаблон заголовка PR

```text
<FE>-<номер-задачи>: <краткое описание>
```

В описании PR закройте связанная задачу:

```text
Closes #<номер-issue>
```
