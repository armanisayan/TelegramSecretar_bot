const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Your Telegram user ID — messages will be forwarded to you
const OWNER_ID = process.env.OWNER_ID;

// Track user states
const userStates = {};

// ── /start ──────────────────────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.chat.first_name || "Բարև";

  userStates[chatId] = { step: "choose_reason" };

  bot.sendMessage(
    chatId,
    `👋 Բարև, ${firstName}!\n\nԱրմանը հիմա հասանելի չէ։ Ես նրա օգնական բոտն եմ 🤖\n\nԻ՞նչ նպատակով ես գրում։ Ընտրիր տարբերակներից մեկը։`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👋 Պարզապես ծանոթություն", callback_data: "reason_friend" }],
          [{ text: "🤝 Նրա ծանոթն եմ, խոսելու բան ունեմ", callback_data: "reason_acquaintance" }],
          [{ text: "💼 Աշխատանքային առաջարկ", callback_data: "reason_work" }],
          [{ text: "💬 Նախընտրում եմ անձամբ քննարկել", callback_data: "reason_personal" }],
        ],
      },
    }
  );
});

// ── Callback buttons ─────────────────────────────────────────────────────────
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const firstName = query.from.first_name || "";

  bot.answerCallbackQuery(query.id);

  if (data === "reason_friend") {
    userStates[chatId] = { step: "done", reason: "Ծանոթություն" };

    bot.sendMessage(
      chatId,
      `😊 Հասկացա!\n\nԱրմանը կտեսնի քո հաղորդագրությունը և կկապվի քեզ հետ հնարավորինս շուտ։\n\nԿուզե՞ս ինչ-որ բան ավելացնել — կարող ես հենց հիմա գրել։`
    );

    notifyOwner(chatId, firstName, "👋 Ծանոթություն է փնտրում");

  } else if (data === "reason_acquaintance") {
    userStates[chatId] = { step: "waiting_acquaintance_details", reason: "Ծանոթ" };

    bot.sendMessage(
      chatId,
      `🤝 Հասկացա, ծանոթն ես։\n\nԳրիր կարճ — ինչի մասին է խոսքը, Արմանը կպատասխանի հնարավորինս շուտ։`
    );

  } else if (data === "reason_work") {
    userStates[chatId] = { step: "waiting_work_details", reason: "Աշխատանքային առաջարկ" };

    bot.sendMessage(
      chatId,
      `💼 Հիանալի։\n\nԿարճ նկարագրիր քո առաջարկը — ինչ պրոյեկտ է, ինչ ես ուզում, բյուջե կա՞ արդեն մտածած։\n\nԱրմանը կպատասխանի հնարավորինս շուտ։`
    );

  } else if (data === "reason_personal") {
    userStates[chatId] = { step: "done", reason: "Անձնական քննարկում" };

    bot.sendMessage(
      chatId,
      `👌 Լավ։\n\nԱրմանը կտեսնի քո հաղորդագրությունը և կկապվի քեզ հետ անձամբ։\n\nԿուզե՞ս ինչ-որ բան ավելացնել — կարող ես հենց հիմա գրել։`
    );

    notifyOwner(chatId, firstName, "💬 Անձամբ քննարկել է ուզում");
  }
});

// ── Text messages after choosing reason ──────────────────────────────────────
bot.on("message", (msg) => {
  if (msg.text && msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const firstName = msg.chat.first_name || "Անծանոթ";
  const state = userStates[chatId];

  if (!state) {
    // User wrote without pressing /start
    bot.sendMessage(chatId, `Բարև 👋 Սկսելու համար սեղմիր /start`);
    return;
  }

  if (state.step === "waiting_acquaintance_details") {
    userStates[chatId].step = "done";

    bot.sendMessage(
      chatId,
      `✅ Ստացա։\n\nԱրմանը կտեսնի և կկապվի քեզ հետ շուտով։`
    );

    notifyOwner(chatId, firstName, `🤝 Ծանոթ է, խոսելու բան ունի\n\n"${msg.text}"`);
    return;
  }

  if (state.step === "waiting_work_details") {
    userStates[chatId].step = "done";

    bot.sendMessage(
      chatId,
      `✅ Ստացա։\n\nԱրմանը կծանոթանա քո առաջարկին և կպատասխանի հնարավորինս շուտ։ Շնորհակալություն։`
    );

    notifyOwner(chatId, firstName, `💼 Աշխատանքային առաջարկ\n\n"${msg.text}"`);
    return;
  }

  if (state.step === "done") {
    // Forward any extra message to owner
    notifyOwner(chatId, firstName, `💬 Լրացուցիչ հաղորդագրություն\n\n"${msg.text}"`);

    bot.sendMessage(chatId, `✅ Ստացա, կփոխանցեմ Արմանին։`);
  }
});

// ── Helper: notify owner ──────────────────────────────────────────────────────
function notifyOwner(fromChatId, firstName, details) {
  const profileLink = `tg://user?id=${fromChatId}`;

  bot.sendMessage(
    OWNER_ID,
    `📬 Նոր հաղորդագրություն բոտի միջոցով\n\n👤 Ուղարկող: <a href="${profileLink}">${firstName}</a>\n📋 ${details}\n\n🆔 Chat ID: ${fromChatId}`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💬 Ուղղակի պատասխանել", url: `tg://user?id=${fromChatId}` }],
        ],
      },
    }
  );
}
