# Frontend Perf Sandbox

## Содержание

- [О проекте](#о-проекте)
- [Как скачать проект](#как-скачать-проект)
- [Как запустить frontend локально](#как-запустить-frontend-локально)
- [Как подключить Figma к VS Code](#как-подключить-figma-к-vs-code)
- [Как работать с задачей](#как-работать-с-задачей)
- [Правила именования веток](#правила-именования-веток)
- [Правила коммитов](#правила-коммитов)
- [Как создать Pull Request](#как-создать-pull-request)

---

## О проекте

Frontend проекта разрабатывается на основе макетов в Figma.

Макет проекта:  
https://www.figma.com/design/JoQkqEDAn8wFQIDNKAjPXy/sandbox?node-id=183-2899&t=29DZQgUG5s9dHIs0-0

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

## Как запустить frontend локально

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
- будущий Pull Request.

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

## Как создать Pull Request

После завершения задачи добавьте изменения в коммит:

```bash
git add .
git commit -m "feat: add search form"
```

Отправьте ветку в свой fork:

```bash
git push origin feature/FE-12-add-search-form
```

После этого откройте GitHub и создайте Pull Request.

### Важно проверить направление Pull Request

Pull Request должен идти из вашего fork в основной репозиторий.

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