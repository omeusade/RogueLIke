import { Enemy } from './enemy.js';
import { randomPointOnScreenEdge, randomRange } from './utils.js';

export class WaveManager {
    constructor() {
        this.wave = 0;
        this.enemiesRemaining = 0;
        this.enemiesAlive = 0;
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.spawnInterval = 0.4;
        this.intermissionTimer = 0;
        this.state = 'INTERMISSION';
        this.waveCleared = false;
    }

    startNextWave() {
        this.wave++;
        const totalCount = 5 + this.wave * 3;
        this.spawnQueue = this._buildSpawnList(totalCount);
        this.enemiesRemaining = this.spawnQueue.length;
        this.enemiesAlive = 0;
        this.spawnTimer = 0;
        this.spawnInterval = Math.max(0.1, 0.4 - this.wave * 0.01);
        this.state = 'SPAWNING';
        this.waveCleared = false;
    }

    _buildSpawnList(count) {
        const types = [];
        for (let i = 0; i < count; i++) {
            const roll = Math.random();
            if (this.wave >= 5 && roll < 0.15) {
                types.push('shielded');
            } else if (this.wave >= 3 && roll < 0.30) {
                types.push('ranged');
            } else {
                types.push('normal');
            }
        }
        return types;
    }

    getEnemyStats(type) {
        const hpScale = 1 + (this.wave - 1) * 0.18;
        const speedScale = 1 + (this.wave - 1) * 0.05;
        const base = {
            hp: Math.round(20 * hpScale),
            speed: 60 * speedScale,
            contactDamage: Math.round(8 + this.wave * 1.5),
            xpValue: Math.round(10 * (1 + (this.wave - 1) * 0.1))
        };

        if (type === 'ranged') {
            base.hp = Math.round(base.hp * 0.7);
            base.speed = base.speed * 0.85;
            base.xpValue = Math.round(base.xpValue * 1.4);
            base.contactDamage = Math.round(base.contactDamage * 0.6);
        } else if (type === 'shielded') {
            base.hp = Math.round(base.hp * 1.5);
            base.speed = base.speed * 0.7;
            base.xpValue = Math.round(base.xpValue * 1.8);
        }

        return base;
    }

    update(dt, playerX, playerY, canvasW, canvasH, enemies) {
        if (this.state === 'INTERMISSION') {
            this.intermissionTimer -= dt;
            if (this.intermissionTimer <= 0) {
                this.startNextWave();
                return 'WAVE_START';
            }
            return null;
        }

        if (this.state === 'SPAWNING') {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
                this.spawnTimer = this.spawnInterval;
                const type = this.spawnQueue.pop();
                const stats = this.getEnemyStats(type);
                const pos = randomPointOnScreenEdge(playerX, playerY, canvasW + 100, canvasH + 100, 60);
                const enemy = new Enemy(
                    pos.x, pos.y,
                    stats.hp, stats.speed, stats.contactDamage, stats.xpValue,
                    type
                );
                enemies.push(enemy);
                this.enemiesAlive++;
            }
            if (this.spawnQueue.length <= 0) {
                this.state = 'ACTIVE';
            }
        }

        const aliveCount = enemies.filter(e => e.alive).length;
        this.enemiesAlive = aliveCount;
        this.enemiesRemaining = aliveCount + this.spawnQueue.length;

        if (this.state === 'ACTIVE' && aliveCount === 0) {
            this.waveCleared = true;
            this.state = 'INTERMISSION';
            this.intermissionTimer = 2.0;
            return 'WAVE_CLEAR';
        }

        return null;
    }

    beginIntermission() {
        this.state = 'INTERMISSION';
        this.intermissionTimer = 2.0;
    }
}
