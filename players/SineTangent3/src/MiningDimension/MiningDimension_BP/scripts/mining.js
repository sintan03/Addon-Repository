import * as server from "@minecraft/server";

import { OreGenerationData } from "./data.js";

const MiningDimensionType = `mining:mining_dimension`;

function setOutline(data, blockId, dimension) {
    for (let i = data[0].x; i <= data[1].x; i++) {
        for (let j = data[0].y; j <= data[1].y; j++) {
            for (let k = data[0].z; k <= data[1].z; k++) {
                if ([data[0].x, data[1].x].includes(i) || [data[0].y, data[1].y].includes(j) || [data[0].z, data[1].z].includes(k)) {
                    dimension.setBlockType({ x: i, y: j, z: k }, blockId);
                };
            };
        };
    };
};

function setFill(data, blockId, dimension) {
    for (let i = data[0].x; i <= data[1].x; i++) {
        for (let j = data[0].y; j <= data[1].y; j++) {
            for (let k = data[0].z; k <= data[1].z; k++) {
                dimension.setBlockType({ x: i, y: j, z: k }, blockId);
            };
        };
    };
};

server.system.beforeEvents.startup.subscribe(init => {
    init.dimensionRegistry.registerCustomDimension(MiningDimensionType);
});

server.world.afterEvents.playerDimensionChange.subscribe(ev => {
    const { player, toDimension } = ev;
    if (!player) return;
    if (!toDimension) return;
    if (toDimension.id !== MiningDimensionType) return;
    if (player.typeId !== `minecraft:player`) return;
    const block = toDimension.getBlock({ x: 0, y: 63, z: 0 });
    if (block.typeId !== `minecraft:air`) return;
    toDimension.setBlockType({ x: 0, y: 64, z: 0 }, `mining:mining_dimension_warp_block`);
    setOutline([{ x: -8, y: -65, z: -8 }, { x: 7, y: 63, z: 7 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: -24, y: -65, z: -24 }, { x: -9, y: 63, z: -9 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: -24, y: -65, z: -8 }, { x: -9, y: 63, z: 7 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: -24, y: -65, z: 8 }, { x: -9, y: 63, z: 23 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: -8, y: -65, z: -24 }, { x: 7, y: 63, z: -9 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: -8, y: -65, z: 8 }, { x: 7, y: 63, z: 23 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: 8, y: -65, z: -24 }, { x: 23, y: 63, z: -9 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: 8, y: -65, z: -8 }, { x: 23, y: 63, z: 7 }], `minecraft:bedrock`, toDimension);
    setOutline([{ x: 8, y: -65, z: 8 }, { x: 23, y: 63, z: 23 }], `minecraft:bedrock`, toDimension);
    toDimension.setBlockType({ x: -17, y: 63, z: -17 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: -17, y: 63, z: -1 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: -17, y: 63, z: 15 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: -1, y: 63, z: -17 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: -1, y: 63, z: 15 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: 15, y: 63, z: -17 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: 15, y: 63, z: -1 }, `mining:mining_dimension_generator`);
    toDimension.setBlockType({ x: 15, y: 63, z: 15 }, `mining:mining_dimension_generator`);
});

server.world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    if (!ev.isFirstEvent) return;
    const { block, player } = ev;
    if (!block) return;
    if (!player) return;
    const dimension = player.dimension;
    const dimId = dimension.id;
    switch (block.typeId) {
        case `mining:mining_dimension_warp_block`:
            if (dimId !== MiningDimensionType) {
                const { x, y, z } = player.location;
                const text = { x: x, y: y, z: z, dim: dimension.id };
                player.setDynamicProperty(`mining:tp`, JSON.stringify(text));
                server.system.run(() => {
                    player.teleport({ x: 0.5, y: 65.5, z: 0.5 }, { "dimension": server.world.getDimension(MiningDimensionType), "rotation": player.getRotation() });
                });
            } else {
                /** @type {{ x: Number, y: Number, z: Number, dim: String }} */
                const dp = JSON.parse(player.getDynamicProperty(`mining:tp`));
                server.system.run(() => {
                    player.teleport({ x: dp.x, y: dp.y, z: dp.z }, { "dimension": server.world.getDimension(dp.dim), "rotation": player.getRotation() });
                });
            };
            break;
        case `mining:mining_dimension_generator`:
            const { x, y, z } = block.location;
            server.system.run(() => {
                setFill([{ x: x-7, y: 0, z: z-7 }, { x: x+8, y: 63, z: z+8 }], `minecraft:stone`, dimension);
                setFill([{ x: x-7, y: -64, z: z-7 }, { x: x+8, y: -1, z: z+8 }], `minecraft:deepslate`, dimension);
                if (dimension.getBlock({ x: x-16, y: -65, z: z-16 }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x-23, y: -65, z: z-23 }, { x: x-8, y: 63, z: z-8 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x-16, y: 63, z: z-16 }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x-16, y: -65, z: z }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x-23, y: -65, z: z-7 }, { x: x-8, y: 63, z: z+8 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x-16, y: 63, z: z }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x-16, y: -65, z: z+16 }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x-23, y: -65, z: z+9 }, { x: x-8, y: 63, z: z+24 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x-16, y: 63, z: z+16 }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x, y: -65, z: z-16 }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x-7, y: -65, z: z-23 }, { x: x+8, y: 63, z: z-8 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x, y: 63, z: z-16 }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x, y: -65, z: z+16 }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x-7, y: -65, z: z+9 }, { x: x+8, y: 63, z: z+24 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x, y: 63, z: z+16 }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x+16, y: -65, z: z-16 }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x+9, y: -65, z: z-23 }, { x: x+24, y: 63, z: z-8 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x+16, y: 63, z: z-16 }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x+16, y: -65, z: z }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x+9, y: -65, z: z-7 }, { x: x+24, y: 63, z: z+8 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x+16, y: 63, z: z }, `mining:mining_dimension_generator`); };
                if (dimension.getBlock({ x: x+16, y: -65, z: z+16 }).typeId !== `minecraft:bedrock`) { setOutline([{ x: x+9, y: -65, z: z+9 }, { x: x+24, y: 63, z: z+24 }], `minecraft:bedrock`, dimension); dimension.setBlockType({ x: x+16, y: 63, z: z+16 }, `mining:mining_dimension_generator`); };
            });
    };
});

server.system.beforeEvents.startup.subscribe(init => {
    init.blockComponentRegistry.registerCustomComponent(`mining:click`, {
        onPlayerInteract(ev) { }
    })
});