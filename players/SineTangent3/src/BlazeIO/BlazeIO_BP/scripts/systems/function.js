import * as server from "@minecraft/server";

/**
 * 表示用アイテムの矢印を配置する関数
 * @param { server.Container } container インベントリコンテナコンポーネント
 * @param { Number } index スロット番号
 * @param { Number } rate 進行状況
 */
export function setArrow(container, index, rate) {
    container.setItem(index, new server.ItemStack(`blazeio:rarr_${Math.min(Math.floor(Math.max(0, rate * 23)), 22)}`))
};

/**
 * 表示用アイテムの背景を配置する関数
 * @param { server.Container } container インベントリコンテナコンポーネント
 * @param { Number } index スロット番号
 * @param { Number } rate 進行状況
 * @param { Number } preset ずらす数
 * @param { String } bgid 背景背景ID(?)
 */
export function setBg(container, index, rate, preset, bgid = `blazeio:bg_color`) {
    container.setItem(index, new server.ItemStack(`${bgid}_${Math.min(Math.floor(Math.max(0, rate - preset) * 33), 32)}`));
};

/**
 * 表示用アイテムの炎を配置する関数
 * @param { server.Container } container インベントリコンテナコンポーネント
 * @param { Number } index スロット番号
 * @param { Number } rate 進行状況
 */
export function setFlame(container, index, rate) {
    container.setItem(index, new server.ItemStack(`blazeio:flame_${Math.min(Math.floor(Math.max(0, rate * 10)), 9)}`))
};

/**
 * 表示用アイテムの背景を配置する関数
 * @param { server.Container } container インベントリコンテナコンポーネント
 * @param { Number } index スロット番号
 * @param { Number } rate 進行状況
 * @param { Number } amount 表示の数
 * @param { String } item 背景のアイテム
 * @param { String } bgid 背景背景ID(?)
 */
export function setBar(container, index, rate, amount, item, bgid = `blazeio:bg_color`) {
    container.setItem(index, item);
    for (let i = 1; i <= amount; i++) {
        setBg(container, i + index, rate, i - 1, bgid);
    };
};



export function connecting(entity, dimension, machineData, block, energy, speed, capacity, inv) {
    let dp = entity.getDynamicProperty(`blazeio:connect`) ?? ``;
    if (dp !== ``) {
        dp = JSON.parse(dp);
        for (const connect of dp) {
            const serveBlock = dimension.getBlock({ x: connect.x, y: connect.y, z: connect.z });
            if (!serveBlock) continue;
            const serveEntity = dimension.getEntitiesAtBlockLocation(serveBlock.bottomCenter())[0];
            if (serveEntity) {
                const serveInv = serveEntity.getComponent(`minecraft:inventory`)?.container;
                if (!serveInv) continue;
                const { sendData, serveData } = machineData[block.typeId];
                /** @type { Number[] | undefined } */
                const sendItemIndex = sendData.item;
                /** @type { Number[] | undefined } */
                const sendLiquidIndex = sendData.liquid;
                /** @type { Number[] | undefined } */
                const serveItemIndex = serveData.item;
                /** @type { Number[] | undefined } */
                const serveLiquidIndex = serveData.liquid;
                if (connect.type === `Energy`) {
                    const serveEnergy = serveEntity.getProperty(`blazeio:energy`);
                    if (energy > 0 && serveEnergy < capacity) {
                        const transfer = Math.min(speed, energy, capacity - serveEnergy);
                        energy -= transfer;
                        serveEntity.setProperty(`blazeio:energy`, serveEnergy + transfer);
                    };
                } else if (connect.type === `Item`) {
                    if (sendItemIndex[0] !== undefined && serveItemIndex[0] !== undefined) {
                        for (let i = 0; i < sendItemIndex.length; i++) {
                            let sendItem = inv.getItem(sendItemIndex[i]);
                            let remainSpeed = speed;
                            let flag = false;
                            if (sendItem === undefined) {
                                continue;
                            } else {
                                let sendItemAmount = sendItem.amount;
                                for (let j = 0; j < serveItemIndex.length; j++) {
                                    let serveItem = serveInv.getItem(serveItemIndex[j]);
                                    if (serveItem === undefined) {
                                        const transfer = Math.min(remainSpeed, sendItemAmount);
                                        serveItem = sendItem;
                                        if (sendItemAmount - transfer <= 0) {
                                            inv.setItem(sendItemIndex[i], undefined);
                                        } else {
                                            sendItem.amount -= transfer;
                                            inv.setItem(sendItemIndex[i], sendItem);
                                        };
                                        serveItem.amount = transfer;
                                        serveInv.setItem(serveItemIndex[j], serveItem);
                                        flag = true;
                                        break;
                                    } else if (serveItem.maxAmount > serveItem.amount && sendItem.typeId === serveItem.typeId) {
                                        const transfer = Math.min(remainSpeed, sendItemAmount, serveItem.maxAmount - serveItem.amount);
                                        if (serveItem.maxAmount - serveItem.amount < remainSpeed) {
                                            serveItem.amount += transfer;
                                            if (sendItemAmount - transfer <= 0) {
                                                inv.setItem(sendItemIndex[i], undefined);
                                            } else {
                                                sendItem.amount -= transfer;
                                                inv.setItem(sendItemIndex[i], sendItem);
                                            };
                                            serveInv.setItem(serveItemIndex[j], serveItem);
                                            continue;
                                        } else {
                                            serveItem.amount += transfer;
                                            if (sendItemAmount - transfer <= 0) {
                                                inv.setItem(sendItemIndex[i], undefined);
                                            } else {
                                                sendItem.amount -= transfer;
                                                inv.setItem(sendItemIndex[i], sendItem);
                                            };
                                            serveInv.setItem(serveItemIndex[j], serveItem);
                                            flag = true;
                                            break;
                                        };
                                    };
                                };
                            };
                            if (flag) break;
                        };
                    };
                } else if (connect.type === `Liquid`) { };
            };
        };
    };
    return energy;
};