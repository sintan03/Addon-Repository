import { BlockVolume, system, world } from "@minecraft/server";

const config = {
    maxLevel: 100,
    level: 0,
    day: 0
};

const fireDamage = [`fire`, `fireTick`];

const skillData = [
    {
        rate: 0.08,
        asce: [0, 80, 300, 500],
        name: [`§6着火耐性 I`, `§c火炎耐性 I`, `§c火炎耐性 II`, `§c火炎耐性 III`],
        effect: [1, 0.7, 0.4, 0],
        tag: `mobasce_fire_resistance`
    },
    {
        rate: 0.05,
        asce: [80, 400, 700, 1400],
        name: [`§t耐性 I`, `§t耐性 II`, `§t耐性 III`, `§t耐性 IV`],
        effect: [0, 1, 2, 3],
        tag: `mobasce_resistance`
    },
    {
        rate: 0.05,
        asce: [0, 800, 1200],
        name: [`§aノックバック I`, `§aノックバック II`, `§aノックバック III`],
        effect: [0.6, 0.9, 1.2],
        tag: `mobasce_knockback`
    },
    {
        rate: 0.02,
        asce: [100, 500, 1100],
        name: [`§4出血 I`, `§4出血 II`, `§4出血 III`],
        effect: [3, 3, 3],
        damage: [1, 2, 3],
        tag: `mobasce_bleeding`
    },
    {
        rate: 0.04,
        asce: [0, 200, 600, 1200],
        name: [`§d再生 I`, `§d再生 II`, `§d再生 III`, `§d再生 IV`],
        effect: [0, 1, 2, 3],
        tag: `mobasce_regeneration`
    },
    {
        rate: 0.04,
        asce: [0],
        name: [`§b俊敏 I`],
        effect: [0],
        tag: `mobasce_speed`
    },
    {
        rate: 0.02,
        asce: [500, 1200, 1400],
        name: [`§e蘇生 I`, `§e蘇生 II`, `§e蘇生 III`],
        effect: [1, 2, 3],
        tag: `mobasce_revival`
    },
    {
        rate: 0.03,
        asce: [80, 400, 700, 1200, 1400],
        name: [`§o反射 I`, `§o反射 II`, `§o反射 III`, `§o反射 IV`, `§o反射 V`],
        effect: [1, 2, 3, 4, 5],
        tag: `mobasce_reflection`
    },
    {
        rate: 0.02,
        asce: [900],
        name: [`§l覚醒 I`],
        effect: [2],
        tag: `mobasce_awakening`
    },
    {
        rate: 0.02,
        asce: [300, 900, 1400],
        name: [`§7概念 I`, `§7概念 II`, `§7概念 III`],
        effect: [1, 2, 3],
        tag: `mobasce_concept`
    }
];

function sw(entity, skillData, index, name) {
    let newName = name;
    for (let i = 0; i < skillData.length; i++) {
        if (index[i] >= 0) {
            if (i === 4 && entity.getComponent(`minecraft:type_family`).hasTypeFamily(`undead`)) continue;
            skillAdd(entity, skillData, i, index);
            if (newName.split(`§1§r§f`).length % 3 === 1) {
                newName += `\n§1§r§f` + skillData[i].name[index[i]] + `§r§f`
                continue;
            } else {
                newName += `§r§f / §1§r§f` + skillData[i].name[index[i]] + `§r§f`;
                continue;
            };
        } else {
            continue;
        };
    };
    return newName;
};

function skillAdd(entity, skillData, i, index) {
    entity.addTag(`${skillData[i].tag}${index[i]}`);
    switch (i) {
        case 0:
            if (index[i] === 3) {
                entity.addEffect(`minecraft:fire_resistance`, 20000000, { amplifier: 0 });
            };
            return;
        case 1:
            entity.addEffect(`minecraft:resistance`, 20000000, { amplifier: skillData[i].effect[index[i]] });
            return;
        case 4:
            entity.addEffect(`minecraft:regeneration`, 20000000, { amplifier: skillData[i].effect[index[i]] });
            return;
        case 5:
            entity.addEffect(`minecraft:speed`, 20000000, { amplifier: skillData[i].effect[index[i]] });
            return;
    };
};

