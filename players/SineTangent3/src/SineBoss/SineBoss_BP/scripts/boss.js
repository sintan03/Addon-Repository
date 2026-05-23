import * as server from "@minecraft/server";

import { bossData } from "./data.js"

const tick = 20;

const dimLimit = {
    "minecraft:overworld": -64,
    "minecraft:nether": 0,
    "minecraft:the_end": 0
};

/**
 * 向きベクトルの向きを変える関数
 * @param { server.Vector3 } dir 変える向きベクトル
 * @param { Number } amount 変える角度(反時計回り)
 * @returns { server.Vector3 } 変更された角度
 */
function rotateDir(dir, amount) {
    const angle = amount * Math.PI / 180;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Y軸回転（XZ平面）    
    const rotated = {
        x: dir.x * cos - dir.z * sin,
        y: dir.y, // 上下はそのまま
        z: dir.x * sin + dir.z * cos
    };
    return rotated;
};

/**
 * いい感じにランダムな向きベクトルを生成する関数
 * @returns { server.Vector3 } いい感じにランダムな向きベクトル
 */
function randomDir() {
    const angle = Math.random() * Math.PI * 2;

    const y = Math.random() * 0.8 - 0.2;

    const horizontal = Math.sqrt(1 - y * y); // 長さ1を維持

    return {
        x: Math.cos(angle) * horizontal,
        y: y,
        z: Math.sin(angle) * horizontal
    };
}

/**
 * 配列の指定したインデックスまで合計する関数
 * @param { Number[] } arr 合計したい配列
 * @param { Number } index 合計したいインデックス
 * @returns { Number } 結果
 */
function sumArray(arr, index) {
    let sum = 0;
    for (let i = 0; i <= Math.min(index, arr.length - 1); i++) {
        sum += arr[i];
    }
    return sum;
};

/**
 * XZで正規化する関数(Yはそのまま)
 * @param { server.Vector3 } dir XZで正規化したいベクトル
 * @returns { server.Vector3 } XZで正規化されたベクトル
 */
function normalizeXZ(dir) {
    const len = Math.sqrt(dir.x * dir.x + dir.z * dir.z);

    if (len === 0) return { x: 0, y: dir.y, z: 0 };

    return {
        x: dir.x / len,
        y: dir.y, // そのまま
        z: dir.z / len
    };
}

/**
 * ボスのスキル実行関数
 * @param { * } data ボスのスキルデータ(bossData.skill[phase][skill])
 * @param { server.Entity } entity ボスエンティティ
 */
