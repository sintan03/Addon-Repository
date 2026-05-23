import { world, system, ItemStack, ItemComponent, ItemComponentTypes, Player } from "@minecraft/server";

const parryData = {
    parry: 4,
    muteki: 10,
    success: 18,
    fail: 38
};

const changeData = {
    evo: {
        "parry:parry_long_sword": "parry:parry_long_sword_white",
        "parry:parry_long_sword_white": "parry:parry_long_sword_yellow",
        "parry:parry_long_sword_yellow": "parry:parry_long_sword_red",
    },
    deg: {
        "parry:parry_long_sword_white": "parry:parry_long_sword",
        "parry:parry_long_sword_yellow": "parry:parry_long_sword_white",
        "parry:parry_long_sword_red": "parry:parry_long_sword_yellow",
    }
};

let interval = [];

const longSwords = {
    inc: [`parry:parry_long_sword`, `parry:parry_long_sword_white`, `parry:parry_long_sword_yellow`, `parry:parry_long_sword_red`],
    textcolor: {
        "parry:parry_long_sword": `§8`,
        "parry:parry_long_sword_white": `§f`,
        "parry:parry_long_sword_yellow": `§e`,
        "parry:parry_long_sword_red": `§4`,
    },
    index: {
        "parry:parry_long_sword": `0`,
        "parry:parry_long_sword_white": `1`,
        "parry:parry_long_sword_yellow": `2`,
        "parry:parry_long_sword_red": `3`,
    }
};

world.afterEvents.playerButtonInput.subscribe(ev => {
    const { player, button, newButtonState } = ev;
    if (!player) return;
    if (!newButtonState || newButtonState !== `Pressed`) return;
    if (!button || button !== `Sneak`) return;
    if (player.hasTag(`parry:parry_cooltime`)) return;
    const offhand = player.getComponent(`minecraft:equippable`).getEquipment(`Offhand`);
    const offhandId = offhand?.typeId ?? ``;
    const item = player.getComponent(`minecraft:equippable`).getEquipment(`Mainhand`);
    const itemId = item?.typeId ?? ``;
    const dimension = player.dimension;
    if (offhandId === `parry:parry_shield`) {
        let bonus = 0;
        if (itemId === `parry:parry_lance`) {
            bonus = 1;
        };
        let loc = player.location;
        player.addTag(`parry:parry_cooltime`);
        dimension.playSound(`item.shield.block`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
            pitch: 1.0,
            volume: 1.0
        });
        dimension.spawnParticle(`minecraft:large_explosion`, { x: loc.x, y: loc.y + 1, z: loc.z });
        system.runTimeout(() => {
            if (player.hasTag(`parry:parry_success`)) {
                player.addTag(`parry:parry_muteki`);
                system.runTimeout(() => {
                    player.removeTag(`parry:parry_muteki`);
                }, parryData.muteki - 1 + bonus);
                system.runTimeout(() => {
                    if (player.hasTag(`parry:parry_attacked`)) player.removeTag(`parry:parry_attacked`);
                    player.removeTag(`parry:parry_cooltime`);
                    player.removeTag(`parry:parry_success`);
                    player.removeTag(`parry:parry_end`);
                    dimension.playSound(`random.orb`, player.location, {
                        pitch: 1.0,
                        volume: 1.0
                    });
                }, parryData.success - parryData.parry - 1 - bonus);
            } else {
                player.addTag(`parry:parry_end`);
                system.run(() => {
                    if (player.hasTag(`parry:parry_success`)) {
                        player.addTag(`parry:parry_muteki`);
                        system.runTimeout(() => {
                            player.removeTag(`parry:parry_muteki`);
                        }, parryData.muteki - 1 + bonus);
                        system.runTimeout(() => {
                            if (player.hasTag(`parry:parry_attacked`)) player.removeTag(`parry:parry_attacked`);
                            player.removeTag(`parry:parry_cooltime`);
                            player.removeTag(`parry:parry_success`);
                            player.removeTag(`parry:parry_end`);
                            dimension.playSound(`random.orb`, player.location, {
                                pitch: 1.0,
                                volume: 1.0
                            });
                        }, parryData.success - parryData.parry - 2 - bonus);
                    } else {
                        system.runTimeout(() => {
                            player.removeTag(`parry:parry_cooltime`);
                            player.removeTag(`parry:parry_end`);
                            dimension.playSound(`random.orb`, player.location, {
                                pitch: 1.0,
                                volume: 1.0
                            });
                        }, parryData.fail - parryData.parry - 2 - bonus);
                    };
                });
            }
        }, parryData.parry - 1 + bonus);
    } else if (longSwords.inc.includes(itemId)) {
        let bonus = 4;
        let loc = player.location;
        player.addTag(`parry:parry_cooltime`);
        dimension.playSound(`wind_charge.burst`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
            pitch: 0.5,
            volume: 1.0
        });
        dimension.spawnParticle(`minecraft:large_explosion`, { x: loc.x, y: loc.y + 1, z: loc.z });
        system.runTimeout(() => {
            if (player.hasTag(`parry:parry_success`)) {
                player.addTag(`parry:parry_muteki`);
                system.runTimeout(() => {
                    player.removeTag(`parry:parry_muteki`);
                }, parryData.muteki - 1 + bonus);
                system.runTimeout(() => {
                    if (player.hasTag(`parry:parry_attacked`)) player.removeTag(`parry:parry_attacked`);
                    player.removeTag(`parry:parry_cooltime`);
                    player.removeTag(`parry:parry_success`);
                    player.removeTag(`parry:parry_end`);
                    dimension.playSound(`random.orb`, player.location, {
                        pitch: 1.0,
                        volume: 1.0
                    });
                }, parryData.success - parryData.parry - 1 - bonus);
            } else {
                player.addTag(`parry:parry_end`);
                system.run(() => {
                    if (player.hasTag(`parry:parry_success`)) {
                        player.addTag(`parry:parry_muteki`);
                        system.runTimeout(() => {
                            player.removeTag(`parry:parry_muteki`);
                        }, parryData.muteki - 1 + bonus);
                        system.runTimeout(() => {
                            if (player.hasTag(`parry:parry_attacked`)) player.removeTag(`parry:parry_attacked`);
                            player.removeTag(`parry:parry_cooltime`);
                            player.removeTag(`parry:parry_success`);
                            player.removeTag(`parry:parry_end`);
                            dimension.playSound(`random.orb`, player.location, {
                                pitch: 1.0,
                                volume: 1.0
                            });
                        }, parryData.success - parryData.parry - 2 - bonus);
                    } else {
                        system.runTimeout(() => {
                            player.removeTag(`parry:parry_cooltime`);
                            player.removeTag(`parry:parry_end`);
                            dimension.playSound(`random.orb`, player.location, {
                                pitch: 1.0,
                                volume: 1.0
                            });
                        }, parryData.fail - parryData.parry - 2 - bonus);
                    };
                });
            }
        }, parryData.parry - 1 + bonus);
    };
});