const limitAscension = 100;
const minLv = 0;
/** @type { number } */
let maxLv;
system.run(() => {
    /** @type { config } */
    let dp = JSON.parse(world.getDynamicProperty(`mobasce:data`) ?? JSON.stringify(config));
    maxLv = dp.maxLevel;
    const day = world.getDay();
    if (day > dp.day) {
        dp.level = Math.min(dp.level + day - dp.day, dp.maxLevel);
        dp.day += day - dp.day;
        world.setDynamicProperty(`mobasce:data`, JSON.stringify(dp));
    };
});

world.afterEvents.entitySpawn.subscribe(ev => {
    const { entity, cause } = ev;
    if (cause === `Loaded`) return;
    let dp;
    try {
        dp = entity.getDynamicProperty(`mobasce:data`);
    } catch (e) {
        return;
    };
    let entityMaxHp = 20;
    if (!dp) {
        if (!entity.hasComponent(`minecraft:type_family`)) return;
        if (!entity.getComponent(`minecraft:type_family`).hasTypeFamily(`monster`)) return;
        if (!entity.hasComponent(`minecraft:health`)) return;
        entityMaxHp = entity.getComponent(`minecraft:health`).effectiveMax;
        if (entityMaxHp > limitAscension && cause !== `Born`) return;
    };
    const day = world.getDay();
    let spawnLv = dp;
    let dpWorld = JSON.parse(world.getDynamicProperty(`mobasce:data`) ?? JSON.stringify(config));
    if (day > dpWorld.day) {
        dpWorld.level = Math.min(dpWorld.level + day - dpWorld.day, dpWorld.maxLevel);
        dpWorld.day += day - dpWorld.day;
        world.setDynamicProperty(`mobasce:data`, JSON.stringify(dpWorld));
    };
    if (spawnLv === undefined) {
        const sub = Math.floor(dpWorld.level ** 0.6);
        const r = Math.floor(Math.random() * (sub * 2 + 1)) - sub + 1;
        if (dpWorld.level + r < minLv) spawnLv = minLv;
        else if (dpWorld.level + r > dpWorld.maxLevel) spawnLv = dpWorld.maxLevel;
        else spawnLv = dpWorld.level + r;
        entity.setDynamicProperty(`mobasce:data`, spawnLv);
    };
    if (spawnLv !== 0 && (spawnLv * entityMaxHp / 200) - 1 >= 0) {
        entity.addEffect(`minecraft:health_boost`, 20000000, { amplifier: Math.min(Math.floor((spawnLv * entityMaxHp) / 200) - 1, 255), showParticles: false });
        system.run(() => {
            entity.getComponent(`minecraft:health`).setCurrentValue(entity.getComponent(`minecraft:health`).effectiveMax);
        });
    };
    const skill = [];
    for (let i = 0; i < skillData.length; i++) {
        skill.push(Math.random() / Math.log10(Math.max(10, spawnLv)));
    };
    let i = 0;
    const indexes = [];
    let name = `${entity.typeId.split(`:`)[1]} LV ${spawnLv}`;
    const rLv = Math.ceil(spawnLv + Math.random() * 201 - 101);
    for (const s of skill) {
        let index = -1;
        for (let j = 0; j < skillData[i].asce.length; j++) {
            if (s <= skillData[i].rate && rLv >= skillData[i].asce[j]) index++;
            if (entity.hasTag(`${skillData[i].tag}${j}`)) {
                index = j;
                break;
            };
        };
        indexes.push(index);
        i++;
    };
    name = sw(entity, skillData, indexes, name);
    entity.nameTag = name;
});

