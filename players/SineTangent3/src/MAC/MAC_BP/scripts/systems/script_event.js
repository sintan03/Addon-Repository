import * as server from "@minecraft/server";

server.system.afterEvents.scriptEventReceive.subscribe(ev => {
    // 実行者
    const entity = ev.sourceEntity;
    if (!entity) return;

    // 実行者のID
    const entityId = entity.typeId ?? ``;

    const dim = entity.dimension;
    const loc = entity.location;
    
    // scriptevent
    const id = ev.id ?? ``;
    if (id === `mac:default`) {
        dim.spawnParticle(`minecraft:huge_explosion_emitter`, loc);
        dim.playSound(`random.explode`, loc);
    };
});