import { world, system } from "@minecraft/server";
import { CustomForm, Observable } from "@minecraft/server-ui";

const formTabLists = [
    `form.lotm.main.status`,
    `form.lotm.main.shop`,
    `form.lotm.main.description`
];

const defaultDp = {
    resource: {
        block: 0,
        crystal: 0,
        platinum: 0,
        indium: 0,
        cookie: 0
    },
    item: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

const itemData = [
    {
        // 採掘速度
        type: `block`,
        base: 64,
        multi: 16
    },
    {
        // 獲得量x2
        type: `block`,
        base: 256,
        multi: 8
    },
    {
        // block+10
        type: `block`,
        base: 1024,
        multi: 4
    },
    {
        // 確率+10%
        type: `crystal`,
        base: 1,
        multi: 3
    },
    {
        // block自動+10%
        type: `crystal`,
        base: 64,
        multi: 8
    },
    {
        // 獲得量x2
        type: `crystal`,
        base: 256,
        multi: 16
    },
    {
        // crystal+10
        type: `crystal`,
        base: 1024,
        multi: 4
    },
    {
        // 確率+1000%
        type: `platinum`,
        base: 1,
        multi: 4
    },
    {
        // crystal自動+10%
        type: `platinum`,
        base: 64,
        multi: 8
    },
    {
        // 獲得量x2
        type: `platinum`,
        base: 256,
        multi: 32
    },
    {
        // platinum+10
        type: `platinum`,
        base: 1024,
        multi: 4
    },
    {
        // 確率+100000%
        type: `indium`,
        base: 1,
        multi: 6
    },
    {
        // platinum自動+10%
        type: `indium`,
        base: 64,
        multi: 8
    },
    {
        // 獲得量x2
        type: `indium`,
        base: 256,
        multi: 64
    },
    {
        // indium+10
        type: `indium`,
        base: 1024,
        multi: 4
    },
    {
        // 確率+10000000%
        type: `cookie`,
        base: 1,
        multi: 8
    },
    {
        // indium自動+10%
        type: `cookie`,
        base: 64,
        multi: 8
    },
    {
        // 獲得量x2
        type: `cookie`,
        base: 256,
        multi: 64
    },
    {
        // cookie+10
        type: `cookie`,
        base: 1024,
        multi: 4
    },
    {
        // 全自動+10%
        type: `cookie`,
        base: 8192,
        multi: 16
    },
    {
        // 自動購入
        type: `cookie`,
        base: 65536,
        multi: 65536
    },
];

const playerStatus = new Map();

world.afterEvents.playerJoin.subscribe(ev => {
    const { playerId } = ev;
    if (!playerStatus.has(playerId)) return;
    playerStatus.set(playerId, {
        
    });
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
        };
    });
});

world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, itemStackAfterBreak, dimension } = ev;
    if (!itemStackAfterBreak) return;
    const itemId = itemStackAfterBreak.typeId;
    switch (itemId) {
        case `minecraft:emerald`:
            const dp = player.getDynamicProperty(`lotm:data`) === undefined ? `` : JSON.parse(player.getDynamicProperty(`lotm:data`));

            break;
    };
});