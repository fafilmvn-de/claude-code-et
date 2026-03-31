/**
 * data.js — Content data for Stock Market Learning Guide
 * Companies, news headlines, quiz questions, badges, and config.
 * 
 * ⚠️ All companies are FICTIONAL. This is for education only.
 * <!-- FUTURE: Vietnamese i18n — wrap all user-facing strings in a t() function -->
 */

'use strict';

/* ──────────────────────────── Configuration ──────────────────────────── */

const CONFIG = {
  startingCash: 10000,
  simulationWeeks: 8,
  xpPerQuiz: 50,
  xpPerSimulation: 100,
  priceMinStart: 20,
  priceMaxStart: 80,
  priceChangeMin: 0.03,   // ±3%
  priceChangeMax: 0.15,   // ±15%
  newsPerWeek: 2,
};

/* ──────────────────────────── Companies ──────────────────────────── */

const COMPANIES = [
  {
    id: 'snackco',
    name: 'SnackCo',
    emoji: '🍿',
    sector: 'Food & Beverage',
    color: '#f59e0b',
    startPrice: 45,
    backstory: 'SnackCo makes everyone\'s favorite chips, popcorn, and candy. They sell snacks in 30 countries and just opened a new mega-factory.',
  },
  {
    id: 'gameworld',
    name: 'GameWorld',
    emoji: '🎮',
    sector: 'Gaming & Entertainment',
    color: '#8b5cf6',
    startPrice: 62,
    backstory: 'GameWorld builds video games loved by millions of players. Their newest mobile game just hit #1 on the app store charts.',
  },
  {
    id: 'greenride',
    name: 'GreenRide',
    emoji: '🚲',
    sector: 'Green Transportation',
    color: '#10b981',
    startPrice: 33,
    backstory: 'GreenRide makes electric bikes and scooters for cities. They\'re growing fast as more people want eco-friendly ways to get around.',
  },
  {
    id: 'cloudlearn',
    name: 'CloudLearn',
    emoji: '📚',
    sector: 'Education Technology',
    color: '#3b82f6',
    startPrice: 55,
    backstory: 'CloudLearn runs an online learning platform used by 10 million students worldwide. They offer courses in math, science, coding, and more.',
  },
  {
    id: 'petpals',
    name: 'PetPals',
    emoji: '🐾',
    sector: 'Pet Care',
    color: '#ec4899',
    startPrice: 28,
    backstory: 'PetPals sells premium pet food, toys, and health products. Pet ownership is booming and PetPals is riding the wave.',
  },
];

/* ──────────────────────────── News Headlines ──────────────────────────── */
// Each entry: { text, sentiment: 'positive'|'negative'|'neutral', impact: [min, max] multiplier }

