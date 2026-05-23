import * as server from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

const id = [
  `bytecpu:8_byte_register`,
  `bytecpu:16_byte_register`,
  `bytecpu:32_byte_register`,
  `bytecpu:64_byte_register`,
]

const line = {
  "bytecpu:8_byte_register": 8,
  "bytecpu:16_byte_register": 16,
  "bytecpu:32_byte_register": 32,
  "bytecpu:64_byte_register": 64,
}

const lim = 512;

function decord(cord, min, max) {
  const mm = max - min;
  let out = 0;
  for (let i = min; i <= max; i++) {
    if (cord[i] == 1) {
      out += 2 ** (mm - (i - min))
    }
  }
  return out;
}

function end(di, lc) {
  server.world.setDynamicProperty("bytecpu:program", ``)
  server.world.setDynamicProperty("bytecpu:progress", ``)
  const dim = server.world.getDimension(di);
  dim.getBlock(lc)?.setType(`bytecpu:8bitcpu_off`);
}

function bynary(num) {
  let n = 1;
  let i = 0;
  let txt = ``;
  for (; n < num;) {
    n *= 2;
    i++;
  }
  for (; i >= 0;) {
    
  }
}

let form;

server.system.beforeEvents.startup.subscribe(initEvent => {
  initEvent.blockComponentRegistry.registerCustomComponent("bytecpu:start", {
    onPlayerInteract(ev) {
      const player = ev.player;
      const item = player.getComponent("equippable").getEquipment("Mainhand");
      if (!item) return;
      const itemId = item.typeId;
      if (id.includes(itemId)) {
        let lore = ``;
        lore = item.getLore()[0]
        if (!lore) {
          lore = `§r§711111111`
        }
        lore = lore.replace(/§r/g, "").replace(/§7/g, "").replace(/\n/g, "");
        let list = [];
        const lined = line[itemId]
        for (let i = 0; i < lined * 8; i += 8) {
          if (lore.slice(i, i + 8).length == 8) {
            list.push(lore.slice(i, i + 8));
          } else {
            list.push(`11111111`)
          }
        }
        form = new ui.ModalFormData();
        form?.title(`プログラム`);
        form?.toggle('送信後実行する');
        for (let i = 0; i < lined; i++) {
          form?.textField(`${i}`, `${list[i]}`);
        }
        form?.show(player).then(re => {
          if (re.canceled) return;
          let text = ``
          let program = ``
          for (let i = 0; i < lined; i++) {
            if (String(re.formValues[i + 1]).length == 8) {
              text += String(re.formValues[i + 1])
              program += String(re.formValues[i + 1])
            } else {
              text += list[i]
              program += list[i]
            }
            if (i % 8 == 7 && i + 1 != lined) {
              text += `\n`
            }
          }
          item.setLore([`${"§r§7" + text}`])
          player.getComponent(`equippable`).setEquipment(`Mainhand`, item)
          const block = ev.block;
          const loc = block.location;
          const dimId = block.dimension.id;
          server.world.setDynamicProperty("bytecpu:program", ``)
          const dp = server.world.getDynamicProperty("bytecpu:program")
          if (re.formValues[0] == true) {
            if (dp) {
              player.sendMessage(`他の場所で実行中です`)
            } else {
              const dim = server.world.getDimension(dimId);
              dim.getBlock(loc)?.setType(`bytecpu:8bitcpu`);
              server.world.setDynamicProperty("bytecpu:program", `${loc.x},${loc.y},${loc.z},${dimId},${program}`)
              server.world.setDynamicProperty("bytecpu:progress", `0,0,0,0,0,0,0,0`)
            }
          }
        });
      }
    }
  });
  initEvent.blockComponentRegistry.registerCustomComponent("bytecpu:tick", {
    onTick(ev) {
      const block = ev.block;
      if (!block) return;
      const loc = block.location;
      const x = loc.x
      const y = loc.y
      const z = loc.z
      const dimId = block.dimension.id;
      const dpm = server.world.getDynamicProperty("bytecpu:program");
      let listm = dpm.split(`,`);
      if (x == Number(listm[0]) && y == Number(listm[1]) && z == Number(listm[2]) && dimId == listm[3]) {
        const dps = server.world.getDynamicProperty("bytecpu:progress");
        let lists = dps.split(`,`);
        for (let i = 0; i < lists.length; i++) {
          lists[i] = Number(lists[i]);
        }
        if (lists[7] >= lim) {
          server.world.sendMessage(`実行数の上限に達したため停止しました(${lim})`)
          end(dimId, loc);
          return;
        }
        lists[7] += 1;
        const lmleng = listm[4].length;
        const list = [];
        for (let i = 0; i < lmleng; i += 8) {
          if (listm[4].slice(i, i + 8).length == 8) {
            list.push(listm[4].slice(i, i + 8));
          } else {
            list.push(`11111111`)
          }
        }


        if (lists[6] >= list.length) {
          end(dimId, loc);
          server.world.sendMessage(`終端に到達しました`)
          return;
        }

        const run = list[lists[6]]
        const head = decord(run, 0, 1);
        const inR = decord(run, 2, 4);
        const outR = decord(run, 5, 7);
        if (head == 0) {
          lists[0] = decord(run, 2, 7);
        } else if (head == 1) {
          if (outR == 4) {
            lists[3] = lists[1] + lists[2];
          } else if (outR == 5) {
            lists[3] = lists[1] - lists[2];
          }
        } else if (head == 2) {
          if (outR >= 6) {
            server.world.sendMessage(`Reg${inR}: ${lists[inR]}`);
          } else {
            lists[outR] = lists[inR];
          }
        } else {
          if (inR <= 5) {
            if (lists[inR] > 0) {
              if (outR == 7) {
                lists[6] = lists[0] - 1
              }
            } else {
              if (outR == 3) {
                lists[6] = lists[0] - 1
              }
            }
            if (lists[inR] < 0) {
              if (outR == 2) {
                lists[6] = lists[0] - 1
              }
            } else {
              if (outR == 6) {
                lists[6] = lists[0] - 1
              }
            }
            if (lists[inR] == 0) {
              if (outR == 1) {
                lists[6] = lists[0] - 1
              }
            } else {
              if (outR == 5) {
                lists[6] = lists[0] - 1
              }
            }
            if (outR == 4) {
              lists[6] = lists[0] - 1
            }
          }
        }
        if (decord(run, 0, 7) == 255) {
          end(dimId, loc);
          server.world.sendMessage(`正常に終了しました`)
          return;
        }

        lists[6] += 1;
        server.world.setDynamicProperty("bytecpu:progress", `${lists[0]},${lists[1]},${lists[2]},${lists[3]},${lists[4]},${lists[5]},${lists[6]},${lists[7]}`)
      }
    }
  });
});