world.beforeEvents.entityHurt.subscribe(ev => {
    const { damage, hurtEntity, damageSource } = ev;
    const { damagingEntity } = damageSource;
    const { dimension } = hurtEntity;
    if (!hurtEntity) return;
    if (!damagingEntity) return;
    let bonus = [{ damage: 1.5, resistance: 10, knock: false }];
    if (damagingEntity.typeId === `minecraft:player`) {
        const item = damagingEntity.getComponent(`minecraft:equippable`).getEquipment(`Mainhand`);
        const itemId = item?.typeId ?? ``;
        if (itemId === `parry:parry_lance`) {
            bonus = [{ damage: 1.5, resistance: 15, knock: true }];
        } else if (longSwords.inc.includes(itemId)) {
            switch (itemId) {
                case `parry:parry_long_sword`:
                    bonus = [{ damage: 1.2, resistance: 15, knock: true, aura: 1.0 }];
                    break;
                case `parry:parry_long_sword_white`:
                    bonus = [{ damage: 1.2, resistance: 15, knock: true, aura: 1.1 }];
                    break;
                case `parry:parry_long_sword_yellow`:
                    bonus = [{ damage: 1.2, resistance: 15, knock: true, aura: 1.3 }];
                    break;
                case `parry:parry_long_sword_red`:
                    bonus = [{ damage: 1.2, resistance: 15, knock: true, aura: 1.5 }];
                    break;
            };
        };
    };
    if (hurtEntity.typeId === `minecraft:player`) {
        const item = hurtEntity.getComponent(`minecraft:equippable`).getEquipment(`Mainhand`);
        const itemId = item?.typeId ?? ``;
        if (itemId === `parry:parry_lance`) {
            bonus.push({ damage: 2.0, resistance: 15, knock: true });
        } else if (longSwords.inc.includes(itemId)) {
            switch (itemId) {
                case `parry:parry_long_sword`:
                    bonus.push({ damage: 1.2, resistance: 15, knock: true, aura: 1.0 });
                    break;
                case `parry:parry_long_sword_white`:
                    bonus.push({ damage: 1.2, resistance: 15, knock: true, aura: 1.1 });
                    break;
                case `parry:parry_long_sword_yellow`:
                    bonus.push({ damage: 1.2, resistance: 15, knock: true, aura: 1.3 });
                    break;
                case `parry:parry_long_sword_red`:
                    bonus.push({ damage: 1.2, resistance: 15, knock: true, aura: 1.5 });
                    break;
            };
        } else {
            bonus.push({ damage: 1.5, resistance: 10, knock: false });
        };
    };
    if (hurtEntity.hasTag(`parry:parry_cooltime`) && (!hurtEntity.hasTag(`parry:parry_end`) || hurtEntity.hasTag(`parry:parry_muteki`))) {
        if (!damagingEntity) return;
        system.run(() => {
            if (!hurtEntity.hasTag(`parry:parry_success`)) hurtEntity.addTag(`parry:parry_success`);
            if (!hurtEntity.hasTag(`parry:parry_end`)) hurtEntity.addTag(`parry:parry_end`);
        });
        if (damage <= bonus[1].resistance) {
            ev.cancel = true;
            system.run(() => {
                const loc = hurtEntity.location;
                if (bonus[1]?.aura) {
                    dimension.playSound(`mace.smash_air`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                        pitch: 0.7,
                        volume: 1.0
                    });
                    dimension.spawnParticle(`minecraft:magic_critical_hit_emitter`, { x: loc.x, y: loc.y + 1, z: loc.z });
                } else {
                    dimension.playSound(`wind_charge.burst`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                        pitch: 1.0,
                        volume: 1.0
                    });
                    dimension.spawnParticle(`minecraft:magic_critical_hit_emitter`, { x: loc.x, y: loc.y + 1, z: loc.z });
                };
            });
        } else {
            ev.damage = (damage - bonus[1].resistance) * 0.2;
            system.run(() => {
                const loc = hurtEntity.location;
                if (bonus[1]?.aura) {
                    dimension.playSound(`random.totem`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                        pitch: 1.8,
                        volume: 1.0
                    });
                    dimension.spawnParticle(`minecraft:knockback_roar_particle`, { x: loc.x, y: loc.y + 1, z: loc.z });
                } else {
                    dimension.playSound(`random.break`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                        pitch: 1.0,
                        volume: 1.0
                    });
                    dimension.spawnParticle(`minecraft:knockback_roar_particle`, { x: loc.x, y: loc.y + 1, z: loc.z });
                };
                if (bonus[1].knock) {
                    hurtEntity.clearVelocity();
                    const view = hurtEntity.getViewDirection();
                    hurtEntity.applyImpulse({
                        x: view.x * -0.5,
                        y: 0,
                        z: view.z * -0.5
                    });
                };
            });
        };
    } else if (damagingEntity.hasTag(`parry:parry_success`) && !damagingEntity.hasTag(`parry:parry_attacked`)) {
        if (bonus[0]?.aura) {
            console.error(`${damage * bonus[0].damage * bonus[0].aura}`);
            ev.damage = damage * bonus[0].damage * bonus[0].aura;
            system.run(() => {
                const loc = damagingEntity.location;
                if (bonus[0]?.aura) {
                    damagingEntity.dimension.playSound(`mace.smash_air`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                        pitch: 0.7,
                        volume: 1.0
                    });
                    dimension.spawnParticle(`minecraft:critical_hit_emitter`, { x: loc.x, y: loc.y + 1, z: loc.z });
                    dimension.spawnParticle(`minecraft:critical_hit_emitter`, { x: loc.x, y: loc.y + 1, z: loc.z });
                    dimension.spawnParticle(`minecraft:critical_hit_emitter`, { x: loc.x, y: loc.y + 1, z: loc.z });
                } else {
                    damagingEntity.dimension.playSound(`mace.heavy_smash_ground`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                        pitch: 1.0,
                        volume: 1.0
                    });
                    dimension.spawnParticle(`minecraft:sonic_explosion`, { x: loc.x, y: loc.y + 1, z: loc.z });
                };
                damagingEntity.addTag(`parry:parry_attacked`);
            });
        } else {
            ev.damage = damage * bonus[0].damage;
            system.run(() => {
                const loc = damagingEntity.location;
                damagingEntity.dimension.playSound(`mace.heavy_smash_ground`, { x: loc.x, y: loc.y + 1, z: loc.z }, {
                    pitch: 1.0,
                    volume: 1.0
                });
                dimension.spawnParticle(`minecraft:sonic_explosion`, { x: loc.x, y: loc.y + 1, z: loc.z });
                damagingEntity.addTag(`parry:parry_attacked`);
            });
        };
    } else if (bonus[0]?.aura) {
        console.error(`${damage * bonus[0].aura}`);
        ev.damage = damage * bonus[0].aura;
    };
});