const NEWS_POOL = {
  snackco: [
    { text: '🍿 SnackCo\'s new spicy popcorn flavor goes viral on social media!', sentiment: 'positive', impact: [1.04, 1.10] },
    { text: '🍿 SnackCo signs deal with major airline to serve snacks on all flights!', sentiment: 'positive', impact: [1.05, 1.12] },
    { text: '🍿 SnackCo reports record sales during summer season!', sentiment: 'positive', impact: [1.03, 1.08] },
    { text: '🍿 Celebrity chef partners with SnackCo for a new product line!', sentiment: 'positive', impact: [1.02, 1.07] },
    { text: '🍿 SnackCo opens 50 new stores in Asia!', sentiment: 'positive', impact: [1.04, 1.09] },
    { text: '🍿 SnackCo recalls batch of chips due to packaging error 😟', sentiment: 'negative', impact: [0.88, 0.95] },
    { text: '🍿 Health report warns about too much salty snack consumption', sentiment: 'negative', impact: [0.90, 0.96] },
    { text: '🍿 SnackCo factory hit by supply chain delays', sentiment: 'negative', impact: [0.87, 0.94] },
    { text: '🍿 Competitor launches cheaper alternative to SnackCo\'s best-seller', sentiment: 'negative', impact: [0.91, 0.97] },
    { text: '🍿 Sugar prices rise, increasing SnackCo\'s production costs', sentiment: 'negative', impact: [0.92, 0.96] },
    { text: '🍿 SnackCo updates its logo — fans have mixed reactions', sentiment: 'neutral', impact: [0.98, 1.02] },
    { text: '🍿 SnackCo CEO speaks at food industry conference', sentiment: 'neutral', impact: [0.99, 1.03] },
  ],
  gameworld: [
    { text: '🎮 GameWorld\'s new mobile game hits 10 million downloads in a week! 📱🔥', sentiment: 'positive', impact: [1.06, 1.15] },
    { text: '🎮 GameWorld wins "Best Game Studio" award at E3!', sentiment: 'positive', impact: [1.04, 1.10] },
    { text: '🎮 GameWorld announces partnership with popular streamer!', sentiment: 'positive', impact: [1.03, 1.08] },
    { text: '🎮 GameWorld\'s subscription service reaches 5 million users!', sentiment: 'positive', impact: [1.05, 1.12] },
    { text: '🎮 GameWorld acquires small indie studio with great talent!', sentiment: 'positive', impact: [1.02, 1.07] },
    { text: '🎮 GameWorld\'s latest game launch is buggy — players are upset 😤', sentiment: 'negative', impact: [0.85, 0.93] },
    { text: '🎮 Several top developers leave GameWorld for a competitor', sentiment: 'negative', impact: [0.88, 0.95] },
    { text: '🎮 Parents\' group calls for stricter screen-time rules for kids', sentiment: 'negative', impact: [0.90, 0.96] },
    { text: '🎮 GameWorld delays its most anticipated game by 6 months', sentiment: 'negative', impact: [0.87, 0.94] },
    { text: '🎮 New gaming console released — unclear if GameWorld will support it', sentiment: 'neutral', impact: [0.97, 1.03] },
    { text: '🎮 GameWorld hosts annual fan convention this weekend', sentiment: 'neutral', impact: [0.99, 1.04] },
    { text: '🎮 Industry report: mobile gaming grows 15% year-over-year', sentiment: 'positive', impact: [1.02, 1.06] },
  ],
  greenride: [
    { text: '🚲 City of Paris orders 10,000 GreenRide e-bikes for public sharing!', sentiment: 'positive', impact: [1.06, 1.14] },
    { text: '🚲 GreenRide wins government grant for green transportation research!', sentiment: 'positive', impact: [1.04, 1.10] },
    { text: '🚲 Gas prices hit record high — people switch to GreenRide! ⛽📈', sentiment: 'positive', impact: [1.05, 1.13] },
    { text: '🚲 GreenRide launches new long-range e-scooter — 50 miles per charge!', sentiment: 'positive', impact: [1.03, 1.09] },
    { text: '🚲 Environmental group names GreenRide "Company of the Year"!', sentiment: 'positive', impact: [1.02, 1.07] },
    { text: '🚲 GreenRide recalls e-scooter model due to brake issue ⚠️', sentiment: 'negative', impact: [0.85, 0.93] },
    { text: '🚲 Harsh winter weather reduces bike and scooter usage nationwide', sentiment: 'negative', impact: [0.90, 0.96] },
    { text: '🚲 New competitor backed by big tech enters the e-bike market', sentiment: 'negative', impact: [0.88, 0.95] },
    { text: '🚲 Battery supplier raises prices, squeezing GreenRide margins', sentiment: 'negative', impact: [0.91, 0.96] },
    { text: '🚲 City considers new bike lane laws — could help or hurt rentals', sentiment: 'neutral', impact: [0.97, 1.03] },
    { text: '🚲 GreenRide sponsors local cycling marathon', sentiment: 'neutral', impact: [0.99, 1.02] },
    { text: '🚲 Report: global e-bike market expected to double by 2030', sentiment: 'positive', impact: [1.03, 1.08] },
  ],
  cloudlearn: [
    { text: '📚 CloudLearn partners with top university to offer free courses!', sentiment: 'positive', impact: [1.05, 1.12] },
    { text: '📚 CloudLearn reaches 15 million students worldwide! 🎉', sentiment: 'positive', impact: [1.04, 1.10] },
    { text: '📚 Government announces funding for online education programs', sentiment: 'positive', impact: [1.03, 1.09] },
    { text: '📚 CloudLearn\'s AI tutor feature gets rave reviews from teachers!', sentiment: 'positive', impact: [1.05, 1.11] },
    { text: '📚 School district adopts CloudLearn for 100,000 students!', sentiment: 'positive', impact: [1.04, 1.08] },
    { text: '📚 CloudLearn experiences server outage during exam week 😰', sentiment: 'negative', impact: [0.87, 0.94] },
    { text: '📚 Study questions effectiveness of online-only learning', sentiment: 'negative', impact: [0.90, 0.96] },
    { text: '📚 Major tech company launches competing education platform', sentiment: 'negative', impact: [0.86, 0.93] },
    { text: '📚 CloudLearn raises subscription price — some students leave', sentiment: 'negative', impact: [0.89, 0.95] },
    { text: '📚 Education conference discusses future of learning technology', sentiment: 'neutral', impact: [0.98, 1.03] },
    { text: '📚 CloudLearn CEO shares vision for the next 5 years', sentiment: 'neutral', impact: [0.99, 1.02] },
    { text: '📚 Summer break begins — fewer students on platform (seasonal)', sentiment: 'neutral', impact: [0.96, 1.01] },
  ],
  petpals: [
    { text: '🐾 PetPals\' organic dog food wins "Best New Product" award!', sentiment: 'positive', impact: [1.05, 1.12] },
    { text: '🐾 Pet adoption rates surge — more customers for PetPals! 🐕', sentiment: 'positive', impact: [1.04, 1.10] },
    { text: '🐾 PetPals launches same-day delivery in 20 new cities!', sentiment: 'positive', impact: [1.03, 1.08] },
    { text: '🐾 Viral video of cute puppy with PetPals toy gets 50M views!', sentiment: 'positive', impact: [1.02, 1.07] },
    { text: '🐾 PetPals opens first veterinary clinic chain — expanding services!', sentiment: 'positive', impact: [1.05, 1.13] },
    { text: '🐾 PetPals recalls dog treat batch after quality concerns 😟', sentiment: 'negative', impact: [0.87, 0.94] },
    { text: '🐾 Economic slowdown — people spend less on premium pet products', sentiment: 'negative', impact: [0.89, 0.95] },
    { text: '🐾 Big retailer starts its own pet food brand at lower prices', sentiment: 'negative', impact: [0.88, 0.95] },
    { text: '🐾 Shipping costs increase, cutting into PetPals\' profits', sentiment: 'negative', impact: [0.91, 0.96] },
    { text: '🐾 National Pet Day celebrations boost social media engagement', sentiment: 'neutral', impact: [0.99, 1.04] },
    { text: '🐾 PetPals surveys customers on new product ideas', sentiment: 'neutral', impact: [0.98, 1.02] },
    { text: '🐾 Report: pet industry grows steadily at 6% per year', sentiment: 'positive', impact: [1.02, 1.06] },
  ],
};

