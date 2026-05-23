import * as server from "@minecraft/server";

import { fuelData } from "../data/fuel.js";
import { setBar, setFlame, connecting, setArrow } from "./function.js";
import { entityData, entityKind } from "../data/block_entity.js";
import { machineData } from "../data/machine.js";
import { maceratorRecipes } from "../recipes/macerator.js";

const speed = 4;
const capacity = 512;

server.system.beforeEvents.startup.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent("blazeio:fuel_generator", fuelGenerator);
    initEvent.blockComponentRegistry.registerCustomComponent("blazeio:macerator", macerator);
});

const macerator = {
    /** @param { server.BlockComponentTickEvent } ev */
    onTick(ev) {
        // ブロック
        const block = ev.block;
        if (!block) return;

        const dimension = block.dimension;

        // ブロックステータス
        let perm = block.permutation;

        // ブロックエンティティ
        const entity = dimension.getEntitiesAtBlockLocation(block.bottomCenter())[0];
        if (!entity) return;

        // ブロックとエンティティが合ってるか確認
        if (!entityKind["blazeio:macerator"].includes(entity.typeId)) return;

        const data = entityData[entity.typeId];

        // インベントリコンテナコンポーネント
        const inv = entity.getComponent(`minecraft:inventory`)?.container;

        // エンティティプロパティ
        let progress = entity.getProperty(`blazeio:progress`) ?? 0;

        // エンティティプロパティ
        let progressMax = entity.getProperty(`blazeio:progress_max`) ?? 20000;

        // エンティティプロパティenergy
        let energy = entity.getProperty(`blazeio:energy`) ?? 0;

        let inputItem = inv.getItem(0);

        let outputItem = inv.getItem(1);

        if (energy > 0 && inputItem !== undefined) {
            const recipe = maceratorRecipes[inputItem.typeId];
            if (recipe) {
                if (inputItem.amount >= recipe.consume && (outputItem === undefined || (outputItem.typeId === recipe.id && outputItem.maxAmount - outputItem.amount >= recipe.product))) {
                    if (progressMax <= 0) {
                        energy -= recipe.energy;
                        progress = 0;
                        progressMax = 0;
                        entity.setProperty(`blazeio:progress`, recipe.tick);
                        entity.setProperty(`blazeio:progress_max`, recipe.tick);
                        perm = perm.withState(`blazeio:actived`, true);
                    } else {
                        energy -= recipe.energy;
                        progress -= 10;
                        if (progress <= 0) {
                            if (inputItem.amount > recipe.consume) {
                                inputItem.amount -= recipe.consume;
                                if (!outputItem) {
                                    outputItem = new server.ItemStack(recipe.id, recipe.product);
                                } else {
                                    outputItem.amount = Math.min(outputItem.amount + recipe.product, 64);
                                };
                                inv.setItem(0, inputItem);
                                inv.setItem(1, outputItem);
                                progress = 0;
                                progressMax = 0;
                                perm = perm.withState(`blazeio:actived`, false);
                                entity.setProperty(`blazeio:progress`, 0);
                                entity.setProperty(`blazeio:progress_max`, 0);
                            } else {
                                if (!outputItem) {
                                    outputItem = new server.ItemStack(recipe.id, recipe.product);
                                } else {
                                    outputItem.amount = Math.min(outputItem.amount + recipe.product, 64);
                                };
                                inv.setItem(0, undefined);
                                inv.setItem(1, outputItem);
                                progress = 0;
                                progressMax = 0;
                                perm = perm.withState(`blazeio:actived`, false);
                                entity.setProperty(`blazeio:progress`, 0);
                                entity.setProperty(`blazeio:progress_max`, 0);
                            };
                        } else {
                            entity.setProperty(`blazeio:progress`, progress);
                        };
                    };
                } else if (progressMax > 0) {
                    perm = perm.withState(`blazeio:actived`, false);
                    progress = 0;
                    progressMax = 0;
                    entity.setProperty(`blazeio:progress`, 0);
                    entity.setProperty(`blazeio:progress_max`, 0);
                };
            } else if (progressMax > 0) {
                perm = perm.withState(`blazeio:actived`, false);
                progress = 0;
                progressMax = 0;
                entity.setProperty(`blazeio:progress`, 0);
                entity.setProperty(`blazeio:progress_max`, 0);
            };
        } else if (progressMax > 0) {
            perm = perm.withState(`blazeio:actived`, false);
            progress = 0;
            progressMax = 0;
            entity.setProperty(`blazeio:progress`, 0);
            entity.setProperty(`blazeio:progress_max`, 0);
        };
        block.setPermutation(perm);

        // 送信
        energy = connecting(entity, dimension, machineData, block, energy, speed, capacity, inv);
        setArrow(inv, 2, (progressMax - progress) / (progressMax || 1));
        let item = new server.ItemStack(data.bgothers.id);
        item.nameTag = `§r§fEnergy: ${energy}`;
        setBar(inv, 3, energy / 512 * 3, 3, item, data.bg.id);
        entity.setProperty(`blazeio:energy`, energy);
    }
};

