import * as server from "@minecraft/server";

import { mac } from "../data/groups";

server.world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const block = ev.block;
    if (!block) return;
    const blockId = block.typeId;
    const dim = block.dimension;
    if (!dim) return;
    if (!mac.includes(blockId)) return;
    const entity = dim.spawnEntity(blockId, block.bottomCenter());
    entity.nameTag = blockId;
    const inv = entity.getComponent(`minecraft:inventory`).container;
    if (!inv) return;
    inv.setItem(81, new server.ItemStack(`mac:uiarrow`, 1));
});