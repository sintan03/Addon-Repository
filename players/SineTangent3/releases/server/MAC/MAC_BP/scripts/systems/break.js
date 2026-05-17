import * as server from "@minecraft/server";

import { recipes } from "../data/recipe.js";
import { mac } from "../data/groups.js";

server.system.afterEvents.scriptEventReceive.subscribe(ev => {
    /* 主にブロック破壊時に正常にアイテムをドロップさせる処理 */
    // scriptevent
    const id = ev.id ?? ``;
    if (id !== `mac:block_entity_death`) return;

    // 実行者
    const entity = ev.sourceEntity;
    if (!entity) return;

    // 実行者のID
    const entityId = entity.typeId ?? ``;
    if (!mac.includes(entityId)) return;

    const dim = entity.dimension;
    const loc = entity.location;

    // インベントリコンテナコンポーネント
    const inv = entity.getComponent(`minecraft:inventory`).container;
    if (!inv) return;

    if (entity.getProperty(`mac:complete`)) {
        const index = entity.getProperty(`mac:index`);
        for (let i = 0; i < 81; i++) if ((inv.getItem(i)?.amount ?? 0) > (recipes[index].inputAmount[i] ?? 1)) dim.spawnItem(new server.ItemStack(inv.getItem(i).typeId, inv.getItem(i).amount - (recipes[index].inputAmount[i] ?? 1)), loc);
        if (inv.getItem(82)) dim.spawnItem(inv.getItem(82), loc);
        entity.runCommand(`scriptevent ${recipes[index].identifier}`);
    } else {
        // ドロップ処理
        for (let index = 0; index < 81; index++) {
            if (inv.getItem(index)) {
                dim.spawnItem(inv.getItem(index), loc);
            };
        };
        if (inv.getItem(82)) dim.spawnItem(inv.getItem(82), loc);
    };
    server.system.runTimeout(() => {
        entity.remove();
    }, 2);
});