const fuelGenerator = {
    /** @param { server.BlockComponentTickEvent } ev */
    onTick(ev) {
        // ブロック
        const block = ev.block;
        if (!block) return;

        const dimension = block.dimension;

        // ブロックステータス
        let perm = block.permutation;

        // ブロックエンティティ
        const entity = dimension.getEntitiesAtBlockLocation(block.bottomCenter())[0];
        if (!entity) return;

        // ブロックとエンティティが合ってるか確認
        if (!entityKind["blazeio:fuel_generator"].includes(entity.typeId)) return;

        const data = entityData[entity.typeId];

        // インベントリコンテナコンポーネント
        const inv = entity.getComponent(`minecraft:inventory`)?.container;

        // エンティティプロパティfuel
        let fuel = entity.getProperty(`blazeio:fuel`) ?? 0;

        // エンティティプロパティfuel_max
        const fuelMax = entity.getProperty(`blazeio:fuel_max`) ?? 512;

        // エンティティプロパティenergy
        let energy = entity.getProperty(`blazeio:energy`) ?? 0;

        if (fuel > 0) {
            energy = Math.min(energy + 4, 512);
            fuel = Math.max(0, fuel - 10);
            entity.setProperty(`blazeio:fuel`, fuel);
            setFlame(inv, 1, fuel / fuelMax);
            perm = perm.withState(`blazeio:actived`, true);
        } else if (energy < 512) {
            let fuelItem = inv.getItem(0);
            const fuelAmount = fuelData[fuelItem?.typeId]?.duration ?? undefined;
            if (fuelAmount !== undefined) {
                if (fuelItem.amount === 1) {
                    if (fuelData[fuelItem?.typeId]?.transform === undefined) {
                        inv.setItem(0, undefined);
                    } else {
                        inv.setItem(0, new server.ItemStack(fuelData[fuelItem?.typeId]?.transform));
                    };
                } else {
                    fuelItem.amount -= 1;
                    inv.setItem(0, fuelItem);
                };
                entity.setProperty(`blazeio:fuel`, fuelAmount);
                entity.setProperty(`blazeio:fuel_max`, fuelAmount);
                setFlame(inv, 1, 1);
                perm = perm.withState(`blazeio:actived`, true);
            } else {
                perm = perm.withState(`blazeio:actived`, false);
            };
        } else {
            perm = perm.withState(`blazeio:actived`, false);
        };
        block.setPermutation(perm);

        // 送信
        energy = connecting(entity, dimension, machineData, block, energy, speed, capacity, inv);
        let item = new server.ItemStack(data.bgothers.id);
        item.nameTag = `§r§fEnergy: ${energy}`;
        setBar(inv, 2, energy / 512 * 3, 3, item, data.bg.id);
        entity.setProperty(`blazeio:energy`, energy);
    }
};