function runSkill(data, entity) {
    if (!entity || !entity.isValid) return;
    const loc = entity.location;
    const { x, y, z } = loc;
    const entityDir = entity.getViewDirection();
    const dirs = [];
    switch (data.type) {
        case `line`:
            try {
                entity.dimension.spawnParticle(data.active.particle.name, {
                    x: x + data.active.particle.offset.width * entityDir.x,
                    y: y + data.active.particle.offset.height,
                    z: z + data.active.particle.offset.width * entityDir.z
                });
                entity.dimension.playSound(data.active.sound.name, entity.location, {
                    volume: data.active.sound.volume,
                    pitch: data.active.sound.pitch
                });
                for (let i = 0; i < data.attack.rotate.length; i++) dirs.push(normalizeXZ(rotateDir(entityDir, data.attack.rotate[i])));
                for (let i = 1; i <= data.attack.tick; i++) {
                    server.system.runTimeout(() => {
                        for (const dir of dirs) {
                            const targetPos = {
                                x: loc.x + (dir.x * i * data.attack.speed),
                                y: loc.y + data.attack.locOff.height,
                                z: loc.z + (dir.z * i * data.attack.speed)
                            };
                            try {
                                for (let j = data.attack.amount.start; j < data.attack.amount.end; j++) {
                                    entity.dimension.spawnParticle(data.attack.particle.name, {
                                        x: targetPos.x,
                                        y: targetPos.y + data.attack.particle.offsetY + j,
                                        z: targetPos.z
                                    });
                                    if (data.attack.sound !== false && j === data.attack.amount.start) {
                                        entity.dimension.playSound(data.attack.sound.name, targetPos, {
                                            volume: data.attack.sound.volume,
                                            pitch: data.attack.sound.pitch
                                        });
                                    };
                                    const hitEntities = entity.dimension.getEntities({
                                        location: { x: targetPos.x, y: targetPos.y + j, z: targetPos.z },
                                        maxDistance: data.attack.distance
                                    });
                                    for (const hitEntity of hitEntities) {
                                        if (hitEntity.typeId === "minecraft:xp_orb" || hitEntity.typeId === "minecraft:arrow" || hitEntity.typeId === "minecraft:item") continue;
                                        if (hitEntity.typeId !== `minecraft:player`) continue;
                                        hitEntity.runCommand(`damage @s ${data.attack.damage} entity_attack entity @e[type=${entity.typeId},c=1]`);
                                    }
                                }
                            } catch (ee) { }
                        };
                    }, i);
                };
            } catch (e) { };
            break;
        case `circle`:
            try {
                entity.dimension.spawnParticle(data.active.particle.name, {
                    x: x + data.active.particle.offset.width * entityDir.x,
                    y: y + data.active.particle.offset.height,
                    z: z + data.active.particle.offset.width * entityDir.z
                });
                entity.dimension.playSound(data.active.sound.name, entity.location, {
                    volume: data.active.sound.volume,
                    pitch: data.active.sound.pitch
                });
                for (let i = 0; i < data.attack.rotate.length; i++) dirs.push(normalizeXZ(rotateDir(entityDir, data.attack.rotate[i])));
                for (let i = 1; i <= data.attack.tick; i++) {
                    server.system.runTimeout(() => {
                        for (const dir of dirs) {
                            const angle = i * data.attack.angleMulti * Math.PI / 180;
                            const sin = Math.sin(angle);
                            const cos = Math.cos(angle);
                            let targetPos = {
                                x: loc.x + ((dir.x * cos - dir.z * sin) * Math.sin(i / data.attack.rotationSpeed) * data.attack.speed),
                                y: loc.y + data.attack.locOff.height,
                                z: loc.z + ((dir.x * sin + dir.z * cos) * Math.sin(i / data.attack.rotationSpeed) * data.attack.speed)
                            };
                            try {
                                for (let j = data.attack.amount.start; j < data.attack.amount.end; j++) {
                                    entity.dimension.spawnParticle(data.attack.particle.name, {
                                        x: targetPos.x,
                                        y: targetPos.y + data.attack.particle.offsetY + j,
                                        z: targetPos.z
                                    });
                                    if (data.attack.sound !== false && j === data.attack.amount.start) {
                                        entity.dimension.playSound(data.attack.sound.name, targetPos, {
                                            volume: data.attack.sound.volume,
                                            pitch: data.attack.sound.pitch
                                        });
                                    };
                                    const hitEntities = entity.dimension.getEntities({
                                        location: { x: targetPos.x, y: targetPos.y + j, z: targetPos.z },
                                        maxDistance: data.attack.distance
                                    });
                                    for (const hitEntity of hitEntities) {
                                        if (hitEntity.typeId === "minecraft:xp_orb" || hitEntity.typeId === "minecraft:arrow" || hitEntity.typeId === "minecraft:item") continue;
                                        if (hitEntity.typeId !== `minecraft:player`) continue;
                                        hitEntity.runCommand(`damage @s ${data.attack.damage} entity_attack entity @e[type=${entity.typeId},c=1]`);
                                    }
                                }
                            } catch (ee) { }
                        };
                    }, i);
                };
            } catch (e) { };
            break;
        case `explosion`:
            try {
                if (data.active.particle !== false) {
                    entity.dimension.spawnParticle(data.active.particle.name, {
                        x: x + data.active.particle.offset.width * entityDir.x,
                        y: y + data.active.particle.offset.height,
                        z: z + data.active.particle.offset.width * entityDir.z
                    });
                };
                entity.dimension.playSound(data.active.sound.name, entity.location, {
                    volume: data.active.sound.volume,
                    pitch: data.active.sound.pitch
                });
                let explosion = [];
                const speed = [];
                for (let i = 0; i < data.attack.bullet; i++) {
                    explosion.push(Math.max(5, data.attack.explosion.tick - i));
                    speed.push(Math.random() * 1.2 + 0.4);
                    dirs.push(randomDir());
                };
                for (let i = 0; i <= data.attack.tick; i++) {
                    server.system.runTimeout(() => {
                        let delay = 0;
                        let index = -1;
                        for (const dir of dirs) {
                            delay = delay + data.attack.delay;
                            server.system.runTimeout(() => {
                                index++;
                                if (explosion[index] > 0) {
                                    explosion[index] -= 1;
                                    const targetPos = {
                                        x: loc.x + (dir.x * i * data.attack.speed * speed[index]),
                                        y: loc.y + (dir.y * i * data.attack.speed * speed[index]) + data.attack.locOff.height,
                                        z: loc.z + (dir.z * i * data.attack.speed * speed[index])
                                    };
                                    try {
                                        for (let j = data.attack.amount.start; j < data.attack.amount.end; j++) {
                                            entity.dimension.spawnParticle(data.attack.particle.name, {
                                                x: targetPos.x,
                                                y: targetPos.y + data.attack.particle.offsetY + j,
                                                z: targetPos.z
                                            });
                                            if (data.attack.sound !== false && j === data.attack.amount.start) {
                                                entity.dimension.playSound(data.attack.sound.name, targetPos, {
                                                    volume: data.attack.sound.volume,
                                                    pitch: data.attack.sound.pitch
                                                });
                                            };
                                            if (data.attack.damage !== 0) {
                                                const hitEntities = entity.dimension.getEntities({
                                                    location: { x: targetPos.x, y: targetPos.y + j, z: targetPos.z },
                                                    maxDistance: data.attack.distance
                                                });
                                                for (const hitEntity of hitEntities) {
                                                    if (hitEntity.typeId === "minecraft:xp_orb" || hitEntity.typeId === "minecraft:arrow" || hitEntity.typeId === "minecraft:item") continue;
                                                    if (hitEntity.typeId !== `minecraft:player`) continue;
                                                    hitEntity.runCommand(`damage @s ${data.attack.damage} entity_attack entity @e[type=${entity.typeId},c=1]`);
                                                };
                                            };
                                            if (explosion[index] <= 0) {
                                                entity.dimension.spawnParticle(data.attack.explosion.particle.name, {
                                                    x: targetPos.x + data.attack.explosion.particle.offset.x,
                                                    y: targetPos.y + data.attack.explosion.particle.offset.y + j,
                                                    z: targetPos.z + data.attack.explosion.particle.offset.z
                                                });
                                                if (data.attack.sound !== false && j === data.attack.amount.start) {
                                                    entity.dimension.playSound(data.attack.explosion.sound.name, targetPos, {
                                                        volume: data.attack.explosion.sound.volume,
                                                        pitch: data.attack.explosion.sound.pitch
                                                    });
                                                };
                                                const hitEntities = entity.dimension.getEntities({
                                                    location: { x: targetPos.x, y: targetPos.y + j, z: targetPos.z },
                                                    maxDistance: data.attack.explosion.distance
                                                });
                                                for (const hitEntity of hitEntities) {
                                                    if (hitEntity.typeId === "minecraft:xp_orb" || hitEntity.typeId === "minecraft:arrow" || hitEntity.typeId === "minecraft:item") continue;
                                                    if (hitEntity.typeId !== `minecraft:player`) continue;
                                                    hitEntity.runCommand(`damage @s ${data.attack.explosion.damage} entity_explosion entity @e[type=${entity.typeId},c=1]`);
                                                };
                                            }
                                        }
                                    } catch (ee) { };
                                };
                            }, Math.round(delay));
                        };
                    }, i);
                };
            } catch (e) { };
            break;
    };
};