/* ──────────────────────────── Quiz Data ──────────────────────────── */
// Each module has an array of questions: { question, options[], correct (0-based index), explanation }

const QUIZ_DATA = {
  module1: [
    {
      question: 'If you buy a stock in a company, what do you own?',
      options: ['A product from the company', 'A tiny piece of the company', 'A job at the company', 'The company\'s building'],
      correct: 1,
      explanation: 'A stock represents a small piece of ownership in a company. You become a part-owner! 🎉',
    },
    {
      question: 'Why do companies sell stocks to the public?',
      options: ['Because the government forces them', 'To give away their profits', 'To raise money to grow their business', 'To make their name famous'],
      correct: 2,
      explanation: 'Companies "go public" to raise money. They sell pieces of the company (stocks) so they can invest in growing bigger! 💰',
    },
    {
      question: 'If a pizza shop is worth $100 and is split into 10 equal shares, how much is one share worth?',
      options: ['$100', '$10', '$1', '$50'],
      correct: 1,
      explanation: '$100 ÷ 10 shares = $10 per share. That\'s exactly how stocks work! 🍕',
    },
  ],
  module2: [
    {
      question: 'What is a stock exchange?',
      options: ['A place to exchange currencies', 'A marketplace where stocks are bought and sold', 'A type of stock', 'A company that makes stocks'],
      correct: 1,
      explanation: 'A stock exchange is like a big marketplace — but instead of fruits and vegetables, people buy and sell stocks! 🏪',
    },
    {
      question: 'If more people want to BUY a stock than sell it, what happens to the price?',
      options: ['It goes down', 'It stays the same', 'It goes up', 'It disappears'],
      correct: 2,
      explanation: 'When demand goes up (more buyers), the price goes up too. It\'s supply and demand! 📈',
    },
    {
      question: 'What makes stock prices change?',
      options: ['Only the company\'s CEO decides', 'Supply and demand — how many people want to buy vs sell', 'The government sets all prices', 'Prices change randomly for no reason'],
      correct: 1,
      explanation: 'Stock prices are set by supply and demand. When lots of people want a stock, the price rises. When people want to sell, it drops. 🔄',
    },
  ],
  module3: [
    {
      question: 'What\'s the difference between revenue and profit?',
      options: ['They mean the same thing', 'Revenue is total money earned, profit is what\'s left after expenses', 'Profit is always bigger than revenue', 'Revenue only counts cash payments'],
      correct: 1,
      explanation: 'Revenue = all money coming in. Profit = revenue minus all costs. A lemonade stand might earn $50 (revenue) but spend $30 on supplies, leaving $20 profit! 🍋',
    },
    {
      question: 'Which of these is NOT something that makes a company valuable?',
      options: ['Happy customers who keep coming back', 'A well-known brand people trust', 'Having the oldest office building', 'Products people love using'],
      correct: 2,
      explanation: 'An old building doesn\'t make a company valuable! What matters is the customers, brand, and products. 🏢❌ vs 💝✅',
    },
    {
      question: 'Company A earns $1 million but spends $1.2 million. Is it profitable?',
      options: ['Yes, it earned a million!', 'No, it spent more than it earned', 'We can\'t tell from this information', 'Profit doesn\'t matter'],
      correct: 1,
      explanation: 'Nope! If you spend more than you earn, you have a LOSS, not a profit. $1M - $1.2M = -$200K loss. Ouch! 📉',
    },
  ],
  module4: [
    {
      question: 'What does "long-term investing" mean?',
      options: ['Buying and selling stocks every day', 'Holding stocks for years and being patient', 'Only buying expensive stocks', 'Investing all your money at once'],
      correct: 1,
      explanation: 'Long-term investing means buying good companies and holding them for years — letting your investment grow over time like a tree! 🌳',
    },
    {
      question: 'Which is usually a better sign for a company\'s stock?',
      options: ['Its revenue has grown steadily for 5 years', 'It was in the news yesterday', 'It has a cool logo', 'Its stock price went up today'],
      correct: 0,
      explanation: 'Steady growth over years is a much stronger signal than one day of news. Look at the big picture, not just today! 📊',
    },
    {
      question: 'Why might a "boring" company be a good long-term investment?',
      options: ['Boring is always bad', 'Because steady, reliable companies often grow consistently', 'Because no one else wants to invest in them', 'Boring companies don\'t exist'],
      correct: 1,
      explanation: 'Companies that are stable and grow steadily (like a grocery chain or water utility) can be great long-term investments, even if they\'re not exciting! 🐢💰',
    },
  ],
  module5: [
    {
      question: 'What happens when you "buy" a stock?',
      options: ['You receive a physical certificate in the mail', 'You exchange money for shares that are recorded in your account', 'You call the company\'s CEO', 'The company sends you a thank-you card'],
      correct: 1,
      explanation: 'When you buy stock, your money is exchanged for shares that are tracked digitally in your brokerage account. It\'s all electronic! 💻',
    },
    {
      question: 'You bought a stock at $20 and it\'s now worth $25. What\'s your gain?',
      options: ['$20', '$25', '$5 per share', '$45'],
      correct: 2,
      explanation: '$25 (current price) − $20 (your cost) = $5 gain per share. That\'s a 25% return! 🎯',
    },
    {
      question: 'You bought a stock at $50 and it dropped to $40. What should you think about?',
      options: ['Panic and sell immediately!', 'Why did the price drop? Is the company still good long-term?', 'Stocks never go down, this must be an error', 'Buy as much as possible because it\'s cheap'],
      correct: 1,
      explanation: 'Don\'t panic! Think about WHY the price dropped. If the company is still strong, it might recover. If something fundamental changed, that\'s different. Always think, don\'t react emotionally! 🧠',
    },
  ],
};

/* ──────────────────────────── Badges ──────────────────────────── */

const BADGES = [
  { id: 'explorer',   module: 1, name: 'Market Explorer',   emoji: '🏅', description: 'You understand what stocks are!' },
  { id: 'floor_pro',  module: 2, name: 'Trading Floor Pro',  emoji: '📊', description: 'You know how the stock market works!' },
  { id: 'detective',  module: 3, name: 'Company Detective',  emoji: '🔍', description: 'You can evaluate companies!' },
  { id: 'thinker',    module: 4, name: 'Smart Thinker',      emoji: '🧠', description: 'You understand investing basics!' },
  { id: 'first_trade',module: 5, name: 'First Trade',        emoji: '🎉', description: 'You know how trading works!' },
  { id: 'rookie',     module: 6, name: 'Wall Street Rookie',  emoji: '🏆', description: 'You completed the trading simulation!' },
];