world.beforeEvents.entityHurt.subscribe(ev => {
    const { damage, damageSource, hurtEntity } = ev;
    const { cause, damagingEntity, damagingProjectile } = damageSource;
    if (cause === `selfDestruct`) return;
    let newDamage = damage;
    let fireMulti = 1;
    if (damagingEntity) {
        const dp = damagingEntity.getDynamicProperty(`mobasce:data`);
        if (dp !== undefined) {
            newDamage = newDamage * (dp * 0.02 + 1);
        };
        for (let eff = 0; eff < skillData[2].effect.length; eff++) {
            if (damagingEntity.hasTag(`mobasce_knockback${eff}`)) {
                const view = damagingEntity.getViewDirection();
                const knockbackMulti = skillData[2].effect[eff];
                const newView = { x: view.x * knockbackMulti, y: view.y * knockbackMulti, z: view.z * knockbackMulti };
                system.run(() => {
                    try {
                        hurtEntity.applyImpulse(newView);
                    } catch (e) { };
                });
            };
        };
        for (let eff = 0; eff < skillData[3].effect.length; eff++) {
            if (damagingEntity.hasTag(`mobasce_bleeding${eff}`)) {
                system.run(() => {
                    try {
                        hurtEntity.runCommand(`scriptevent mobasce:bleeding ${skillData[3].effect[eff]} ${skillData[3].damage[eff]}`);
                    } catch (e) { };
                });
                break;
            };
        };
        if (damagingEntity.hasTag(`mobasce_awakening_now`)) {
            for (let eff = 0; eff < skillData[8].effect.length; eff++) {
                if (damagingEntity.hasTag(`mobasce_awakening${eff}`)) {
                    newDamage = newDamage * skillData[8].effect[eff];
                    break;
                };
            };
        };
        for (let eff = 0; eff < skillData[9].effect.length; eff++) {
            if (damagingEntity.hasTag(`mobasce_concept${eff}`)) {
                ev.damage = 0;
                system.run(() => {
                    try {
                        hurtEntity.getComponent(`minecraft:health`).setCurrentValue(Math.max(0, hurtEntity.getComponent(`minecraft:health`).currentValue - skillData[9].effect[eff]))
                    } catch (e) { };
                });
                break;
            };
        };
    };
    if (fireDamage.includes(cause)) {
        let fireResistance;
        for (let i = 0; i <= 3; i++) {
            if (hurtEntity.hasTag(`mobasce_fire_resistance${i}`)) {
                fireResistance = i;
                break;
            };
        };
        if (fireResistance !== undefined) {
            const fireDamage = newDamage * skillData[0].effect[fireResistance];
            ev.calcel = true;
            system.run(() => {
                try {
                    hurtEntity.applyDamage(fireDamage, { damagingEntity: damagingEntity, cause: `fire` });
                    hurtEntity.extinguishFire(false);
                } catch (e) { };
            });
        };
    };
    for (let i = 0; i < skillData[7].effect.length; i++) {
        if (hurtEntity.hasTag(`mobasce_reflection${i}`)) {
            system.run(() => {
                try {
                    damagingEntity.applyDamage(Math.min(skillData[7].effect[i], newDamage * 0.3), { damagingEntity: hurtEntity, cause: `entityExplosion` });
                    damagingEntity.dimension.playSound(`damage.thorns`, damagingEntity.location);
                } catch (e) { };
            });
            break;
        };
    };
    if (ev.damage !== newDamage) {
        ev.damage = Math.max(newDamage - 1, 0.0001);
        system.run(() => {
            try {
                hurtEntity.applyDamage(newDamage, { cause: `entityExplosion` });
            } catch (e) { };
        });
    };
    const health = hurtEntity.getComponent(`minecraft:health`)
    const hurtHpMax = health.effectiveMax;
    const hurtHp = health.currentValue;
    for (let i = 0; i < skillData[6].effect.length; i++) {
        if (hurtEntity.hasTag(`mobasce_revival${i}`)) {
            if (hurtHp - ev.damage <= 0) {
                ev.cancel = true;
                system.run(() => {
                    try {
                        hurtEntity.removeTag(`mobasce_revival${i}`);
                        if (i > 0) {
                            hurtEntity.addTag(`mobasce_revival${i - 1}`);
                        };
                        hurtEntity.getComponent(`minecraft:health`).setCurrentValue(hurtHpMax * 0.5);
                        hurtEntity.applyDamage(1, { damagingEntity: damagingEntity, cause: `entityAttack` });
                        const { x, y, z } = hurtEntity.location;
                        const newLocation = { x: x, y: y + 1, z: z };
                        const dimension = hurtEntity.dimension;
                        dimension.playSound(`random.totem`, newLocation);
                        for (let j = 0; j < 5; j++) {
                            dimension.spawnParticle(`minecraft:totem_particle`, newLocation);
                            dimension.spawnParticle(`minecraft:totem_particle`, newLocation);
                            dimension.spawnParticle(`minecraft:totem_particle`, newLocation);
                        };
                    } catch (e) { };
                });
            };
            break;
        };
    };
    for (let i = 0; i < skillData[8].effect.length; i++) {
        if (hurtEntity.hasTag(`mobasce_awakening${i}`)) {
            if (!hurtEntity.hasTag(`mobasce_awakening_now`) && hurtHp / hurtHpMax <= 0.5) {
                system.run(() => {
                    try {
                        hurtEntity.addTag(`mobasce_awakening_now`);
                        let speed = hurtEntity.getEffect(`minecraft:speed`);
                        if (speed) speed = speed.amplifier + 1; else speed = 0;
                        hurtEntity.addEffect(`minecraft:speed`, 20000000, { amplifier: speed });
                        hurtEntity.dimension.playSound(`ambient.weather.lightning.impact`, hurtEntity.location, { pitch: 0.5 });
                        for (let j = 0; j < 5; j++) {
                            hurtEntity.dimension.spawnParticle(`minecraft:knockback_roar_particle`, hurtEntity.location);
                            hurtEntity.dimension.spawnParticle(`minecraft:knockback_roar_particle`, hurtEntity.location);
                            hurtEntity.dimension.spawnParticle(`minecraft:knockback_roar_particle`, hurtEntity.location);
                        };
                    } catch (e) { };
                });
            };
            break;
        };
    };
});

