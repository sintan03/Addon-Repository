import * as server from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

server.world.beforeEvents.entityHurt.subscribe(ev => {
  const entity = ev.hurtEntity;
  const attacker = ev.damageSource?.damagingEntity ?? entity;
  const damage = ev.damage;
  const damageType = ev.damageSource.cause;

  if (entity.typeId !== "minecraft:player") return;

  if (damageType === "piston") return;

  const resistance = entity.getDynamicProperty("magistics:resistance") ?? 0;

  if (attacker.id === entity.id && damageType !== "fall") {
    if (resistance >= 95) {
      ev.cancel = true;
    }
    return;
  }

  const equip = entity.getComponent("equippable")
  const offhandItem = equip.getEquipment("Offhand") ?? "";

  if (resistance <= 0 && offhandItem.typeId !== "magistics:magistic_totem_of_undying") return;
  ev.cancel = true;

  if (damage <= 0.01) return;

  const newDamage = Math.floor(damage * (101 - resistance)) * 0.01;
  server.system.run(() => {
    const hp = entity.getComponent("health").currentValue;
    const newhp = hp - newDamage;
    if (newhp <= 0) {
      const durabilityComp = offhandItem.getComponent("minecraft:durability");
      if (offhandItem.typeId === "magistics:magistic_totem_of_undying" && durabilityComp.damage <= 0) {
        // 魔術不死結晶の処理
        entity.getComponent("health").setCurrentValue(10);
        durabilityComp.damage = 60;
        entity.dimension.spawnParticle("minecraft:totem_particle", entity.location);
        entity.playSound("random.totem", { volume: 0.8, pitch: 1.0 });
        entity.addEffect("minecraft:regeneration", 200, {
          amplifier: 1,
          showParticles: true
        });
        entity.addEffect("minecraft:absorption", 200, {
          amplifier: 1,
          showParticles: true
        });
        equip.setEquipment("Offhand", offhandItem);
      } else {
        entity.getComponent("health").setCurrentValue(0.01);
        entity.applyDamage(100, {
          cause: "piston",
          damagingEntity: attacker
        });
      }
    } else {
      entity.getComponent("health").setCurrentValue(newhp);
    }
    entity.applyDamage(0.01, {
      cause: "piston"
    });
    // 防具の耐久値減少処理
    if (!equip) return;

    for (const slot of ["Head", "Chest", "Legs", "Feet"]) {

      const item = equip.getEquipment(slot);
      if (!item) continue;

      const durabilityComp = item.getComponent("minecraft:durability");
      if (!durabilityComp) continue;

      const loss = Math.ceil(damage * 0.9); // 元ダメージ基準

      const newDamageValue = durabilityComp.damage + loss;

      if (newDamageValue >= durabilityComp.maxDurability) {
        equip.setEquipment(slot, undefined);
        entity.playSound("random.break", { volume: 0.5, pitch: 1.0 });
      } else {
        durabilityComp.damage = newDamageValue;
        equip.setEquipment(slot, item);
      }
    }
  });
});

function reduceDurability(player, itemStack, equip, slot, amount = 1) {
  const durability = itemStack.getComponent("minecraft:durability") ?? 0;
  const newDurability = durability.damage + amount;
  durability.damage = newDurability;
  if (newDurability >= durability.maxDurability) {
    //アイテム破壊処理
    equip.setEquipment(slot, undefined);
    player.playSound("random.break", { volume: 0.5, pitch: 1.0 });
  } else {
    equip.setEquipment(slot, itemStack);
  }
}

const magicName = {
  1: "§c§l炎魔法",
  2: "§b§l氷魔法",
  3: "§e§l雷魔法",
  4: "§a§l風魔法",
  5: "§9§l水魔法",
  6: "§7§l斬魔法",
  7: "§d§l光魔法",
  8: "§0§l闇魔法"
}

const magicLore = {
  1: {
    1: "§f§l",
    2: "§7",
    3: "§7",
    4: "§7"
  },
  2: {
    1: "§7",
    2: "§f§l",
    3: "§7",
    4: "§7"
  },
  3: {
    1: "§7",
    2: "§7",
    3: "§f§l",
    4: "§7"
  },
  4: {
    1: "§7",
    2: "§7",
    3: "§7",
    4: "§f§l"
  }
}

