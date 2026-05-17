import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

world.afterEvents.itemUse.subscribe(ev => {
    const { source, itemStack } = ev;
    const itemId = itemStack.typeId;
    if (itemId === `invisiblemini:entity_destroyer_mini`) {
        const dp = JSON.parse(source.getDynamicProperty(`invisiblemini:data`) ?? JSON.stringify([]));
        const dimension = source.dimension;
        const form = new ModalFormData();
        const entities = dimension.getEntities({ excludeTypes: [`minecraft:player`] });
        const entitiesData = [];
        for (const entity of entities) {
            const entityId = entity.typeId;
            const found = entitiesData.find(f => f.id === entityId);
            if (found) {
                found.amount += 1;
            } else {
                entitiesData.push({ id: entityId, amount: 1 });
            };
        };
        for (const entityKinds of entitiesData) {
            form.toggle({
                rawtext: [
                    { text: entityKinds.id },
                    { text: ` (` },
                    { text: String(entityKinds.amount) },
                    { text: `)` }
                ]
            }, { defaultValue: (dp.find(f => f === entityKinds.id) === undefined ? false : true) });
        };
        if (entitiesData[0] !== undefined) {
            if (source.isSneaking) {
                form.title({ translate: `ui.invisible_mini.option.title` });
                form.submitButton({ translate: `ui.invisible_mini.save` });
                form.show(source).then(res => {
                    if (res.canceled) return;
                    const newDp = [];
                    for (let i = 0; i < res.formValues.length; i++) {
                        const toggle = res.formValues[i];
                        if (!toggle) continue;
                        newDp.push(entitiesData[i].id);
                    };
                    for (const undentity of dp.filter(f => entitiesData.filter(l => l.id !== f))) {
                        newDp.push(undentity);
                    };
                    source.setDynamicProperty(`invisiblemini:data`, JSON.stringify(newDp));
                });
            } else {
                form.title({ translate: `ui.invisible_mini.title` });
                form.submitButton({ translate: `ui.invisible_mini.destroy` });
                form.show(source).then(res => {
                    if (res.canceled) return;
                    for (let i = 0; i < res.formValues.length; i++) {
                        const toggle = res.formValues[i];
                        if (!toggle) continue;
                        const removeEntities = dimension.getEntities({ type: entitiesData[i].id });
                        for (const removeEntity of removeEntities) {
                            removeEntity.remove();
                        };
                        world.sendMessage({ rawtext: [{ text: `§b§l${entitiesData[i].id}` }, { translate: `text.invisible_mini.removed` }, { text: ` 実行者: ${source.name}` }] });
                    };
                    const players = world.getAllPlayers();
                    if (res.formValues.includes(true)) {
                        for (const player of players) {
                            player.playSound(`random.totem`, { pitch: 0.6 });
                        };
                    };
                });
            };
        } else {
            source.sendMessage({ translate: `text.invisible_mini.error` });
        };
    } else if (itemId === `minecraft:diamond` && itemStack.amount === 2 && source.isSneaking && !source.isOnGround) {
        source.getComponent(`minecraft:equippable`).setEquipment(`Mainhand`, new ItemStack(`invisiblemini:entity_destroyer_mini`));
    };
});