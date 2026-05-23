import * as server from "@minecraft/server";

import { entityData } from "../data/block_entity.js";
import { setArrow, setBar, setFlame, setBg } from "./function.js";

server.world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const block = ev.block;
    if (!block) return;
    const blockId = block.typeId;
    const dim = block.dimension;
    if (!dim) return;
    let indexes = entityData[blockId];
    if (indexes !== undefined) {
        indexes = indexes?.arrow;
        const entity = dim.spawnEntity(blockId, block.bottomCenter());
        entity.nameTag = blockId;
        const inv = entity.getComponent(`minecraft:inventory`).container;
        for (const index of indexes) {
            setArrow(inv, index, 0);
        };
        if (entityData[blockId]?.bg !== undefined) {
            indexes = entityData[blockId]?.bg.index;
            for (const index of indexes) {
                setBg(inv, index, 0, 0, entityData[blockId]?.bg.id);
            };
        };
        indexes = entityData[blockId]?.flame;
        if (indexes !== undefined) {
            for (const index of indexes) {
                setFlame(inv, index, 0);
            };
        };
        indexes = entityData[blockId]?.bgothers;
        if (indexes !== undefined) {
            for (const index of indexes.index) {
                let item = new server.ItemStack(indexes.id);
                item.nameTag = `§r§fEnergy: 0`
                setBar(inv, index, 0, 3, item, entityData[blockId]?.bg.id);
            };
        };
    };
});