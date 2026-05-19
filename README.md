TG MP3 Tags Converter

Telegram-бот для автоматической перекодировки тегов MP3 файлов из кириллических кодировок (cp1251 и др.) в UTF-8.

## Как это работает

Пользователь отправляет боту MP3 файл → бот скачивает его, определяет кодировку тегов, перекодирует их в UTF-8, и возвращает исправленный файл обратно в чат.

## Структура проекта

```
src/
├── config/
│   └── cfg.ts            # Токен бота
├── controllers/
│   └── controller.ts     # Обработчик ответа на webhook
├── middleware/
│   └── bot.ts            # Основная логика: логирование, скачивание, перекодировка
├── miscellaneous/
│   └── log.json          # Лог входящих запросов от Telegram
├── routes/
│   └── rtr.ts            # Маршруты Express
└── app.ts                # Точка входа
```

## Технологии

- **Node.js** + **TypeScript**
- **Express** — HTTP сервер для приёма webhook от Telegram
- **node-telegram-bot-api** — взаимодействие с Telegram Bot API
- **node-id3** — чтение и запись ID3 тегов MP3 файлов
- **iconv-lite** — перекодировка строк между кодировками
- **jschardet** — автоматическое определение кодировки
- **axios** — скачивание файлов с серверов Telegram

## Установка

```bash
git clone https://github.com/UshatPomoevKamazOthodov/TG_mp3_tags_converter
cd TG_mp3_tags_converter
npm install
```

## Настройка

Вставь токен бота в `src/config/cfg.ts`:

```ts
const cfg = {
    token: 'ВАШ_ТОКЕН_ЗДЕСЬ'
}

export default cfg;
```

Зарегистрируй webhook у Telegram, указав публичный URL твоего сервера:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<твой-домен>/telegram/bot
```

Для локальной разработки можно использовать [ngrok](https://ngrok.com/).

## Запуск

```bash
npx ts-node src/app.ts
```

Сервер запустится на порту `3000`.

## Middleware pipeline

Каждый входящий запрос проходит три шага:

1. **logger** — логирует тело запроса в `miscellaneous/log.json` и извлекает `chat_id`, `file_id`, `file_name` из сообщения
2. **downloader** — скачивает MP3 файл с серверов Telegram на диск
3. **mp3NameFixer** — определяет кодировку тегов, перекодирует их в UTF-8, отправляет исправленный файл пользователю и удаляет временный файл

## Зависимости

```json
"dependencies": {
    "axios": "^1.6.0",
    "body-parser": "^1.19.2",
    "express": "^4.17.2",
    "iconv-lite": "^0.6.3",
    "jschardet": "^3.0.0",
    "node-id3": "^0.2.3",
    "node-telegram-bot-api": "^0.67.0"
},
"devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.8.0",
    "@types/node-telegram-bot-api": "^0.64.14",
    "ts-node": "^10.9.2",
    "typescript": "^6.0.3"
}
```
