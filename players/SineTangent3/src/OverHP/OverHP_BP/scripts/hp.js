import * as server from "@minecraft/server";

// 頻繁に使うので (Server.ScoreBoard)
let SSB;

const tick = 20;

/**
 * 体力増加アイテム処理
 * @param {server.Player} player 使用したプレイヤー
 * @param {String} itemId 使用したアイテムID
 * @param {Number} overHpAdd アイテム使用回数
 * @param {String} targetId 体力増加アイテムID
 * @param {Number} min 最低使用回数
 * @param {Number} max 最高使用回数
 */
function hpAdd(player, itemId, overHpAdd, targetId, min, max) {
  if (itemId === targetId) {
    if (min <= overHpAdd && overHpAdd < max) {
      server.world.scoreboard.getObjective(`over_hp_add`).addScore(player, 1);
      if (player.getGameMode() !== server.GameMode.Creative) {
        player.runCommand(`clear @s ${targetId} 0 1`);
      };

      // 通知
      player.sendMessage({ translate: `message.overhp.use` });
      player.playSound(`random.levelup`, {
        pitch: 1.0,
        volume: 1
      });
    } else {
      // エラー通知
      player.sendMessage({ translate: `message.overhp.overuse` });
      player.playSound(`random.bow`, {
        pitch: 0.5,
        volume: 1
      });
    };
  };
};

/* スコアボード宣言
over_hp 付与する体力増強の効果
over_hp_add このアドオンで上乗せされる効果
*/
server.system.run(() => {
  SSB = server.world.scoreboard;
  if (!SSB.getObjective(`over_hp`)) {
    SSB.addObjective(`over_hp`, `over_hp`);
  }
  if (!SSB.getObjective(`over_hp_add`)) {
    SSB.addObjective(`over_hp_add`, `over_hp_add`);
  };
});

// スコアボード初期値設定 & 初期配布
server.world.afterEvents.playerSpawn.subscribe(ev => {
  server.system.runTimeout(() => {
    const player = ev.player;

    // scoreboardの中身が未定義ならとりあえず何か定義してあげてる
    if (SSB.getObjective(`over_hp`).getScore(player) === undefined) SSB.getObjective(`over_hp`).setScore(player, -1);
    if (SSB.getObjective(`over_hp_add`).getScore(player) === undefined) SSB.getObjective(`over_hp_add`).setScore(player, 0);

    if (!player.hasTag(`over_hp_has`)) {
      player.runCommand(`give @s overhp:over_hp_reloader 1`);
      player.addTag(`over_hp_has`);
    };
  }, 2);
});

// アイテム使用
server.world.afterEvents.itemUse.subscribe(ev => {
  // 使用したplayer
  const player = ev.source;
  if (!player || player.typeId !== `minecraft:player`) return;

  // 使用したアイテムID
  const itemId = ev.itemStack?.typeId ?? ``;

  if (itemId === `overhp:over_hp_reloader`) {
    if (!player.isSneaking) {
      // 非しゃがみ
      // HP再計算 --------
      if (!player.hasTag(`oh_checking`)) {
        let health = player.getEffect(`health_boost`)?.amplifier ?? -1;
        // プレイヤーに通知
        player.sendMessage({ translate: `message.overhp.reloading` });
        player.playSound(`random.orb`, {
          pitch: 0.5,
          volume: 0.5
        });

        player.removeEffect(`health_boost`);
        player.addTag(`oh_checking`);
        server.system.runTimeout(() => {
          health = player.getEffect(`health_boost`)?.amplifier ?? -1;
          health += SSB.getObjective(`over_hp_add`).getScore(player);
          SSB.getObjective(`over_hp`).setScore(player, health);
          player.removeTag(`oh_checking`);

          if (health >= 0) {
            player.addEffect(`health_boost`, tick * 60, {
              amplifier: Math.min(health, 255),
              showParticles: false
            });
          };

          // 通知
          player.sendMessage({ translate: `message.overhp.reloadend` });
          player.playSound(`random.levelup`, {
            pitch: 1.0,
            volume: 1
          });
        }, 100);
      } else {
        player.sendMessage({ translate: `message.overhp.checking` });
        player.playSound(`random.bow`, {
          pitch: 0.5,
          volume: 1
        });
      };
      // --------
    } else {
      // しゃがみ
      player.sendMessage({
        rawtext: [
          { translate: `message.overhp.count` },
          { text: `: ${SSB.getObjective(`over_hp_add`).getScore(player)}` }
        ]
      });
      player.playSound(`random.orb`, {
        pitch: 0.5,
        volume: 0.5
      });
    };
  } else {
    // 体力増加アイテム使用
    const overHpAdd = SSB.getObjective(`over_hp_add`).getScore(player);
    hpAdd(player, itemId, overHpAdd, `overhp:over_hp_tier1`, 0, 5);
    hpAdd(player, itemId, overHpAdd, `overhp:over_hp_tier2`, 5, 10);
    hpAdd(player, itemId, overHpAdd, `overhp:over_hp_tier3`, 10, 15);
  };
});

// 体力増強付与(再計算中は付与しない)
server.system.runInterval(() => {
  for (const player of server.world.getAllPlayers()) {
    if (SSB.getObjective(`over_hp`).getScore(player) >= 0) {
      if (!player.hasTag(`oh_checking`)) {
        player.addEffect(`health_boost`, tick * 60, {
          amplifier: Math.min(SSB.getObjective(`over_hp`).getScore(player), 255),
          showParticles: false
        });
      };
    };
  };
}, 60);