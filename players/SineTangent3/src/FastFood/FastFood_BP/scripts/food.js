import * as server from "@minecraft/server";

const tick = 20;

server.world.afterEvents.itemCompleteUse.subscribe(ev => {
  const player = ev.source;
  const item = ev.itemStack;

  if (!player || !item) return;

  const itemId = item.typeId;

  if (itemId == `fastfood:fast_poisonous_potato`) {
    const rand = Math.random();
    if (rand < 0.60) {
      player.addEffect("minecraft:poison", tick * 5, {
        amplifier: 0,
        showParticles: true
      });
    };
  } else if (itemId == `fastfood:fast_golden_apple`) {

    player.addEffect("minecraft:regeneration", tick * 5, {
      amplifier: 1,
      showParticles: true
    });

    player.addEffect("minecraft:absorption", tick * 120, {
      amplifier: 0,
      showParticles: true
    });

  } else if (itemId == `fastfood:fast_enchanted_golden_apple`) {

    player.addEffect("minecraft:regeneration", tick * 30, {
      amplifier: 1,
      showParticles: true
    });

    player.addEffect("minecraft:absorption", tick * 120, {
      amplifier: 3,
      showParticles: true
    });

    player.addEffect("minecraft:resistance", tick * 300, {
      amplifier: 0,
      showParticles: true
    });

    player.addEffect("minecraft:fire_resistance", tick * 300, {
      amplifier: 0,
      showParticles: true
    });

  } else if (itemId == `fastfood:fast_chorus_fruit`) {
    const loc = player.location;
    const x = Math.floor(loc.x);
    const y = Math.floor(loc.y);
    const z = Math.floor(loc.z);
    const dim = player.dimension;

    let limit = [-60, 320];
    if (dim.id == `minecraft:nether`) limit = [4, 120];

    let ax;
    let ay;
    let az;
    let flag = false;

    for (let i = 0; i < 16; i++) {
      ax = Math.floor(x + (Math.random() * 17) - 8);
      ay = Math.floor(y + (Math.random() * 17) - 8);
      az = Math.floor(z + (Math.random() * 17) - 8);

      for (let j = ay; j >= limit[0]; j--) {
        if (ay > limit[1]) continue;

        const block = dim.getBlock({ x: ax, y: j, z: az });
        const blockId = block?.typeId;
        if (!block || !blockId) continue;

        if (blockId == `minecraft:air`) continue;

        if (blockId == `minecraft:water` || blockId == `minecraft:lava`) break;

        if (dim.getBlock({ x: ax, y: j + 1, z: az })?.typeId != `minecraft:air` || dim.getBlock({ x: ax, y: j + 2, z: az })?.typeId != `minecraft:air`) break;

        ax += Math.random();
        ay = j + 1;
        az += Math.random();
        flag = true;

        break;
      }

      if (flag) break;

    }

    if (flag) {
      player.teleport({ x: ax, y: ay, z: az });
      player.playSound(`mob.shulker.teleport`, {
        volume: 1.0,
        pitch: 1.0
      });
    };
  };
});