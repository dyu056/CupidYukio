# Telegram Dating Bot

A Telegram bot that helps users find and match with potential partners.

# How to run

1. Clone the repository
2. Install dependencies `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the bot `npm run dev`

## Features

- 👤 Profile Management

  - Set up profile with name, age, gender, and photo
  - Add and update interests
  - View and edit profile

- 👥 Match Making

  - Browse potential matches
  - Like or skip profiles
  - Daily swipe limit (50 swipes)
  - Mutual match notifications

- 💕 Match Management
  - View all matches
  - Direct message links
  - Remove matches
  - View match interests

## Tech Stack

- Node.js
- TypeScript
- MongoDB
- Telegraf
- Mongoose

## Commands

- `/start` - Start the bot/show menu
- `/menu` - Show main menu

## License


## 2025.6.30
开机自启部署
将数据库设定为了www.love.fun上的mongodb，未在/root/DateMate/.env中配置R2服务，只维持了基础的运行。