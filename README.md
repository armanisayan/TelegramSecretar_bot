# 🤖 Secretary Bot

Telegram բոտ, որը աշխատում է քո անձնական էջի քարտուղարի պես։

## Ինչ է անում

1. Օգտատերը սեղմում է `/start`
2. Բոտը հարցնում է ինչ նպատակով է գրում
3. Ընտրում է պատճառ (ծանոթություն / աշխատանք / անձնական)
4. Կախված ընտրությունից — հարցնում է մանրամասներ կամ վերջացնում
5. **Քեզ ուղարկում է notification** ամեն հաղորդագրության մասին

## Setup

### 1. Bot ստեղծիր
- Telegram-ում գտիր `@BotFather`
- Ուղարկիր `/newbot`
- Ստացիր **BOT_TOKEN**

### 2. Քո ID-ն ստացիր
- Telegram-ում գտիր `@userinfobot`
- Ուղարկիր `/start`
- Ստացիր **OWNER_ID** (թիվ է)

### 3. .env ֆայل սարքիր
```
cp .env.example .env
```
Լրացրու BOT_TOKEN և OWNER_ID

### 4. Install և Run
```bash
npm install
npm start
```

## Deploy (Render)

1. GitHub-ում push արա
2. Render.com-ում new Web Service
3. Environment Variables-ում ավելացրու BOT_TOKEN և OWNER_ID
4. Start command: `node bot.js`
