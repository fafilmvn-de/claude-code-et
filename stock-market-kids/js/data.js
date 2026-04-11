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
  xpPerCorrect: { easy: 25, medium: 50, hard: 75 },
  xpPerMastery: 150,
  priceMinStart: 20,
  priceMaxStart: 80,
  priceChangeMin: 0.03,   // ±3%
  priceChangeMax: 0.15,   // ±15%
  newsPerWeek: 2,
  tickerSpeed: 20,        // seconds for full ticker scroll
  liveTickInterval: 3000, // ms between cosmetic price pulses
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
    volatility: 'low',
    backstory: 'SnackCo makes everyone\'s favorite chips, popcorn, and candy. They sell snacks in 30 countries and just opened a new mega-factory.',
  },
  {
    id: 'gameworld',
    name: 'GameWorld',
    emoji: '🎮',
    sector: 'Gaming & Entertainment',
    color: '#8b5cf6',
    startPrice: 62,
    volatility: 'high',
    backstory: 'GameWorld builds video games loved by millions of players. Their newest mobile game just hit #1 on the app store charts.',
  },
  {
    id: 'greenride',
    name: 'GreenRide',
    emoji: '🚲',
    sector: 'Green Transportation',
    color: '#10b981',
    startPrice: 33,
    volatility: 'medium',
    backstory: 'GreenRide makes electric bikes and scooters for cities. They\'re growing fast as more people want eco-friendly ways to get around.',
  },
  {
    id: 'cloudlearn',
    name: 'CloudLearn',
    emoji: '📚',
    sector: 'Education Technology',
    color: '#3b82f6',
    startPrice: 55,
    volatility: 'low',
    backstory: 'CloudLearn runs an online learning platform used by 10 million students worldwide. They offer courses in math, science, coding, and more.',
  },
  {
    id: 'petpals',
    name: 'PetPals',
    emoji: '🐾',
    sector: 'Pet Care',
    color: '#ec4899',
    startPrice: 28,
    volatility: 'medium',
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
// Each question: { question, options[], correct (0-based), explanation, difficulty: 'easy'|'medium'|'hard' }

const QUIZ_DATA = {
  module1: [
    // ── Easy ──
    {
      difficulty: 'easy',
      question: 'If you buy a stock in a company, what do you own?',
      options: ['A product from the company', 'A tiny piece of the company', 'A job at the company', 'The company\'s building'],
      correct: 1,
      explanation: 'A stock represents a small piece of ownership in a company. You become a part-owner! 🎉',
    },
    {
      difficulty: 'easy',
      question: 'Why do companies sell stocks to the public?',
      options: ['Because the government forces them', 'To give away their profits', 'To raise money to grow their business', 'To make their name famous'],
      correct: 2,
      explanation: 'Companies "go public" to raise money. They sell pieces of the company (stocks) so they can invest in growing bigger! 💰',
    },
    {
      difficulty: 'easy',
      question: 'If a pizza shop is worth $100 and is split into 10 equal shares, how much is one share worth?',
      options: ['$100', '$10', '$1', '$50'],
      correct: 1,
      explanation: '$100 ÷ 10 shares = $10 per share. That\'s exactly how stocks work! 🍕',
    },
    // ── Medium ──
    {
      difficulty: 'medium',
      question: 'A company\'s value rises from $500 million to $600 million. If there are 100 million shares, what is each share now worth?',
      options: ['$5', '$6', '$60', '$100'],
      correct: 1,
      explanation: '$600M ÷ 100M shares = $6 per share. When a company grows, each share becomes more valuable! 📈',
    },
    {
      difficulty: 'medium',
      question: 'What is "market cap" (market capitalisation)?',
      options: ['The maximum price a stock can reach', 'The total value of all a company\'s shares combined', 'The company\'s annual profit', 'The number of employees'],
      correct: 1,
      explanation: 'Market cap = share price × total number of shares. It\'s the total value the market places on the entire company! 💼',
    },
    {
      difficulty: 'medium',
      question: 'What is a dividend?',
      options: ['A fee you pay to buy stocks', 'A portion of company profits paid to shareholders', 'A type of stock exchange', 'A penalty for selling shares too early'],
      correct: 1,
      explanation: 'Dividends are like a "thank you" payment — companies share some of their profits with shareholders. Not all companies pay them! 💵',
    },
    // ── Hard ──
    {
      difficulty: 'hard',
      question: 'A company issues 10 million new shares to raise cash. You owned 1 million of the original 10 million shares. What percentage do you now own?',
      options: ['10%', '5%', '1%', 'Still 10% — nothing changes'],
      correct: 1,
      explanation: 'After the new issue there are 20M total shares. You still hold 1M, so 1M÷20M = 5%. This is called dilution — your ownership shrank! ⚠️',
    },
    {
      difficulty: 'hard',
      question: 'How is owning a stock different from owning a bond in a company?',
      options: ['They are identical', 'A stockholder owns part of the company; a bondholder lends money to it', 'Bonds always pay more than stocks', 'Only governments can issue bonds'],
      correct: 1,
      explanation: 'A stock = ownership slice. A bond = loan to the company. Bondholders are creditors who get paid back first; stockholders share in profits but take more risk! 🏛️',
    },
    {
      difficulty: 'hard',
      question: 'What is an IPO lock-up period?',
      options: ['A time when trading is paused for all investors', 'A period after an IPO when insiders cannot sell their shares', 'The first day a stock begins trading', 'A government rule stopping new IPOs'],
      correct: 1,
      explanation: 'After a company goes public, insiders (founders, early investors) must wait — typically 90–180 days — before selling. This prevents a flood of selling that could crash the new stock\'s price! 🔒',
    },
  ],
  module2: [
    // ── Easy ──
    {
      difficulty: 'easy',
      question: 'What is a stock exchange?',
      options: ['A place to exchange currencies', 'A marketplace where stocks are bought and sold', 'A type of stock', 'A company that makes stocks'],
      correct: 1,
      explanation: 'A stock exchange is like a big marketplace — but instead of fruits and vegetables, people buy and sell stocks! 🏪',
    },
    {
      difficulty: 'easy',
      question: 'If more people want to BUY a stock than sell it, what happens to the price?',
      options: ['It goes down', 'It stays the same', 'It goes up', 'It disappears'],
      correct: 2,
      explanation: 'When demand goes up (more buyers), the price goes up too. It\'s supply and demand! 📈',
    },
    {
      difficulty: 'easy',
      question: 'What makes stock prices change?',
      options: ['Only the company\'s CEO decides', 'Supply and demand — how many people want to buy vs sell', 'The government sets all prices', 'Prices change randomly for no reason'],
      correct: 1,
      explanation: 'Stock prices are set by supply and demand. When lots of people want a stock, the price rises. When people want to sell, it drops. 🔄',
    },
    // ── Medium ──
    {
      difficulty: 'medium',
      question: 'What is a "bid-ask spread"?',
      options: ['The daily price range of a stock', 'The difference between the highest buy price and lowest sell price offered', 'A fee charged by the stock exchange', 'The gap between two companies\' prices'],
      correct: 1,
      explanation: 'The bid is the highest price a buyer will pay; the ask is the lowest a seller will accept. The spread between them is how market makers earn money! 🤝',
    },
    {
      difficulty: 'medium',
      question: 'Why does a company\'s stock price often jump immediately after good earnings news?',
      options: ['The exchange manually adjusts it', 'Investors rush to buy, increasing demand and pushing the price up', 'The company buys its own stock back', 'Good news always doubles the price'],
      correct: 1,
      explanation: 'Good news → investors want to own the stock → more buyers than sellers → price rises. News changes expectations, and expectations drive demand! 📰📈',
    },
    {
      difficulty: 'medium',
      question: 'What are "after-hours" stock trades?',
      options: ['Trades that happen illegally', 'Buying and selling outside the main exchange hours', 'Trades that only big banks can make', 'Trades that don\'t affect stock prices'],
      correct: 1,
      explanation: 'Most exchanges are open during business hours. After-hours trading allows some investors to trade outside that window, though with less liquidity and higher spreads! 🌙',
    },
    // ── Hard ──
    {
      difficulty: 'hard',
      question: 'What is a "circuit breaker" in the stock market?',
      options: ['An electrical safety device in exchange computers', 'A rule that pauses trading when prices fall too fast to prevent panic', 'A type of high-frequency trading algorithm', 'A penalty for placing too many orders'],
      correct: 1,
      explanation: 'Circuit breakers halt trading temporarily when markets drop sharply (e.g. 7%, 13%, 20% in one day). They give investors time to think instead of panic-selling! 🛑',
    },
    {
      difficulty: 'hard',
      question: 'What does it mean to "short sell" a stock?',
      options: ['Buy shares for a very short time', 'Borrow shares, sell them, then buy them back later hoping the price fell', 'Sell a stock for less than you paid', 'Buy stocks only on short trading days'],
      correct: 1,
      explanation: 'Short selling is betting a stock will fall: you borrow shares, sell them now, then buy them back cheaper later. If the price rises instead, you lose money! ⚠️',
    },
    {
      difficulty: 'hard',
      question: 'What is a stock market index like the S&P 500?',
      options: ['A single, very expensive stock', 'A basket of many stocks used to measure overall market performance', 'A ranking of the 500 richest people', 'A type of government bond'],
      correct: 1,
      explanation: 'An index tracks a group of stocks (the S&P 500 tracks 500 big US companies). When people say "the market went up", they often mean an index like this went up! 📊',
    },
  ],
  module3: [
    // ── Easy ──
    {
      difficulty: 'easy',
      question: 'What\'s the difference between revenue and profit?',
      options: ['They mean the same thing', 'Revenue is total money earned, profit is what\'s left after expenses', 'Profit is always bigger than revenue', 'Revenue only counts cash payments'],
      correct: 1,
      explanation: 'Revenue = all money coming in. Profit = revenue minus all costs. A lemonade stand might earn $50 (revenue) but spend $30 on supplies, leaving $20 profit! 🍋',
    },
    {
      difficulty: 'easy',
      question: 'Which of these is NOT something that makes a company valuable?',
      options: ['Happy customers who keep coming back', 'A well-known brand people trust', 'Having the oldest office building', 'Products people love using'],
      correct: 2,
      explanation: 'An old building doesn\'t make a company valuable! What matters is the customers, brand, and products. 🏢❌ vs 💝✅',
    },
    {
      difficulty: 'easy',
      question: 'Company A earns $1 million but spends $1.2 million. Is it profitable?',
      options: ['Yes, it earned a million!', 'No, it spent more than it earned', 'We can\'t tell from this information', 'Profit doesn\'t matter'],
      correct: 1,
      explanation: 'Nope! If you spend more than you earn, you have a LOSS, not a profit. $1M - $1.2M = -$200K loss. Ouch! 📉',
    },
    // ── Medium ──
    {
      difficulty: 'medium',
      question: 'What does a P/E ratio (Price-to-Earnings) tell you?',
      options: ['How profitable the company is in dollars', 'How much investors pay for every $1 of the company\'s earnings', 'The company\'s annual revenue divided by expenses', 'The percentage of profits paid as dividends'],
      correct: 1,
      explanation: 'A P/E of 20 means investors pay $20 for every $1 of earnings. A high P/E can mean investors expect fast growth; a low P/E can mean a bargain — or hidden problems! 🔢',
    },
    {
      difficulty: 'medium',
      question: 'What is gross profit margin?',
      options: ['Total revenue minus total costs', 'Revenue minus the direct costs of making products, divided by revenue', 'The company\'s profit after paying taxes', 'The amount of cash a company holds'],
      correct: 1,
      explanation: 'Gross margin = (Revenue − Cost of Goods Sold) ÷ Revenue. It shows how efficiently a company makes its products. Higher = better! 📐',
    },
    {
      difficulty: 'medium',
      question: 'What does a balance sheet show?',
      options: ['Only how much profit a company made', 'A snapshot of what a company owns (assets) and owes (liabilities) at one point in time', 'A list of upcoming product launches', 'The company\'s stock price history'],
      correct: 1,
      explanation: 'A balance sheet is like a financial photo: it shows assets (what you own) and liabilities (what you owe). Assets − Liabilities = Equity (the owners\' share)! 📸',
    },
    // ── Hard ──
    {
      difficulty: 'hard',
      question: 'A tech startup has $50M revenue but loses $30M per year. Could it still be a good investment?',
      options: ['No — companies that lose money are always bad investments', 'Possibly, if investors believe fast growth now will lead to large profits later', 'Yes, because high revenue always means success', 'No — profitable companies are the only safe investments'],
      correct: 1,
      explanation: 'Many successful companies (Amazon, Uber) lost money for years while growing rapidly. Investors bet on future profits. But it\'s risky — not all "growth at all costs" companies succeed! 🚀',
    },
    {
      difficulty: 'hard',
      question: 'Company X has ROE of 25%; Company Y has ROE of 8%. What does this mean?',
      options: ['Company X\'s stock price is higher', 'Company X generates $25 profit per $100 of shareholder equity vs $8 for Company Y', 'Company X is 3× more valuable', 'ROE measures revenue, not profit'],
      correct: 1,
      explanation: 'ROE (Return on Equity) = Net Profit ÷ Shareholder Equity. A higher ROE means the company is more efficient at turning owner capital into profit. Generally, higher is better! 💡',
    },
    {
      difficulty: 'hard',
      question: 'What is a "competitive moat" for a company?',
      options: ['A physical barrier around company headquarters', 'A sustainable advantage that protects the company from competitors', 'A legal patent on one product', 'The company\'s largest market'],
      correct: 1,
      explanation: 'A moat is anything that makes it hard for competitors to take your customers: a brand people love, switching costs, network effects, or cost advantages. Wide moat = durable business! 🏰',
    },
  ],
  module4: [
    // ── Easy ──
    {
      difficulty: 'easy',
      question: 'What does "long-term investing" mean?',
      options: ['Buying and selling stocks every day', 'Holding stocks for years and being patient', 'Only buying expensive stocks', 'Investing all your money at once'],
      correct: 1,
      explanation: 'Long-term investing means buying good companies and holding them for years — letting your investment grow over time like a tree! 🌳',
    },
    {
      difficulty: 'easy',
      question: 'Which is usually a better sign for a company\'s stock?',
      options: ['Its revenue has grown steadily for 5 years', 'It was in the news yesterday', 'It has a cool logo', 'Its stock price went up today'],
      correct: 0,
      explanation: 'Steady growth over years is a much stronger signal than one day of news. Look at the big picture, not just today! 📊',
    },
    {
      difficulty: 'easy',
      question: 'Why might a "boring" company be a good long-term investment?',
      options: ['Boring is always bad', 'Because steady, reliable companies often grow consistently', 'Because no one else wants to invest in them', 'Boring companies don\'t exist'],
      correct: 1,
      explanation: 'Companies that are stable and grow steadily (like a grocery chain or water utility) can be great long-term investments, even if they\'re not exciting! 🐢💰',
    },
    // ── Medium ──
    {
      difficulty: 'medium',
      question: 'What is dollar-cost averaging?',
      options: ['Buying stocks only when prices are at their lowest', 'Investing a fixed amount on a regular schedule regardless of price', 'Converting foreign currencies into dollars before investing', 'Averaging the price of stocks across different countries'],
      correct: 1,
      explanation: 'Dollar-cost averaging means investing $X every month no matter what. You buy more shares when prices are low and fewer when high, reducing the impact of volatility! 📅',
    },
    {
      difficulty: 'medium',
      question: 'If you invest $1,000 and it grows 10% per year for 10 years, roughly how much will you have?',
      options: ['$1,100', '$2,000', '$2,594', '$10,000'],
      correct: 2,
      explanation: 'Compound interest: $1,000 × 1.10^10 ≈ $2,594. Your gains earn gains! That\'s the magic of compounding — start early and be patient! 🌱',
    },
    {
      difficulty: 'medium',
      question: 'What is "risk tolerance" in investing?',
      options: ['How many stocks you can legally own', 'How comfortable you are with the possibility of your investment losing value', 'The maximum loss a stock exchange allows', 'A score assigned by your bank'],
      correct: 1,
      explanation: 'Risk tolerance is personal. If a 20% drop would make you panic-sell, you have low risk tolerance. Knowing yourself helps you pick the right investments! 🧘',
    },
    // ── Hard ──
    {
      difficulty: 'hard',
      question: 'You own stocks in 20 different companies across 5 industries. A single company goes bankrupt. What is your maximum loss?',
      options: ['All your money', 'About 5% of your portfolio (1 of 20 companies)', 'Exactly 50%', 'Nothing — diversification eliminates all risk'],
      correct: 1,
      explanation: 'Diversification limits exposure. With equal weighting across 20 companies, one going to zero costs you ~5%. Diversification doesn\'t eliminate risk but it reduces it! 🎯',
    },
    {
      difficulty: 'hard',
      question: 'During a recession, which type of stock tends to hold up best?',
      options: ['High-growth tech stocks', 'Defensive stocks like utilities, food, and healthcare', 'New IPO stocks', 'The cheapest stocks by price'],
      correct: 1,
      explanation: 'Defensive stocks sell things people always need (electricity, groceries, medicine). Even in recessions, people still pay their power bill! These are called "recession-resistant." 🛡️',
    },
    {
      difficulty: 'hard',
      question: 'A company has a P/E ratio of 80 — much higher than its industry average of 20. When could this be justified?',
      options: ['Never — a high P/E always means overvalued', 'If the company is expected to grow earnings very rapidly, making today\'s price reasonable for future profits', 'Only if the company pays large dividends', 'When the company is over 100 years old'],
      correct: 1,
      explanation: 'A high P/E can be justified if the company is growing fast. If earnings double each year, investors pay a premium today for tomorrow\'s profits. But if growth disappoints, the stock can crash! ⚡',
    },
  ],
  module5: [
    // ── Easy ──
    {
      difficulty: 'easy',
      question: 'What happens when you "buy" a stock?',
      options: ['You receive a physical certificate in the mail', 'You exchange money for shares that are recorded in your account', 'You call the company\'s CEO', 'The company sends you a thank-you card'],
      correct: 1,
      explanation: 'When you buy stock, your money is exchanged for shares that are tracked digitally in your brokerage account. It\'s all electronic! 💻',
    },
    {
      difficulty: 'easy',
      question: 'You bought a stock at $20 and it\'s now worth $25. What\'s your gain?',
      options: ['$20', '$25', '$5 per share', '$45'],
      correct: 2,
      explanation: '$25 (current price) − $20 (your cost) = $5 gain per share. That\'s a 25% return! 🎯',
    },
    {
      difficulty: 'easy',
      question: 'You bought a stock at $50 and it dropped to $40. What should you think about?',
      options: ['Panic and sell immediately!', 'Why did the price drop? Is the company still good long-term?', 'Stocks never go down, this must be an error', 'Buy as much as possible because it\'s cheap'],
      correct: 1,
      explanation: 'Don\'t panic! Think about WHY the price dropped. If the company is still strong, it might recover. If something fundamental changed, that\'s different. Always think, don\'t react emotionally! 🧠',
    },
    // ── Medium ──
    {
      difficulty: 'medium',
      question: 'What types of accounts can you use to invest in stocks?',
      options: ['Only savings accounts', 'Brokerage accounts, retirement accounts (like IRAs or 401ks), and custodial accounts for minors', 'Only accounts at the stock exchange directly', 'Stocks can only be bought with cash — no accounts needed'],
      correct: 1,
      explanation: 'There are many account types: regular brokerage accounts, tax-advantaged retirement accounts, and custodial accounts where parents invest for kids. Each has different tax rules! 🏦',
    },
    {
      difficulty: 'medium',
      question: 'What is the difference between a market order and a limit order?',
      options: ['They are the same thing', 'A market order buys at the current price immediately; a limit order sets a maximum price you\'re willing to pay', 'A limit order always gets filled first', 'Market orders are only for professional traders'],
      correct: 1,
      explanation: 'Market order: "Buy now at whatever price!" Limit order: "Only buy if the price is $X or lower." Limit orders give you control but might not execute if the price never reaches your limit! 🎚️',
    },
    {
      difficulty: 'medium',
      question: 'If you sell a stock for more than you paid, what happens with taxes?',
      options: ['You never pay taxes on investment gains', 'You may owe capital gains tax on the profit', 'The company pays the tax for you', 'Taxes only apply if you lose money'],
      correct: 1,
      explanation: 'In most countries, investment profits (capital gains) are taxed. Holding for over a year often gets a lower tax rate than short-term gains. Always check the rules in your country! 🧾',
    },
    // ── Hard ──
    {
      difficulty: 'hard',
      question: 'What is the wash-sale rule?',
      options: ['A rule requiring investors to clean up after a bad trade', 'A tax rule that disallows claiming a loss if you rebuy the same stock within 30 days', 'A limit on how many times you can sell the same stock in a year', 'A rule about not trading during market hours'],
      correct: 1,
      explanation: 'The wash-sale rule: you can\'t sell a stock for a loss, then immediately buy it back just to claim the tax loss. You must wait 30 days. This prevents gaming the tax system! ♻️',
    },
    {
      difficulty: 'hard',
      question: 'What is "slippage" in trading?',
      options: ['A broker making an error on your order', 'The difference between the expected price of a trade and the actual price you get', 'Forgetting to place a trade', 'When a stock\'s price falls after you buy it'],
      correct: 1,
      explanation: 'Slippage happens when markets move between the moment you place an order and when it executes. Fast-moving or illiquid stocks have more slippage. It\'s a hidden cost of trading! ⚡',
    },
    {
      difficulty: 'hard',
      question: 'You own a stock that has tripled in value. When might selling just part of it (trimming) make sense?',
      options: ['Never — always hold winners forever', 'When one stock has grown so large it makes up too much of your portfolio and increases your risk', 'Only when the company reports bad earnings', 'When the stock price ends in an odd number'],
      correct: 1,
      explanation: 'If one stock becomes 60% of your portfolio, a crash there would devastate you. Trimming (selling a portion) to rebalance is smart risk management — you keep upside but reduce concentration risk! ⚖️',
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

/* Hidden mastery badges — unlocked only by completing Easy + Medium + Hard on a module */
const MASTERY_BADGES = [
  { id: 'mastery_1', module: 1, name: 'Stock Whiz',        emoji: '⚡', description: 'Conquered all 3 difficulty levels of What Are Stocks?' },
  { id: 'mastery_2', module: 2, name: 'Market Master',     emoji: '🔥', description: 'Conquered all 3 difficulty levels of How the Market Works!' },
  { id: 'mastery_3', module: 3, name: 'Company Guru',      emoji: '💎', description: 'Conquered all 3 difficulty levels of Picking Good Companies!' },
  { id: 'mastery_4', module: 4, name: 'Strategy Sage',     emoji: '🧙', description: 'Conquered all 3 difficulty levels of Smart Investing Strategies!' },
  { id: 'mastery_5', module: 5, name: 'Trade Legend',      emoji: '👑', description: 'Conquered all 3 difficulty levels of Placing Trades!' },
  { id: 'ultimate',  module: 0, name: 'Ultimate Investor', emoji: '🌟', description: 'Mastered every quiz at all difficulty levels. You are unstoppable!' },
];
