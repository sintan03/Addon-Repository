import * as server from "@minecraft/server";

import { entityData } from "../data/block_entity.js";

server.system.afterEvents.scriptEventReceive.subscribe(ev => {
    /* 主にブロック破壊時に正常にアイテムをドロップさせる処理 */
    // scriptevent
    const id = ev.id ?? ``;
    if (id !== `blazeio:block_entity_death`) return;

    // 実行者
    const entity = ev.sourceEntity;
    if (!entity) return;

    // 実行者のID
    const entityId = entity.typeId ?? ``;

    // アイテムをドロップする...何だ
    const indexes = entityData[entityId]?.drop;
    if (!indexes) return;

    // インベントリコンテナコンポーネント
    const inv = entity.getComponent(`minecraft:inventory`).container;
    if (!inv) return;

    // ドロップ処理
    for (const index of indexes) {
        if (inv.getItem(index)) {
            entity.dimension.spawnItem(inv.getItem(index), entity.location);
        };
    };
    entity.remove();
});