world.afterEvents.playerSpawn.subscribe(ev => {
    const { player, initialSpawn } = ev;
    if (!initialSpawn) return;
    /** @type { config } */
    const dp = JSON.parse(world.getDynamicProperty(`mobasce:data`) ?? JSON.stringify(config));
    player.removeTag(`mobasce_bleeding_alive`);
    player.sendMessage({ translate: `mobasce.message.info`, with: [String(dp.day), String(dp.level), String(dp.maxLevel)] });
});

world.afterEvents.entityDie.subscribe(ev => {
    const { deadEntity, damageSource } = ev;
    const { cause, damagingEntity } = damageSource;
    if (damagingEntity?.typeId === `minecraft:player`) {
        const dp = deadEntity.getDynamicProperty(`mobasce:data`);
        if (dp === undefined) return;
        for (let i = 0; i < Math.floor(Math.sqrt(dp / 10)); i++) {
            deadEntity.runCommand(`loot spawn ~ ~ ~ kill @s`);
        };
    } else {
        if (deadEntity.typeId === `minecraft:player`) {
            if (deadEntity.hasTag(`mobasce_bleeding_alive`)) {
                deadEntity.removeTag(`mobasce_bleeding_alive`);
            };
        };
    };
});

world.afterEvents.itemUse.subscribe(ev => {
    const { itemStack, source } = ev;
    const itemId = itemStack.typeId;
    if (itemId === `minecraft:stick`) {
        world.setDynamicProperty(`mobasce:data`, JSON.stringify(config));
    } else if (itemId === `minecraft:nether_star`) {
        let dp = JSON.parse(world.getDynamicProperty(`mobasce:data`));
        dp.maxLevel += 100;
        world.setDynamicProperty(`mobasce:data`, JSON.stringify(dp));
        console.error(JSON.stringify(dp));
    };
});

