const CATALOGUE = [
    { id: 'sharpened_claws', name: 'Sharpened Claws', icon: '🐾', cost: 10, effect: 'attackCooldown', value: 0.85 },
    { id: 'long_paws',       name: 'Long Paws',        icon: '🦾', cost: 8,  effect: 'attackRange',   value: 1.20 },
    { id: 'cat_nap',         name: 'Cat Nap',          icon: '😴', cost: 12, effect: 'restoreHp',     value: 2    },
    { id: 'fluffy_armour',   name: 'Fluffy Armour',    icon: '🛡️', cost: 15, effect: 'maxHp',        value: 2    },
    { id: 'quick_paws',      name: 'Quick Paws',        icon: '💨', cost: 10, effect: 'speed',         value: 1.15 },
    { id: 'yarn_magnet',     name: 'Yarn Magnet',       icon: '🧶', cost: 8,  effect: 'coinRadius',    value: 2    },
    { id: 'catnip_frenzy',   name: 'Catnip Frenzy',    icon: '🌿', cost: 20, effect: 'comboWindow',   value: 500  },
    { id: 'iron_whiskers',   name: 'Iron Whiskers',    icon: '⚡', cost: 18, effect: 'invulnerability', value: 500 },
];
const MAX_PURCHASES = 3;

export class ShopManager {
    #coins = 0;
    #coinsSpent = 0;
    #purchases = {};
    #onPurchase;

    constructor({ onPurchase }) {
        this.#onPurchase = onPurchase;
        this.#purchases = Object.fromEntries(CATALOGUE.map(u => [u.id, 0]));
    }

    addCoins(amount) { this.#coins += amount; }
    getCoins() { return this.#coins; }
    getCoinsSpent() { return this.#coinsSpent; }

    purchase(upgradeId) {
        const upgrade = CATALOGUE.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        if (this.#coins < upgrade.cost) return false;
        if (this.#purchases[upgradeId] >= MAX_PURCHASES) return false;
        this.#coins -= upgrade.cost;
        this.#coinsSpent += upgrade.cost;
        this.#purchases[upgradeId]++;
        this.#onPurchase(upgrade);
        return true;
    }

    getOffers() {
        const available = CATALOGUE.filter(u => this.#purchases[u.id] < MAX_PURCHASES);
        if (available.length <= 4) return available;
        return [...available].sort(() => Math.random() - 0.5).slice(0, 4);
    }

    renderShop() {
        const offers = this.getOffers();
        const container = document.getElementById('shop-cards');
        const coins = this.#coins;
        const purchases = this.#purchases;
        container.innerHTML = offers.map(u => `
            <div class="shop-card ${coins < u.cost ? 'unaffordable' : ''}"
                 onclick="window.__shopPurchase('${u.id}')">
                <div class="shop-icon">${u.icon}</div>
                <div class="shop-name">${u.name}</div>
                <div class="shop-cost">🪙 ${u.cost}</div>
                <div class="shop-count">${purchases[u.id]}/${MAX_PURCHASES}</div>
            </div>
        `).join('');
        document.getElementById('shop-coin-count').textContent = coins;
    }

    getPurchases() { return { ...this.#purchases }; }

    restoreState({ purchases, coins, coinsSpent }) {
        this.#purchases = { ...Object.fromEntries(CATALOGUE.map(u => [u.id, 0])), ...purchases };
        this.#coins = coins ?? 0;
        this.#coinsSpent = coinsSpent ?? 0;
    }

    reset() {
        this.#coins = 0;
        this.#coinsSpent = 0;
        this.#purchases = Object.fromEntries(CATALOGUE.map(u => [u.id, 0]));
    }
}