world.beforeEvents.itemUse.subscribe(ev => {
    const { itemStack, source } = ev;
    const inv = source.getComponent(`minecraft:inventory`).container;
    const index = source.selectedSlotIndex;
    const indexItem = inv.getItem(index);
    if (itemStack !== indexItem) return;
});

/**
 * @param { Player } player 
 * @param { ItemStack } itemStack 
 * @param { { inc: [`parry:parry_long_sword`, `parry:parry_long_sword_white`, `parry:parry_long_sword_yellow`, `parry:parry_long_sword_red`], textcolor: {"parry:parry_long_sword": `§7`,"parry:parry_long_sword_white": `§f`,"parry:parry_long_sword_yellow": `§e`,"parry:parry_long_sword_red": `§4`,} } } longSwords
 * @param { Number } color 
 * @param { Number } energy 
 */
function longSwordRun(player, itemStack, longSwords, color, energy) {
    const lore = [];
    let text = `§r§f§l`;
    /** @type { String } */
    const textcolor = longSwords.textcolor[itemStack.typeId];
    for (let i = 0; i < 100; i += 22) {
        if (i === 88) {
            if (color > 88) {
                text += `${textcolor}-`;
            } else {
                text += `§0-`;
            };
        } else if (i === 0) {
            if (color > 0) {
                text += `${textcolor}-`;
            } else {
                text += `§0-`;
            };
        } else {
            if (i < color) {
                text += `${textcolor}-`;
            } else {
                text += `§0-`;
            };
        };
    };
    for (let i = 0; i < 100; i += 11) {
        if (i === 99) {
            if (energy === 100) {
                text += `${textcolor}|`;
            } else {
                text += `§0|`;
            };
        } else if (i === 0) {
            if (energy > 0) {
                text += `${textcolor}|`;
            } else {
                text += `§0|`;
            };
        } else {
            if (i < energy) {
                text += `${textcolor}|`;
            } else {
                text += `§0|`;
            };
        };
    };
    lore.push(`§r§f色: ${textcolor}${energy}`);
    lore.push(`§r§f練気: ${textcolor}${energy}`);
    itemStack.setLore(lore);
    player.getComponent(`minecraft:equippable`).setEquipment(`Mainhand`, itemStack);
    return text;
};

