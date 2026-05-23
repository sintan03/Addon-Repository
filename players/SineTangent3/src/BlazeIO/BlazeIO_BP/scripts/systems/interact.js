import * as server from "@minecraft/server";

import { connectData } from "../data/connect.js";

server.world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    if (ev.isFirstEvent === false) return;
    const { player, itemStack, block } = ev;
    const itemId = itemStack?.typeId ?? ``;
    const blockId = block.typeId ?? ``;
    const { x, y, z } = block.location;
    const dimension = block.dimension;
    const entity = dimension.getEntitiesAtBlockLocation(block.bottomCenter())[0];
    if (entity?.typeId?.startsWith(`blazeio:`) ?? false) {
        switch (itemId) {
            case `blazeio:connecter`:
                let lore = itemStack.getLore();
                if (!lore[0]) {
                    lore[0] = connectData.default.lore;
                } else if (player.isSneaking) {
                    const find = connectData.data.find(f => f.lore === lore[0]);
                    lore[0] = connectData.data.length - 1 > find.index ? connectData.data[find.index + 1].lore : connectData.data[0].lore;
                    player.sendMessage(`設定を${lore[0].split(`§c§r§7`)[1]}§r§fに変更しました`);
                } else {
                    const connect = connectData.data.find(f => f.lore === lore[0]);
                    if (connect !== undefined) {
                        if (!lore[1]) {
                            lore[1] = `§r§7Location: X = §l§r§7${x}§l§r§7, Y = §l§r§7${y}§l§r§7, Z = §l§r§7${z}§l§r§7§r§f`;
                            lore[2] = `§r§7Dimension: §d§r§7${dimension.id}§d§r§7§r§f`;
                            lore[3] = `§r§7Block: ${blockId}§r§f`;
                            player.sendMessage(`接続を開始しました`);
                        } else {
                            const lore1split = lore[1].split(`§l§r§7`);
                            const loreDimensionId = lore[2].split(`§d§r§7`)[1];
                            const loreX = Number(lore1split[1]);
                            const loreY = Number(lore1split[3]);
                            const loreZ = Number(lore1split[5]);
                            lore = [lore[0]];
                            if (dimension.id === loreDimensionId) {
                                if (x === loreX && y === loreY && z === loreZ) {
                                    player.sendMessage(`接続を中止しました`);
                                } else {
                                    const sendBlock = dimension.getBlock({ x: loreX, y: loreY, z: loreZ });
                                    if (!sendBlock) { player.sendMessage(`§c送信元の読み込みでエラーが発生しました`); } else {
                                        const sendEntity = dimension.getEntitiesAtBlockLocation(sendBlock.bottomCenter())[0];
                                        let dp = sendEntity.getDynamicProperty(`blazeio:connect`) ?? ``;
                                        if (dp !== ``) {
                                            dp = JSON.parse(dp);
                                            const find = dp.find(f => f.type === lore[0].split(`§c§r§7`)[1].replace(`§g`, ``).replace(`§c`, ``).replace(`§b`, ``) && f.x === x && f.y === y && f.z === z && f.dim === dimension.id);
                                            if (find === undefined) {
                                                dp.push({ type: lore[0].split(`§c§r§7`)[1].replace(`§g`, ``).replace(`§c`, ``).replace(`§b`, ``), x: x, y: y, z: z, dim: dimension.id });
                                                player.sendMessage(`接続に成功しました`);
                                            } else {
                                                dp = dp.filter(f => !(f.type === find.type && f.x === find.x && f.y === find.y && f.z === find.z && f.dim === find.dim));
                                                player.sendMessage(`接続を解除しました`);
                                            };
                                        } else {
                                            dp = [{ type: lore[0].split(`§c§r§7`)[1].replace(`§g`, ``).replace(`§c`, ``).replace(`§b`, ``), x: x, y: y, z: z, dim: dimension.id }];
                                            player.sendMessage(`接続に成功しました`);
                                        };
                                        server.system.run(() => {
                                            sendEntity.setDynamicProperty(`blazeio:connect`, JSON.stringify(dp));
                                        });
                                    };
                                };
                            } else {
                                player.sendMessage(`§c別ディメンションでは使えません`);
                            };
                        };
                    };
                };
                const text = [];
                text.push(...lore);
                server.system.run(() => {
                    itemStack.setLore(text);
                    player.getComponent(`equippable`)?.setEquipment(`Mainhand`, itemStack);
                });
                break;
        };
    };
});