server.system.runInterval(() => {
  for (const player of server.world.getPlayers()) {
    const equip = player.getComponent("equippable");
    const head = equip.getEquipment("Head") ?? "";
    const chest = equip.getEquipment("Chest") ?? "";
    const legs = equip.getEquipment("Legs") ?? "";
    const feet = equip.getEquipment("Feet") ?? "";
    const itemOff = equip.getEquipment("Offhand") ?? "";
    if (itemOff.typeId === "magistics:magistic_totem_of_undying") {
      const durabilityComp = itemOff.getComponent("minecraft:durability");
      if (durabilityComp.damage > 0) {
        durabilityComp.damage -= 1;
        if (durabilityComp.damage <= 0) player.sendMessage("§e魔術不死結晶が復活しました");
        equip.setEquipment("Offhand", itemOff);
      }
    }
    let amount = 0;
    let speed = 0;
    switch (head.typeId) {
      case "magistics:basic_magistic_helmet":
        amount += 1;
        speed += 1;
        break;
      case "magistics:advanced_magistic_helmet":
        amount += 2;
        speed += 2;
        break;
      case "magistics:elite_magistic_helmet":
        amount += 4;
        speed += 4;
        break;
      case "magistics:ultimate_magistic_helmet":
        amount += 8;
        speed += 10;
        break;
    }
    switch (chest.typeId) {
      case "magistics:basic_magistic_chestplate":
        amount += 1;
        speed += 1;
        break;
      case "magistics:advanced_magistic_chestplate":
        amount += 2;
        speed += 2;
        break;
      case "magistics:elite_magistic_chestplate":
        amount += 4;
        speed += 4;
        break;
      case "magistics:ultimate_magistic_chestplate":
        amount += 8;
        speed += 10;
        break;
    }
    switch (legs.typeId) {
      case "magistics:basic_magistic_leggings":
        amount += 1;
        speed += 1;
        break;
      case "magistics:advanced_magistic_leggings":
        amount += 2;
        speed += 2;
        break;
      case "magistics:elite_magistic_leggings":
        amount += 4;
        speed += 4;
        break;
      case "magistics:ultimate_magistic_leggings":
        amount += 8;
        speed += 10;
        break;
    }
    switch (feet.typeId) {
      case "magistics:basic_magistic_boots":
        amount += 1;
        speed += 1;
        break;
      case "magistics:advanced_magistic_boots":
        amount += 2;
        speed += 2;
        break;
      case "magistics:elite_magistic_boots":
        amount += 4;
        speed += 4;
        break;
      case "magistics:ultimate_magistic_boots":
        amount += 8;
        speed += 10;
        break;
    }
    if (amount === 0) {
      player.setDynamicProperty("magistics:mp", 0);
      player.setDynamicProperty("magistics:resistance", 0);
      continue;
    }
    let dp = player.getDynamicProperty("magistics:mp") ?? 0;
    dp += speed;
    if (dp > amount * 64) dp = amount * 64;
    player.setDynamicProperty("magistics:mp", dp);
    player.setDynamicProperty("magistics:resistance", (Math.floor(amount / 0.32)));
    const item = equip.getEquipment("Mainhand") ?? "";
    if (item.typeId === "magistics:basic_magistic_wand" ||
      item.typeId === "magistics:advanced_magistic_wand" ||
      item.typeId === "magistics:elite_magistic_wand" ||
      item.typeId === "magistics:ultimate_magistic_wand") {
      player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§bMP: §f${dp} / ${amount * 64}"}]}`);
    }
  }
}, 20)