world.afterEvents.playerHotbarSelectedSlotChange.subscribe(ev => {
    const { player, itemStack, newSlotSelected } = ev;
    const itemId = itemStack?.typeId ?? ``;
    if (player.hasTag(`parry:parry_long_sword_having`)) {
        if (!longSwords.inc.includes(itemId)) {
            player.removeTag(`parry:parry_long_sword_having`);
            const clearun = interval.find(f => f.id === player.id);
            try {
                system.clearRun(clearun.run);
            } catch (e) { };
            interval = interval.filter(f => f !== clearun);
        };
    } else {
        if (longSwords.inc.includes(itemId)) {
            player.addTag(`parry:parry_long_sword_having`);
            interval.push({
                run: system.runInterval(() => {
                    const nowPlayer = world.getAllPlayers().find(f => f.id === player.id);
                    if (nowPlayer) {
                        const nowItem = nowPlayer.getComponent(`minecraft:equippable`).getEquipment(`Mainhand`);
                        const nowItemId = nowItem?.typeId ?? ``;
                        if (longSwords.inc.includes(nowItemId)) {
                            nowPlayer.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"${longSwordRun(nowPlayer, nowItem, longSwords, 100, 100)}"}]}`);
                        };
                    };
                }, 10), id: player.id
            });
        };
    };
});