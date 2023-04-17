const TelegramBot = require('node-telegram-bot-api');
const token = '6060724879:AAGENm_rVzrr0VXFdl_HOq780g6yLiuc8S0';
const bot = new TelegramBot(token, {polling: true});
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');

db.run('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, username TEXT)');
db.run('CREATE TABLE IF NOT EXISTS Referrals (id INTEGER PRIMARY KEY, referral_id INTEGER, referral_date TEXT)');


// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.chat.first_name;
  const lastName = msg.chat.last_name;
  const username = msg.chat.username;
  
  db.run(`INSERT INTO Users(id, first_name, last_name, username) VALUES(?, ?, ?, ?)`, [chatId, firstName, lastName, username], (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(`User ${chatId} added to database`);
    }
  });

  const referrerId = msg.text.split(' ')[1];
  let referralLink = `https://t.me/${bot.options.username}?start=${chatId}`;
  if (referrerId && /^\d+$/.test(referrerId)) {
    // Добавляем нового реферала в таблицу Referrals
    db.run('INSERT INTO Referrals(id, referral_id, referral_date) VALUES(?, ?, ?)', [chatId, referrerId, new Date().toISOString()]);
    referralLink = `https://t.me/${bot.options.username}?start=${chatId}&ref=${referrerId}`;
  }
  
  bot.sendMessage(chatId, 'Привет! Я CryptoBot, твой персональный помощник по криптовалютам.', {
    reply_markup: {
      inline_keyboard: [
        [
          {text: '🗃Кошелёк', callback_data: '/wallet'},
          {text: '📊Маркет', callback_data: '/market'}
        ],
        [
          {text: '📲Профиль', callback_data: '/profile'},
          {text: '📞Реферал', callback_data: '/referall'}
        ],
        [
          {text: '⚒Помощь', callback_data: '/help'},
          {text: '💳P2P', callback_data: '/p2p'}
        ]
      ]
    }
  });
});

// Обработчик нажатий на кнопки клавиатуры
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const command = query.data;
  
  switch (command) {
    case '/wallet':
      // Обработка команды /wallet
      break;
    case '/market':
      // Обработка команды /market
      break;
    case '/profile':
      // Обработка команды /profile
      break;
      case '/referall':
        bot.sendMessage(chatId, 'Приглашайте друзей и получайте бонусы за каждого нового реферала!\n\nВаша реферальная ссылка: https://t.me/jfeiw4bot?start=${chatId}&ref=${referrerId}', {
          reply_markup: {
            inline_keyboard: [
              [{text: '👥 Мои рефералы', callback_data: '/my_referrals'}],
              [{text: '🔙 Назад', callback_data: '/inline'}]
            ]
          }
        });
        break;
        case '/my_referrals':
 db.all('SELECT * FROM Referrals WHERE referral_id = ?', [chatId], (err, rows) => {
    if (err) {
      console.log(err.message);
      bot.sendMessage(chatId, 'Ошибка при получении списка рефералов.');
    } else {
      const referralCount = rows.length;
      let message = `Вы пригласили ${referralCount} ${referralCount === 1 ? 'человека' : 'человек'}.`;
      rows.forEach(row => {
        message += `\n- @${row.username} (${row.referral_date})`;
      });
      bot.sendMessage(chatId, message);
    }
  });
  break;
    case '/inline':
      bot.sendMessage(chatId, 'Привет! Я CryptoBot, твой персональный помощник по криптовалютам.', {
        reply_markup: {
          inline_keyboard: [
            [
              {text: '🗃Кошелёк', callback_data: '/wallet'},
              {text: '📊Маркет', callback_data: '/market'}
            ],
            [
              {text: '📲Профиль', callback_data: '/profile'},
              {text: '📞Реферал', callback_data: '/referall'}
            ],
            [
              {text: '⚒Помощь', callback_data: '/help'},
              {text: '💳P2P', callback_data: '/p2p'}
            ]
          ]
        }
      });
      break;
    case '/p2p':
      // Обработка команды /p2p
      break;
  }
});