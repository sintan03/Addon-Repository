import { world, system, LootTableManager } from "@minecraft/server";
import { CustomForm, Observable } from "@minecraft/server-ui";

world.afterEvents.playerJoin.subscribe(ev => {
    const { playerName } = ev;
    let dp = world.getDynamicProperty(`eaem:data`);
    if (dp) dp = JSON.parse(dp); else dp = [];
    dp.unshift({ name: playerName, time: Date.now(), entry: true });
    if (dp.length > 50) dp.pop();
    world.setDynamicProperty(`eaem:data`, JSON.stringify(dp));
});

world.beforeEvents.playerLeave.subscribe(ev => {
    const { player } = ev;
    let dp = world.getDynamicProperty(`eaem:data`);
    if (dp) dp = JSON.parse(dp); else dp = [];
    dp.unshift({ name: player.name, time: Date.now(), entry: false });
    if (dp.length > 50) dp.pop();
    world.setDynamicProperty(`eaem:data`, JSON.stringify(dp));
});

world.afterEvents.playerSpawn.subscribe(ev => {
    const { player, initialSpawn } = ev;
    if (!initialSpawn) return;
    system.runTimeout(() => player.sendMessage({ translate: `eaem.join.message` }), 20);
});

world.afterEvents.itemUse.subscribe(ev => {
    const { source, itemStack } = ev;
    if (itemStack.typeId === `eaem:list`) {
        let dp = world.getDynamicProperty(`eaem:data`);
        if (dp) dp = JSON.parse(dp); else dp = [];
        const form = CustomForm.create(source, { translate: `eaem.form.title`, with: [`${dp.length}`] });
        let label;
        if (dp.length === 0) {
            label = Observable.create({ translate: `eaem.form.unde` }, { clientWritable: true });
        } else {
            const text = [];
            for (let i = 0; i < dp.length; i++) {
                const jst = new Date(dp[i].time + 32400000);
                const month = jst.getUTCMonth() + 1;
                const day = jst.getUTCDate();
                const hour = String(jst.getUTCHours()).padStart(2, "0");
                const minute = String(jst.getUTCMinutes()).padStart(2, "0");
                text.push(`${dp[i].name}\n${month}/${day} ${hour}:${minute} | ${dp[i].entry ? "Join" : "Exit"}`);
            };
            label = Observable.create(text.join(`\n\n`), { clientWritable: true });
        };
        form.label(label);
        form.show();
    };
});