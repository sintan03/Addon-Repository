import * as server from "@minecraft/server";

import { convert, recipes } from "../data/recipe";
import { mac } from "../data/groups";

server.system.beforeEvents.startup.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent(`mac:mac`, {
        onTick(ev) {
            const block = ev.block;
            if (!block) return;
            const blockId = block.typeId ?? ``;
            if (!mac.includes(blockId)) return;
            const entity = block.dimension.getEntitiesAtBlockLocation(block.bottomCenter())[0];
            if (!entity) return;
            const entityId = entity.typeId;
            if (!mac.includes(entityId)) return;
            const inv = entity.getComponent(`minecraft:inventory`).container;
            if (!inv) return;
            let complete = false;
            const invitems = { id: [], amount: [] };
            for (let i = 0; i < 81; i++) {
                const invitem = inv.getItem(i);
                if (!invitem) {
                    invitems.id.push(`minecraft:air`);
                    invitems.amount.push(0);
                } else {
                    invitems.id.push(invitem.typeId);
                    invitems.amount.push(invitem.amount);
                };
            };
            let recipeIndex = 0;
            for (const recipe of recipes) {
                for (let i = 0; i < 81; i++) {
                    const converted = convert[recipe.input[i]];
                    if (converted === undefined) { console.error(`変換先のアイテムがありません、多分`); return; };
                    if (invitems.id[i] !== converted) break;
                    if (recipes[0].inputAmount.length === 81 && invitems.id[i] !== `minecraft:air`) {
                        if (invitems.amount[i] < recipe.inputAmount[i]) break;
                    };
                    if (i === 80) complete = true;
                };
                if (complete) break;
                recipeIndex++;
            };
            const completed = entity.getProperty(`mac:complete`);
            const outputItem = inv.getItem(82);
            let match = (outputItem !== undefined);
            if (complete) {
                entity.setProperty(`mac:index`, recipeIndex);
                if (match) {
                    if (outputItem.typeId !== recipes[recipeIndex].output.id) match = false;
                };
            };
            const dim = entity.dimension;
            const loc = entity.location;
            const { x, y, z } = loc;
            if (!complete) {
                if (!completed) {
                    if (!match) {
                        return;
                    } else {
                        dim.spawnItem(outputItem, { x: x, y: y + 1, z: z });
                        inv.setItem(82, undefined);
                    };
                } else {
                    if (!match) {
                        for (let i = 0; i < 81; i++) ((inv.getItem(i)?.amount ?? 0) > (recipes[recipeIndex].inputAmount[i] ?? 1)) ? inv.setItem(i, new server.ItemStack(inv.getItem(i).typeId, inv.getItem(i).amount - (recipes[recipeIndex].inputAmount[i] ?? 1))) : inv.setItem(i, undefined);
                        entity.setProperty(`mac:complete`, false);
                    } else {
                        inv.setItem(82, undefined);
                        entity.setProperty(`mac:complete`, false);
                    };
                };
            } else {
                if (!completed) {
                    if (!match) {
                        inv.setItem(82, new server.ItemStack(recipes[recipeIndex].output.id, recipes[recipeIndex].output.amount));
                        entity.setProperty(`mac:complete`, true);
                    } else {
                        dim.spawnItem(outputItem, { x: x, y: y + 1, z: z });
                        inv.setItem(82, new server.ItemStack(recipes[recipeIndex].output.id, recipes[recipeIndex].output.amount));
                        entity.setProperty(`mac:complete`, true);
                    };
                } else {
                    if (!match) {
                        for (let i = 0; i < 81; i++) ((inv.getItem(i)?.amount ?? 0) > (recipes[recipeIndex].inputAmount[i] ?? 1)) ? inv.setItem(i, new server.ItemStack(inv.getItem(i).typeId, inv.getItem(i).amount - (recipes[recipeIndex].inputAmount[i] ?? 1))) : inv.setItem(i, undefined);
                        entity.setProperty(`mac:complete`, false);
                    } else {
                        return;
                    };
                };
            };
        }
    });
});