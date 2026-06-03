import { world, system } from "@minecraft/server";
import { CustomForm, Observable } from "@minecraft/server-ui";

import { defaultDp, itemData, itemEffects } from "./data.js";

const formTabLists = [
    `form.lotm.main.status`,
    `form.lotm.main.shop`,
    `form.lotm.main.description`
];

const playerState = new Map();

world.afterEvents.playerSpawn.subscribe(ev => {
    const { initialSpawn, player } = ev;
    if (!initialSpawn || playerState.has(player.id)) return;
    const dp = player.getDynamicProperty(`lotm:data`) === undefined ? defaultDp : JSON.parse(player.getDynamicProperty(`lotm:data`));
    playerState.set(player.id, JSON.parse(dp));
});

world.beforeEvents.itemUse.subscribe(ev => {
    const { source } = ev;
    system.run(() => {
        const equip = source.getComponent(`minecraft:equippable`);
        const item = equip.getEquipment(`Mainhand`);
        if (!item) return;
        const itemId = item.typeId;
        switch (itemId) {
            case `minecraft:emerald`:
                const title = Observable.create({ translate: `form.lotm.main.title` }, { clientWritable: true });
                const form = CustomForm.create(source, title);
                const visibleIndex = Observable.create(-1, { clientWritable: true });
                for (let i = 0; i < formTabLists.length; i++) {
                    const visible = Observable.create(visibleIndex.getData() === -1 || visibleIndex.getData() === i, { clientWritable: true })
                    form.button({ translate: formTabLists[i] }, () => {
                        visibleIndex.getData() === i ? visibleIndex.setData(-1) : visibleIndex.setData(i);
                    }, { visible: visible });
                    visibleIndex.subscribe(newValue => visible.setData(newValue === -1 || newValue === i));
                };
                visibleIndex.subscribe(newValue => {
                    if (newValue === -1) {
                        title.setData({ translate: `form.lotm.main.title` });
                    } else {
                        title.setData({ translate: formTabLists[newValue] });
                    };
                });
                form.show();
                break;
            case `minecraft:blaze_rod`:
                source.setDynamicProperties(JSON.stringify(defaultDp));
                playerState.set(source.id, )
                break;
        };
    });
});

world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, itemStackAfterBreak, dimension } = ev;
    if (!itemStackAfterBreak) return;
    const itemId = itemStackAfterBreak.typeId;
    switch (itemId) {
        case `minecraft:emerald`:
            const dp = player.getDynamicProperty(`lotm:data`) === undefined ? defaultDp : JSON.parse(player.getDynamicProperty(`lotm:data`));

            break;
    };
});