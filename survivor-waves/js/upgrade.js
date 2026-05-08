const UPGRADE_POOL = [
    {
        id: 'damage',
        name: 'Dano+',
        description: 'Aumenta o dano dos projéteis em 25%',
        icon: '🔥',
        color: '#FF4444',
        apply(player) { player.damage = Math.round(player.damage * 1.25); }
    },
    {
        id: 'fireRate',
        name: 'Cadência+',
        description: 'Aumenta a velocidade de ataque em 15%',
        icon: '⚡',
        color: '#FFAA00',
        apply(player) { player.fireInterval = Math.max(0.08, player.fireInterval * 0.85); }
    },
    {
        id: 'speed',
        name: 'Velocidade+',
        description: 'Aumenta a velocidade de movimento em 15%',
        icon: '💨',
        color: '#44AAFF',
        apply(player) { player.speed *= 1.15; }
    },
    {
        id: 'multishot',
        name: 'Multishot',
        description: 'Dispara +1 projétil por tiro (máx. 5)',
        icon: '🔱',
        color: '#BB44FF',
        maxStacks: 4,
        apply(player) { if (player.multishot < 5) player.multishot++; }
    },
    {
        id: 'health',
        name: 'Vida+',
        description: 'Recupera 30 HP e aumenta HP máximo em 25',
        icon: '💚',
        color: '#44FF66',
        apply(player) {
            player.maxHp += 25;
            player.hp = Math.min(player.hp + 30, player.maxHp);
        }
    }
];

export class UpgradeSystem {
    constructor() {
        this.stacks = {};
    }

    reset() {
        this.stacks = {};
    }

    getRandomUpgrades(count = 3) {
        const available = UPGRADE_POOL.filter(u => {
            if (u.maxStacks && (this.stacks[u.id] || 0) >= u.maxStacks) return false;
            return true;
        });
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    applyUpgrade(upgrade, player) {
        upgrade.apply(player);
        this.stacks[upgrade.id] = (this.stacks[upgrade.id] || 0) + 1;
    }
}