function magic(entity, tick, speed, damage, damageType, range, mp, particle, sound, stop,
  options = { sounds: { volume: 0.5, pitch: 1 }, setOnFire: [true, 20], effects: [{ effect: undefined, duration: undefined, amplifier: undefined }] }) {

  let dp = entity.getDynamicProperty("magistics:mp") ?? 0;
  if (dp < mp) {
    entity.sendMessage("§cMPが足りません");
    return;
  }
  dp -= mp;
  entity.setDynamicProperty("magistics:mp", dp);

  const viewDir = entity.getViewDirection();
  const startLoc = entity.location;

  entity.playSound(sound, {
    volume: options.sounds?.volume ?? 0.5,
    pitch: options.sounds?.pitch ?? 1,
  });

  let hit = false;

  for (let i = 1; i <= tick; i++) {
    server.system.runTimeout(() => {

      if (hit && stop) return;

      let targetPos = {
        x: startLoc.x + (viewDir.x * i * speed),
        y: startLoc.y + (viewDir.y * i * speed) + 1.5,
        z: startLoc.z + (viewDir.z * i * speed)
      };

      try {
        //targetPosにパーティクルを再生
        entity.dimension.spawnParticle(particle, targetPos);
        targetPos.y -= 1.5;
        //targetPosで攻撃判定を行う
        const hitEntities = entity.dimension.getEntities({
          location: targetPos,
          maxDistance: range
        });
        for (const hitEntity of hitEntities) {
          if (hitEntity.typeId === "minecraft:xp_orb" || hitEntity.typeId === "minecraft:arrow" || hitEntity.typeId === "minecraft:item") continue;
          if (!server.world.gameRules.pvp && hitEntity.typeId === "minecraft:player") continue;
          if (hitEntity.id !== entity.id) {
            //オプションの処理:炎上
            if (options.setOnFire) {
              const [enable, duration] = options.setOnFire;
              if (enable) {
                hitEntity.setOnFire(duration);
              };
            };
            hitEntity.runCommand(`damage @s ${damage} ${damageType} entity ${entity.name}`);
            hit = true;
            //オプションの処理:ステータス効果
            if (options.effects) {
              for (const effect of options.effects) {
                hitEntity.addEffect(effect.effect, effect.duration, {
                  amplifier: effect.amplifier,
                  showParticles: true
                });
              };
            };
            if (stop) break;
          };
        };
      } catch (e) {
      };
    }, i);
  };
};