server.world.afterEvents.itemUse.subscribe(ev => {
    const player = ev.source;
    if (!player || player.typeId !== `minecraft:player`) return;

    const item = ev.itemStack;
    if (!item) return;

    const itemId = item.typeId;
    for (const summonData of [
        { itemId: `sineboss:crusher_summoner`, type: `sineboss:crusher`, axe: `sineboss:crushers_axe`, name: `§9クラッシャー§r§f` },
        { itemId: `sineboss:true_crusher_summoner`, type: `sineboss:true_crusher`, axe: `sineboss:true_crushers_axe`, name: `§9真・クラッシャー§r§f` }]) {
        if (itemId === summonData.itemId) {
            const loc = player.location;
            const { x, y, z } = loc;
            if (player.dimension.getEntities({ location: player.location, maxDistance: 64, type: summonData.type }).length === 0) {
                if (y >= dimLimit[player.dimension.id]) {
                    const entity = player.dimension.spawnEntity(summonData.type, { x: x, y: y + 9, z: z });
                    const players = entity.dimension.getEntities({ location: entity.location, maxDistance: 64, type: `minecraft:player` });
                    const playerAmount = players.length ?? 0;
                    entity.setProperty(`sineboss:player`, playerAmount);
                    entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${summonData.axe}`);
                    if (summonData.itemId === `sineboss:true_crusher_summoner`) {
                        entity.runCommand(`enchant @s sharpness 5`);
                    };
                    entity.addEffect(`slow_falling`, tick * 3, {
                        amplifier: 0,
                        showParticles: true
                    });
                    entity.dimension.spawnParticle(`minecraft:huge_explosion_emitter`, entity.location);
                    player.dimension.playSound(`random.explode`, player.location);
                    for (const warman of players) {
                        warman.sendMessage(`${summonData.name}が召喚されました`);
                    };
                    player.runCommand(`clear @s ${summonData.itemId} 0 1`);
                } else {
                    player.sendMessage(`§cここでは召喚できません`);
                };
            } else {
                player.sendMessage(`§c近くに${summonData.name}§cがいるので召喚できません`);
            };
        };
    };
});

// ボス行動
server.system.runInterval(() => {
    // 全ディメンション
    for (const worldDim of ["overworld", "nether", "the_end"]) {
        // 全ボス
        for (const bossTypeId of [`sineboss:crusher`, `sineboss:true_crusher`]) {
            const entities = server.world.getDimension(worldDim).getEntities({ type: bossTypeId });
            if (entities.length === 0) continue;
            const data = bossData[bossTypeId];
            for (const entity of entities) {
                // エンティティプロパティ
                let time = entity.getProperty(`sineboss:time`);
                let next = entity.getProperty(`sineboss:next`);
                let attack = entity.getProperty(`sineboss:attack`);
                const playerAmount = entity.getProperty(`sineboss:player`);
                if (time >= next) {
                    const random = Math.random();
                    const health = entity.getComponent(`minecraft:health`).currentValue;
                    const maxHealth = entity.getComponent(`minecraft:health`).defaultValue;
                    for (let phase = 0; phase <= data.phase.length; phase++) {
                        if (phase !== data.phase.length && health <= maxHealth * data.phase[phase]) continue;

                        const rateSum = sumArray(data.rate[phase], data.rate[phase].length - 1);
                        for (let skill = 0; skill < data.rate[phase].length; skill++) {
                            const rate = (sumArray(data.rate[phase], skill)) / rateSum;
                            if (random >= rate) continue;

                            const skillData = data.skill[phase][skill];

                            if (entity.location.y >= dimLimit[entity.dimension.id]) {
                                entity.addEffect(`slowness`, skillData.charge.cooltime, {
                                    amplifier: skillData.charge.amplifier,
                                    showParticles: true
                                });
                                entity.dimension.spawnParticle(skillData.charge.particle.name, {
                                    x: entity.location.x,
                                    y: entity.location.y + skillData.charge.particle.offsetY,
                                    z: entity.location.z
                                });
                                entity.dimension.playSound(skillData.charge.sound.name, entity.location, {
                                    volume: skillData.charge.sound.volume,
                                    pitch: skillData.charge.sound.pitch
                                });
                                entity.setProperty(`sineboss:next`, skillData.next);

                                server.system.runTimeout(() => {
                                    runSkill(skillData, entity);
                                }, skillData.charge.tick);
                            };

                            break;
                        };

                        break;
                    };
                    entity.setProperty(`sineboss:time`, 0);
                } else {
                    time++;
                    entity.setProperty(`sineboss:time`, time);
                };
            };
        };
    };
}, 20);

server.world.afterEvents.entityHurt.subscribe(ev => {
    const boss = ev.hurtEntity;
    if (!boss) return;
    if ([`sineboss:crusher`, `sineboss:true_crusher`].includes(boss.typeId)) {
        const source = ev.damageSource;
        if (!source || !source.cause) return;
        let pro = boss.getProperty(`sineboss:attack`);
        if (pro >= 5) {
            let dir = boss.getViewDirection();
            dir.x *= -0.6;
            dir.y = 0;
            dir.z *= -0.6;
            boss.applyImpulse(dir);
            boss.addEffect(`speed`, 20, {
                amplifier: 2,
                showParticles: true
            });
            boss.addEffect(`weakness`, 20, {
                amplifier: 1,
                showParticles: false
            });
            boss.setProperty(`sineboss:attack`, Math.round(Math.random() * 2));
        } else {
            pro++;
            boss.setProperty(`sineboss:attack`, pro);
        };
    };
});

server.world.afterEvents.entityDie.subscribe(ev => {
    const boss = ev.deadEntity;
    if ([`sineboss:crusher`, `sineboss:true_crusher`].includes(boss.typeId)) {
        const playerAmount = boss.getProperty(`sineboss:player`);
        if (!boss) return;
        switch (boss.typeId) {
            case `sineboss:crusher`:
                try {
                    boss.dimension.spawnItem(new server.ItemStack(`sineboss:crushers_crystal`, Math.min(Math.floor(playerAmount + (Math.random() * playerAmount * 2) ** 1.3), 64)), boss.location);
                    const players = boss.dimension.getEntities({ location: boss.location, maxDistance: 64, type: `minecraft:player` });
                    for (const player of players) {
                        player.sendMessage(`§9クラッシャー§r§fが討伐されました`);
                    };
                } catch (e) { };
                break;
            case `sineboss:true_crusher`:
                try {
                    boss.dimension.spawnItem(new server.ItemStack(`sineboss:true_crushers_crystal`, Math.min(Math.floor(playerAmount + (Math.random() * playerAmount * 4) ** 1.2), 64)), boss.location);
                    const players = boss.dimension.getEntities({ location: boss.location, maxDistance: 64, type: `minecraft:player` });
                    for (const player of players) {
                        player.sendMessage(`§9真・クラッシャー§r§fが討伐されました`);
                    };
                } catch (e) { };
                break;
        };
    };
});