system.afterEvents.scriptEventReceive.subscribe(ev => {
    const { id, message, sourceEntity } = ev;
    if (id.startsWith(`mobasce:`)) {
        const messageSplit = message.split(` `);
        switch (id) {
            case `mobasce:spawn`:
                const entityId = messageSplit[0];
                const level = Number(messageSplit[1]);
                const location = { x: Number(messageSplit[2]), y: Number(messageSplit[3]), z: Number(messageSplit[4]) };
                const dimension = world.getDimension(messageSplit[5]);
                const entity = dimension.spawnEntity(entityId, location);
                entity.setDynamicProperty(`mobasce:data`, Math.min(Math.max(0, level), 10000));
                for (let i = 6; i < messageSplit.length; i++) {
                    entity.addTag(messageSplit[i]);
                };
                break;
            case `mobasce:bleeding`:
                if (sourceEntity.hasTag(`mobasce_bleeding_alive`)) return;
                const seconds = Number(messageSplit[0]);
                let amplifier = 1;
                if (messageSplit[1]) {
                    amplifier = Number(messageSplit[1]);
                };
                try {
                    sourceEntity.addTag(`mobasce_bleeding_alive`);
                    sourceEntity.dimension.spawnParticle(`mobasce:bleeding`, sourceEntity.location);
                } catch (e) { };
                for (let tick = 20; tick <= seconds * 20; tick += 20) {
                    system.runTimeout(() => {
                        try {
                            if (sourceEntity.hasTag(`mobasce_bleeding_alive`)) {
                                sourceEntity.runCommand(`damage @s ${amplifier} override`);
                                if (tick !== seconds * 20) {
                                    sourceEntity.dimension.spawnParticle(`mobasce:bleeding`, sourceEntity.location);
                                } else {
                                    sourceEntity.removeTag(`mobasce_bleeding_alive`);
                                };
                            };
                        } catch (e) { };
                    }, tick);
                };
                break;
        };
    };
});

world.afterEvents.itemCompleteUse.subscribe(ev => {
    const { source } = ev;
    const itemStack = source.getComponent(`minecraft:equippable`).getEquipment(`Mainhand`);
    const itemId = itemStack?.typeId;
    switch (itemId) {
        case `minecraft:crossbow`:
            let lores = itemStack.getLore();
            lores.push(`§r§fCharged§r§f`);
            itemStack.setLore(lores);
            source.getComponent(`minecraft:equippable`).setEquipment(`Mainhand`, itemStack);
    };
});

world.afterEvents.itemReleaseUse.subscribe(ev => {
    const { source, itemStack } = ev;
    const itemId = itemStack.typeId;
    switch (itemId) {
        case `minecraft:bow`:
            const dimension = source.dimension;
            const location = source.location;
            const newLocation = { x: location.x, y: location.y + 1.5, z: location.z };
            const arrows = dimension.getEntities({ type: `minecraft:arrow`, location: newLocation, maxDistance: 8 });
            for (const arrow of arrows) {
                const velocity = arrow.getVelocity();
                const multi = 100;
                const newVelocity = { x: velocity.x * multi, y: velocity.y * multi, z: velocity.z * multi };
                arrow.applyImpulse(newVelocity);
            };
    };
});

world.afterEvents.itemStartUse.subscribe(ev => {
});

world.afterEvents.itemStopUse.subscribe(ev => {
});

world.afterEvents.itemUse.subscribe(ev => {
    const { source } = ev;
    const itemStack = source.getComponent(`minecraft:equippable`).getEquipment(`Mainhand`);
    const itemId = itemStack?.typeId;
    switch (itemId) {
        case `minecraft:crossbow`:
            let lores = itemStack.getLore();
            if (lores.find(f => f === `§r§fCharged§r§f`)) {
                lores = lores.filter(f => f !== `§r§fCharged§r§f`);
                itemStack.setLore(lores);
                source.getComponent(`minecraft:equippable`).setEquipment(`Mainhand`, itemStack);
                const dimension = source.dimension;
                const location = source.location;
                const newLocation = { x: location.x, y: location.y + 1.5, z: location.z };
                const arrows = dimension.getEntities({ type: `minecraft:arrow`, location: newLocation, maxDistance: 8 });
                for (const arrow of arrows) {
                    const velocity = arrow.getVelocity();
                    const multi = 100;
                    const newVelocity = { x: velocity.x * multi, y: velocity.y * multi, z: velocity.z * multi };
                    arrow.applyImpulse(newVelocity);
                };
            };
    };
});