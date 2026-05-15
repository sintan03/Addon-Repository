import { world, system, ItemStack, Player, Block } from "@minecraft/server";

const conversionPlanter = {
    "minecraft:wheat_seeds": "planter:planter_wheat",
    "minecraft:oak_sapling": "planter:planter_oak"
};

const growResult = {
    "planter:planter_wheat": {
        "minecraft:wheat": [1, 3],
        "minecraft:wheat_seeds": [1, 4]
    },
    "planter:planter_oak": {
        "minecraft:oak_log": [1, 4],
        "minecraft:oak_sapling": [1, 2],
        "minecraft:apple": [-9, 1]
    }
};

const reverseConversionPlanter = Object.fromEntries(Object.entries(conversionPlanter).map(([k, v]) => [v, k]));

/**
 * 空のポットを種入りのポットに置き換える関数
 * @param { Player } player クリックしたプレイヤー
 * @param { Block } block クリックされたブロック
 * @param { conversionPots } conversionPots 変換データ
 * @returns 空のポットと登録されたアイテムを持っていればブロックが置き換えられます
 */
function convertPlanter(player, block, conversionPots) {
    const equip = player.getComponent(`minecraft:equippable`);
    const itemStack = equip.getEquipment(`Mainhand`);
    if (!itemStack) return;
    const itemId = itemStack.typeId;
    const blockId = block.typeId;
    if (blockId !== `planter:planter_empty`) return;
    const converted = conversionPots[itemId];
    if (!converted) return;
    const location = block.location;
    const dimension = block.dimension;
    if (player.getGameMode() === `Survival`) {
        const amount = itemStack.amount;
        const newItemStack = amount <= 1 ? undefined : new ItemStack(itemId, amount - 1);
        equip.setEquipment(`Mainhand`, newItemStack);
    };
    dimension.setBlockType(location, converted);
};

/**
 * 
 * @param { Player } player 
 * @param { Block } block 
 * @param { growResult } growResult 
 * @returns 
 */
function growPlant(player, block, growResult) {
    const equip = player.getComponent(`minecraft:equippable`);
    const itemStack = equip.getEquipment(`Mainhand`);
    if (!itemStack) return;
    const itemId = itemStack.typeId;
    if (itemId !== `minecraft:bone_meal`) return;
    if (player.getGameMode() === `Survival`) {
        const amount = itemStack.amount;
        const newItemStack = amount <= 1 ? undefined : new ItemStack(itemId, amount - 1);
        equip.setEquipment(`Mainhand`, newItemStack);
    };
    const { dimension } = block;
    dimension.spawnParticle(`minecraft:crop_growth_emitter`, block.bottomCenter());
    dimension.playSound(`item.bone_meal.use`, block.bottomCenter());
    growRandomTick(block, growResult, Math.floor(Math.random() * 4) + 2);
};

function growRandomTick(block, growResult, addGrowth = 1) {
    const blockId = block.typeId;
    if (!growResult[blockId]) return;
    let perm = block.permutation;
    let permGrowth = perm.getState(`planter:growth`) + addGrowth;
    const growthFlag = permGrowth / 8 >= 1;
    permGrowth = permGrowth % 8;
    const dimension = block.dimension;
    const inventoryBlock = block.below();
    if (growthFlag && inventoryBlock && inventoryBlock.getComponent?.(`minecraft:inventory`)?.isValid) {
        const container = inventoryBlock.getComponent(`minecraft:inventory`).container;
        const resultItemIds = [];
        /** @type { Number[] } */
        let results = [];
        for (const resultKey in growResult[blockId]) {
            resultItemIds.push(resultKey);
            const result = growResult[blockId][resultKey];
            results.push(Math.floor(Math.random() * (result[1] - result[0] + 1) + Math.min(result[0], result[1])));
        };
        for (let i = 0; i < container.size; i++) {
            const containerItem = container.getItem(i);
            for (let j = 0; j < results.length; j++) {
                if (results[j] <= 0) continue;
                if (!containerItem) {
                    const sub = Math.min(results[j], 64);
                    results[j] -= sub;
                    container.setItem(i, new ItemStack(resultItemIds[j], sub));
                } else if (containerItem.amount < 64 && containerItem.typeId === resultItemIds[j]) {
                    const sub = Math.min(results[j], 64 - containerItem.amount);
                    results[j] -= sub;
                    containerItem.amount += sub;
                    container.setItem(i, containerItem);
                };
            };
            if (results.find(f => f > 0) === undefined) break;
        };
    };
    perm = perm.withState(`planter:growth`, permGrowth);
    block.setPermutation(perm);
};

system.beforeEvents.startup.subscribe(init => {
    init.blockComponentRegistry.registerCustomComponent(`planter:click`, { onPlayerInteract(ev) { } });
    init.blockComponentRegistry.registerCustomComponent(`planter:tick`, { onTick(ev) {
        growRandomTick(ev.block, growResult);
    } });
});

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    if (!ev.isFirstEvent) return;
    const { player, block, itemStack } = ev;
    if (!itemStack) return;
    if (player.getGameMode() === `Adventure`) return;
    const itemId = itemStack.typeId;
    const blockId = block.typeId;
    if (blockId === `planter:planter_empty`) {
        system.run(() => {
            convertPlanter(player, block, conversionPlanter);
        });
    } else if (blockId.startsWith(`planter:planter_`)) {
        system.run(() => {
            growPlant(player, block, growResult);
        });
    };
});

world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, block, dimension, brokenBlockPermutation } = ev;
    const blockId = brokenBlockPermutation.type.id;
    if (!blockId.startsWith(`planter:planter_`) && blockId !== `planter:planter_empty`) return;
    const entityItems = dimension.getEntities({ location: block.location, type: `minecraft:item`, maxDistance: 2 });
    const findEntityItem = entityItems.find(f => f.getComponent(`minecraft:item`).itemStack.typeId.startsWith(`planter:planter_`) && f.getComponent(`minecraft:item`).itemStack.amount === 1 && f.getComponent(`minecraft:item`).itemStack.typeId !== `planter:planter_empty`);
    if (!findEntityItem) return;
    const location = findEntityItem.location;
    findEntityItem.remove();
    dimension.spawnItem(new ItemStack(`planter:planter_empty`), location);
    dimension.spawnItem(new ItemStack(reverseConversionPlanter[blockId]), location);
});