server.world.afterEvents.itemUse.subscribe(ev => {

  const item = ev.itemStack;
  if (!item) return;

  const itemId = item.typeId;
  if (!itemId) return;

  const player = ev.source;
  if (!player || player.typeId !== "minecraft:player") return;

  if (!itemId.startsWith("magistics:") || !itemId.endsWith("_wand")) return;

  if (player.isSneaking) {
    //選択魔法変更処理
    let lore = item.getLore()[0];
    /*例:
    §1§r§f§l炎魔法 消費MP:10\n§r§7氷魔法 消費MP:10\n§r§7雷魔法 消費MP:10\n§r§7風魔法 消費MP:10
    §2§r§7炎魔法 消費MP:10\n§r§f§l氷魔法 消費MP:10\n§r§7雷魔法 消費MP:10\n§r§7風魔法 消費MP:10
    §3§r§7炎魔法 消費MP:10\n§r§7氷魔法 消費MP:10\n§r§f§l雷魔法 消費MP:10\n§r§7風魔法 消費MP:10
    §4§r§7炎魔法 消費MP:10\n§r§7氷魔法 消費MP:10\n§r§7雷魔法 消費MP:10\n§r§f§l風魔法 消費MP:10
    */
    if (lore) {
      const number = [];
      switch (itemId) {
        case "magistics:basic_magistic_wand":
          number.push(2, 3, 4, 1);
          break;
        case "magistics:advanced_magistic_wand":
          number.push(4, 6, 7, 1);
          break;
        case "magistics:elite_magistic_wand":
          number.push(2, 4, 8, 1);
          break;
        case "magistics:ultimate_magistic_wand":
          number.push(4, 7, 8, 1);
          break;
        default:
          player.sendMessage("不明な魔法杖です。");
          return;
      }
      //loreの二文字目(選択中の魔法)を取得
      let magicType = lore.charAt(1);

      switch (magicType) {
        case "1":
          player.sendMessage(`${magicName[number[0]]}`);
          magicType = "2";
          break;
        case "2":
          player.sendMessage(`${magicName[number[1]]}`);
          magicType = "3";
          break;
        case "3":
          player.sendMessage(`${magicName[number[2]]}`);
          magicType = "4";
          break;
        case "4":
          player.sendMessage(`${magicName[number[3]]}`);
          magicType = "1";
          break;
        default:
          player.sendMessage("不明な魔法タイプです。");
      }

      switch (itemId) {
        case "magistics:basic_magistic_wand":
          lore = `§${magicType}§r${magicLore[magicType][1]}炎魔法 消費MP:8\n§r${magicLore[magicType][2]}氷魔法 消費MP:10\n§r${magicLore[magicType][3]}雷魔法 消費MP:8\n§r${magicLore[magicType][4]}風魔法 消費MP:10`;
          break;
        case "magistics:advanced_magistic_wand":
          lore = `§${magicType}§r${magicLore[magicType][1]}炎魔法 消費MP:16\n§r${magicLore[magicType][2]}風魔法 消費MP:20\n§r${magicLore[magicType][3]}斬魔法 消費MP:20\n§r${magicLore[magicType][4]}光魔法 消費MP:16`;
          break;
        case "magistics:elite_magistic_wand":
          lore = `§${magicType}§r${magicLore[magicType][1]}炎魔法 消費MP:52\n§r${magicLore[magicType][2]}氷魔法 消費MP:56\n§r${magicLore[magicType][3]}風魔法 消費MP:64\n§r${magicLore[magicType][4]}闇魔法 消費MP:68`;
          break;
        case "magistics:ultimate_magistic_wand":
          lore = `§${magicType}§r${magicLore[magicType][1]}炎魔法 消費MP:80\n§r${magicLore[magicType][2]}風魔法 消費MP:100\n§r${magicLore[magicType][3]}光魔法 消費MP:120\n§r${magicLore[magicType][4]}闇魔法 消費MP:140`;
          break;
        default:
          player.sendMessage("不明な魔法杖です。");
      }

      item.setLore([lore]);
      player.getComponent(`equippable`).setEquipment(`Mainhand`, item)

    } else {
      switch (itemId) {
        case "magistics:basic_magistic_wand":
          //基本魔法杖
          lore = "§1§r§f§l炎魔法 消費MP:8\n§r§7氷魔法 消費MP:10\n§r§7雷魔法 消費MP:8\n§r§7風魔法 消費MP:10";
          break;
        case "magistics:advanced_magistic_wand":
          //発展魔法杖
          lore = "§1§r§f§l炎魔法 消費MP:16\n§r§7風魔法 消費MP:20\n§r§7斬魔法 消費MP:20\n§r§7光魔法 消費MP:16";
          break;
        case "magistics:elite_magistic_wand":
          //精鋭魔法杖
          lore = "§1§r§f§l炎魔法 消費MP:52\n§r§7氷魔法 消費MP:56\n§r§7風魔法 消費MP:64\n§r§7闇魔法 消費MP:68";
          break;
        case "magistics:ultimate_magistic_wand":
          //究極魔法杖
          lore = "§1§r§f§l炎魔法 消費MP:80\n§r§7風魔法 消費MP:100\n§r§7光魔法 消費MP:120\n§r§7闇魔法 消費MP:140";
          break;
        default:
          player.sendMessage("不明な魔法杖です。");
          return;
      }
      item.setLore([lore]);
      player.getComponent(`equippable`).setEquipment(`Mainhand`, item)
    }
  } else {
    //通常使用時の処理
    let lore = item.getLore()[0];
    if (!lore) return;

    //loreの二文字目(選択中の魔法)を取得
    let magicType = lore.charAt(1);
    switch (itemId) {
      case "magistics:basic_magistic_wand":
        //基本魔法杖
        switch (magicType) {
          case "1":
            magic(player, 40, 0.5, 1, "fire", 0.9, 8, "minecraft:basic_flame_particle", "fire.ignite", true, { setOnFire: [true, 2] });
            break;
          case "2":
            magic(player, 30, 0.3, 3, "freezing", 1.0, 10, "minecraft:explosion_particle", "hit.powder_snow", true, { sounds: { volume: 1.0, pitch: 1.0 }, setOnFire: [false, 0] });
            break;
          case "3":
            magic(player, 20, 1.1, 2, "lightning", 1.0, 8, "minecraft:electric_spark_particle", "cauldron.explode", false, { sounds: { volume: 0.5, pitch: 0.5 }, setOnFire: [false, 0] });
            break;
          case "4":
            magic(player, 30, 0.15, 1, "sonic_boom", 1.5, 10, "minecraft:large_explosion", "wind_charge.burst", false, { sounds: { volume: 0.5, pitch: 0.8 }, setOnFire: [false, 0] });
            break;
          default:
            player.sendMessage("不明な魔法タイプです。");
        }
        break;
      case "magistics:advanced_magistic_wand":
        //発展魔法杖
        switch (magicType) {
          case "1":
            magic(player, 40, 0.7, 2, "fire", 1.1, 16, "minecraft:blue_flame_particle", "fire.ignite", true, { sounds: { volume: 0.5, pitch: 1.0 }, setOnFire: [true, 4] });
            break;
          case "2":
            magic(player, 40, 0.20, 2, "sonic_boom", 1.8, 20, "minecraft:wind_explosion_emitter", "wind_charge.burst", false, { sounds: { volume: 0.5, pitch: 0.8 }, setOnFire: [false, 0] });
            break;
          case "3":
            magic(player, 50, 1.4, 4, "entity_attack", 1.2, 20, "minecraft:critical_hit_emitter", "wind_charge.burst", false, { sounds: { volume: 0.5, pitch: 1.8 }, setOnFire: [false, 0] });
            break;
          case "4":
            magic(player, 20, 1.0, 5, "projectile", 1.0, 16, "minecraft:weaving_emitter", "beacon.activate", false, { sounds: { volume: 0.7, pitch: 4.0 }, setOnFire: [false, 0] });
            break;
          default:
            player.sendMessage("不明な魔法タイプです。");
        }
        break;
      case "magistics:elite_magistic_wand":
        //精鋭魔法杖
        switch (magicType) {
          case "1":
            magic(player, 40, 0.9, 4, "fire", 1.3, 48, "minecraft:mobflame_single", "mob.blaze.shoot", true, { setOnFire: [true, 6], effects: [{ effect: "weakness", duration: 120, amplifier: 0 }] });
            break;
          case "2":
            magic(player, 50, 0.5, 8, "freezing", 1.5, 52, "minecraft:egg_destroy_emitter", "random.fizz", true, { sounds: { volume: 0.6, pitch: 0.8 }, setOnFire: [false, 0], effects: [{ effect: "slowness", duration: 60, amplifier: 2 }] });
            break;
          case "3":
            magic(player, 50, 0.3, 4, "sonic_boom", 3.0, 64, "minecraft:huge_explosion_emitter", "wind_charge.burst", false, { sounds: { volume: 0.5, pitch: 0.8 }, setOnFire: [false, 0], effects: [{ effect: "slowness", duration: 20, amplifier: 0 }] });
            break;
          case "4":
            magic(player, 30, 0.7, 11, "magic", 1.0, 68, "minecraft:dragon_breath_fire", "mob.enderdragon.growl", true, { sounds: { volume: 0.02, pitch: 1.2 }, setOnFire: [false, 0], effects: [{ effect: "weakness", duration: 100, amplifier: 1 }] });
            break;
          default:
            player.sendMessage("不明な魔法タイプです。");
        }
        break;
      case "magistics:ultimate_magistic_wand":
        //究極魔法杖
        switch (magicType) {
          case "1":
            magic(player, 60, 1.2, 12, "fire", 1.6, 80, "minecraft:trial_spawner_detection", "mob.blaze.shoot", false, { setOnFire: [true, 11], effects: [{ effect: "weakness", duration: 220, amplifier: 1 }] });
            break;
          case "2":
            magic(player, 80, 0.3, 7, "sonic_boom", 4.5, 100, "minecraft:knockback_roar_particle", "wind_charge.burst", false, { sounds: { volume: 0.5, pitch: 0.9 }, setOnFire: [false, 0], effects: [{ effect: "slowness", duration: 20, amplifier: 1 }] });
            break;
          case "3":
            magic(player, 20, 2.0, 11, "projectile", 3.0, 100, "minecraft:crop_growth_area_emitter", "beacon.activate", false, { sounds: { volume: 0.8, pitch: 4.0 }, setOnFire: [false, 0], effects: [{ effect: "slowness", duration: 100, amplifier: 1 }] });
            break;
          case "4":
            magic(player, 60, 0.5, 20, "magic", 1.5, 120, "minecraft:eyeofender_death_explode_particle", "mob.enderdragon.growl", false, { sounds: { volume: 0.03, pitch: 1.2 }, setOnFire: [false, 0], effects: [{ effect: "blindness", duration: 60, amplifier: 0 }, { effect: "weakness", duration: 60, amplifier: 1 }] });
            break;
          default:
            player.sendMessage("不明な魔法タイプです。");
        }
        break;
      default:
        player.sendMessage("不明な魔法杖です。");
    }
    //使用時耐久値減少処理
    if (player.getGameMode() !== server.GameMode.Creative) {
      const equip = player.getComponent("equippable");
      reduceDurability(player, item, equip, "Mainhand", 1);
    }
  }
});
/*
hit.powder_snow
random.fizz
*/
/*
small_flame_particle
small_soul_fire_flame
trial_spawner_detection
trial_spawner_detection_ominous
minecraft:lava_particle
mobflame_single
*/