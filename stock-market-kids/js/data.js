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
    {
      difficulty: 'easy',
      question: 'What does "IPO" stand for?',
      options: ['International Price Offering', 'Initial Public Offering', 'Investor Profit Order', 'Internal Price Optimisation'],
      correct: 1,
      explanation: 'IPO = Initial Public Offering. It\'s when a company sells its shares to the general public for the very first time, often to raise money to grow. 🚀',
    },
    {
      difficulty: 'easy',
      question: 'Which of these best describes a "shareholder"?',
      options: ['Someone who works at the company', 'Someone who lends money to the company', 'Someone who owns stock in the company', 'Someone who buys products from the company'],
      correct: 2,
      explanation: 'A shareholder (or stockholder) owns one or more shares of a company\'s stock. That makes them a part-owner of the business! 🎉',
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
    {
      difficulty: 'medium',
      question: 'A company has 50 million shares outstanding and the share price is $20. What is its market cap?',
      options: ['$20 million', '$50 million', '$1 billion', '$50 billion'],
      correct: 2,
      explanation: 'Market cap = share price × shares outstanding. $20 × 50,000,000 = $1,000,000,000 = $1 billion. That\'s how we measure the total value of a company! 💼',
    },
    {
      difficulty: 'medium',
      question: 'A company pays a quarterly dividend of $0.50 per share. You own 200 shares. How much do you receive in a full year?',
      options: ['$50', '$100', '$200', '$400'],
      correct: 3,
      explanation: '$0.50 × 4 quarters × 200 shares = $400 per year. Dividends are paid regularly — a nice passive income stream for patient investors! 💵',
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
    {
      difficulty: 'hard',
      question: 'A company does a 2-for-1 stock split. You owned 100 shares at $80 each. What is true immediately after the split?',
      options: ['You own 50 shares at $160 each', 'You own 200 shares at $40 each', 'You own 100 shares at $160 each', 'You own 200 shares at $80 each'],
      correct: 1,
      explanation: 'In a 2-for-1 split, each share becomes 2 shares at half the price. 100 × $80 = $8,000 before; 200 × $40 = $8,000 after. Your total value is unchanged — the company just cut the pizza into smaller slices! 🍕',
    },
    {
      difficulty: 'hard',
      question: 'A company\'s IPO is priced at $20/share. On the first day of trading it closes at $35. What most likely caused this?',
      options: ['The company set the IPO price incorrectly and must refund investors', 'Strong investor demand — more buyers than sellers at the offering price pushed the price up', 'The stock exchange manually adjusted the price upward', 'The CEO bought large amounts of stock on the first day'],
      correct: 1,
      explanation: 'A first-day pop means demand far exceeded supply at the IPO price. Investment banks deliberately set IPO prices slightly below market value to create this excitement — though it means the company raised less money than it could have! 📈',
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
    {
      difficulty: 'easy',
      question: 'The Nasdaq stock exchange is well-known for listing many companies from which industry?',
      options: ['Agriculture and farming', 'Technology', 'Oil and gas', 'Real estate'],
      correct: 1,
      explanation: 'The Nasdaq is famous for its concentration of technology companies — Apple, Microsoft, Google, Meta, and Amazon are all listed there. 💻',
    },
    {
      difficulty: 'easy',
      question: 'What does "bull market" mean?',
      options: ['A market where most stock prices are falling', 'A market where most stock prices are rising over time', 'A market that only trades large companies', 'A market that opens at sunrise'],
      correct: 1,
      explanation: 'A bull market = rising prices and investor optimism. A bear market = falling prices and pessimism. Bulls attack by thrusting upward with their horns; bears swipe downward with their paws — that\'s how traders remember it! 🐂🐻',
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
    {
      difficulty: 'medium',
      question: 'Stock X has a bid price of $49.90 and an ask price of $50.10. What is the bid-ask spread?',
      options: ['$0.10', '$0.20', '$0.50', '$49.90'],
      correct: 1,
      explanation: 'Bid-ask spread = ask − bid = $50.10 − $49.90 = $0.20. This small gap is how market makers earn a profit for providing liquidity. Tight spreads mean lower trading costs for you! 🤝',
    },
    {
      difficulty: 'medium',
      question: 'A company reports earnings that beat analyst expectations by 30%. What typically happens to its stock price?',
      options: ['Nothing — stock prices don\'t react to earnings', 'The price usually rises as more investors want to own the stock', 'The price drops because the company set expectations too low', 'The exchange pauses trading for 24 hours to reassess'],
      correct: 1,
      explanation: 'Beating expectations signals a company is performing better than the market predicted. More investors want in → more buyers than sellers → price rises. But "beating by less than expected" can still cause a drop! 📰📈',
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
    {
      difficulty: 'hard',
      question: 'You short 100 shares of a stock at $50 each. The price rises to $80. What is your loss?',
      options: ['$3,000', '$5,000', '$8,000', 'Unlimited — there is no maximum loss when short selling'],
      correct: 0,
      explanation: '($80 − $50) × 100 = $3,000 loss. You borrowed and sold at $50 but must buy back at $80. Short selling risk is theoretically unlimited because a stock price can keep rising forever. ⚠️',
    },
    {
      difficulty: 'hard',
      question: 'An investor believes a stock will fall but doesn\'t want unlimited loss risk. Which strategy is most appropriate?',
      options: ['Buy a large position in the stock', 'Buy a put option instead of short selling — it limits the loss to the option premium paid', 'Short sell the stock and hope for the best', 'Sell all holdings and keep cash'],
      correct: 1,
      explanation: 'A put option gives the right (not obligation) to sell shares at a set price. If the stock rises instead of falls, you only lose the premium you paid for the option — not an unlimited amount. Options are a key tool for limiting short-side risk. 🎯',
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
    {
      difficulty: 'easy',
      question: 'A company earns $500,000 in revenue and spends $300,000 in expenses. What is its profit?',
      options: ['$800,000', '$300,000', '$200,000', '$500,000'],
      correct: 2,
      explanation: 'Profit = Revenue − Expenses = $500,000 − $300,000 = $200,000. Simple but crucial — this is the foundation of all company financial analysis! 💰',
    },
    {
      difficulty: 'easy',
      question: 'Which of these is an example of a company\'s "liability"?',
      options: ['Cash held in the company\'s bank account', 'A bank loan the company must repay', 'A factory the company owns', 'Patents the company holds'],
      correct: 1,
      explanation: 'A liability is something a company owes. A bank loan must be paid back — that\'s a liability. Cash, factories, and patents are all assets (things the company owns). 🏦',
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
    {
      difficulty: 'medium',
      question: 'A stock trades at $60 per share and the company earns $3 per share annually. What is its P/E ratio?',
      options: ['3', '20', '57', '180'],
      correct: 1,
      explanation: 'P/E = Share Price ÷ Earnings Per Share = $60 ÷ $3 = 20. Investors are paying $20 for every $1 of annual earnings. Whether that\'s cheap or expensive depends on the company\'s growth rate and industry! 🔢',
    },
    {
      difficulty: 'medium',
      question: 'Company A has a 60% gross profit margin. Company B has 30% in the same industry. What does this suggest?',
      options: ['Company B is more profitable overall', 'Company A keeps $0.60 of every revenue dollar after direct costs — likely a pricing or efficiency advantage', 'Company A must have higher total revenue', 'Gross margin tells us nothing useful about a company'],
      correct: 1,
      explanation: 'Gross margin measures how much of each revenue dollar survives after paying the direct cost of goods. A higher margin (60% vs 30%) means Company A either charges more or produces more cheaply — a real competitive advantage! 📐',
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
    {
      difficulty: 'hard',
      question: 'A company\'s net income is $5M and its shareholders\' equity is $25M. What is its Return on Equity (ROE)?',
      options: ['5%', '10%', '20%', '125%'],
      correct: 2,
      explanation: 'ROE = Net Income ÷ Shareholders\' Equity = $5M ÷ $25M = 0.20 = 20%. For every $100 of shareholder capital, the company generates $20 of annual profit. Warren Buffett uses ROE as a key quality filter! 💡',
    },
    {
      difficulty: 'hard',
      question: 'What does "goodwill" represent on a company\'s balance sheet?',
      options: ['Cash donations to charity made by the company', 'The strong reputation customers have about the brand', 'The excess price paid when acquiring another company above its book value', 'The total amount of shareholder equity'],
      correct: 2,
      explanation: 'Goodwill is an accounting entry created during acquisitions. If you pay $100M for a company whose assets minus liabilities = $70M, the $30M extra is goodwill — representing brand value, customer relationships, and synergies that aren\'t on the balance sheet. 📒',
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
    {
      difficulty: 'easy',
      question: 'What does "diversification" mean in investing?',
      options: ['Putting all your money into one great stock', 'Spreading investments across many different stocks or assets to reduce risk', 'Only buying stocks from foreign countries', 'Investing only in companies you personally use'],
      correct: 1,
      explanation: 'Diversification = "don\'t put all your eggs in one basket." By spreading investments across many companies and sectors, a single bad outcome has less power to hurt your overall portfolio. 🧺',
    },
    {
      difficulty: 'easy',
      question: 'What is compound interest?',
      options: ['Interest paid only on your original investment amount', 'A penalty fee charged by brokers for early selling', 'Earning returns on both your original investment AND on previously earned returns', 'Interest that is only calculated once per year'],
      correct: 2,
      explanation: 'Compound interest is growth on top of growth. Year 1 you earn interest on $1,000. Year 2 you earn interest on $1,000 PLUS last year\'s interest. It snowballs over time — the longer you wait, the bigger the snowball! ⛄',
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
    {
      difficulty: 'medium',
      question: 'You invest $200 every month for 12 months. Some months the stock price is high, some low. What is the key benefit of this approach?',
      options: ['You always buy at the absolute lowest monthly price', 'You automatically diversify across many different companies', 'You buy more shares when prices are low and fewer when high, reducing your average cost over time', 'You avoid paying any capital gains tax'],
      correct: 2,
      explanation: 'This is dollar-cost averaging (DCA). When the price is low, $200 buys more shares. When high, it buys fewer. Over time your average cost per share is naturally smoothed — removing the anxiety of trying to time the market. 📅',
    },
    {
      difficulty: 'medium',
      question: 'You invest $500 at an 8% annual return. Approximately how much will it be worth after 5 years?',
      options: ['$540', '$700', '$735', '$900'],
      correct: 2,
      explanation: '$500 × 1.08⁵ = $500 × 1.469 ≈ $735. The extra $235 came from compounding — earning returns on previously earned returns. Start earlier and the numbers get much bigger! 🌱',
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
    {
      difficulty: 'hard',
      question: 'You own an equally-weighted portfolio of 10 stocks. One company goes bankrupt and its stock reaches zero. What is your approximate portfolio loss?',
      options: ['All your money is gone', 'Approximately 10% of your total portfolio value', 'Exactly 50%', 'Nothing — diversification fully protects against any single loss'],
      correct: 1,
      explanation: 'With 10 equally weighted positions, each represents ~10% of your portfolio. One going to zero costs you ~10%. The other 9 carry on. Diversification doesn\'t eliminate risk — it limits the damage any one disaster can do. 🎯',
    },
    {
      difficulty: 'hard',
      question: 'The stock market drops 35% during a severe recession. Which asset class historically holds its value best during such periods?',
      options: ['High-growth technology stocks', 'Newly-listed IPO stocks', 'Long-term government bonds', 'Cryptocurrencies'],
      correct: 2,
      explanation: 'Government bonds (especially long-term treasury bonds) are considered "safe haven" assets. During crashes, investors flee to the safety of guaranteed government payments, pushing bond prices up even as stocks fall. This is why bonds are a classic diversifier against equity crashes. 🏛️',
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
    {
      difficulty: 'easy',
      question: 'What is a "broker" in stock trading?',
      options: ['A government official who regulates the stock market', 'A person or service that executes buy and sell orders on your behalf', 'A company that creates new stocks for other companies', 'Someone who decides which companies can list on an exchange'],
      correct: 1,
      explanation: 'A broker is your intermediary to the stock market. You tell the broker what to buy or sell, and they execute the order on the exchange. Today most brokers are online platforms accessible from your phone or computer! 📱',
    },
    {
      difficulty: 'easy',
      question: 'If you sell a stock for less than you originally paid for it, what is the result called?',
      options: ['A dividend payment', 'A capital gain', 'A capital loss', 'A transaction fee'],
      correct: 2,
      explanation: 'A capital loss happens when your selling price is lower than your purchase price. For example: buy at $50, sell at $35 → $15 capital loss per share. Capital losses can often be used to offset capital gains and reduce your tax bill! 📉',
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
    {
      difficulty: 'medium',
      question: 'You place a limit buy order for Stock X at $45. The stock is currently trading at $48. What happens?',
      options: ['Your order executes immediately at the current price of $48', 'Your order waits and only executes if the price drops to $45 or below', 'Your order is automatically rejected because the stock is above your limit', 'You automatically get the best available price, whatever it is'],
      correct: 1,
      explanation: 'A limit order is patient — it says "I\'ll only buy if the price comes down to my target." If the stock never reaches $45, your order never fills. This gives you price control but no guarantee of execution. 🎚️',
    },
    {
      difficulty: 'medium',
      question: 'You bought 50 shares at $30 each and sold them at $50 each after 18 months. With a 15% long-term capital gains tax rate, how much tax do you owe?',
      options: ['$150', '$200', '$250', '$375'],
      correct: 0,
      explanation: 'Gain = ($50 − $30) × 50 shares = $1,000. Tax = $1,000 × 15% = $150. Because you held more than 12 months, you qualify for the lower long-term capital gains rate. Patience literally pays! 🧾',
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
    {
      difficulty: 'hard',
      question: 'You sell 100 shares of Company X at a $500 loss. Three weeks later you buy back 100 shares of the same company. What happens to your $500 loss under the wash-sale rule?',
      options: ['You can claim the full $500 loss on your tax return immediately', 'The $500 loss is disallowed and instead added to your cost basis in the new shares', 'You must pay a penalty of 10% of the disallowed loss', 'The loss is split: $250 this year and $250 next year'],
      correct: 1,
      explanation: 'The IRS disallows the loss because you repurchased within 30 days. But the loss isn\'t gone forever — it\'s added to your cost basis in the new shares, so you\'ll eventually benefit when you sell those. Wait 31+ days to claim the loss in the current tax year. ♻️',
    },
    {
      difficulty: 'hard',
      question: 'You place a market sell order for a thinly-traded stock expecting to receive $10,000. Your order executes and you only receive $9,600. The $400 shortfall is an example of what?',
      options: ['A broker commission fee', 'A capital loss on the trade', 'Slippage', 'Market manipulation by the exchange'],
      correct: 2,
      explanation: 'Slippage is the gap between expected and actual execution price. Your large sell order overwhelmed the available buyers at the expected price, so the remaining shares filled at lower prices. Thin markets and large orders = more slippage. ⚡',
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
