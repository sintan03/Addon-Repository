import { world, system } from "@minecraft/server";

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
  if (!ev.isFirstEvent) return;
  const { player, block } = ev;
  const blockId = block.typeId;
  if (blockId !== "televator:televator") return;
  const dimension = block.dimension;
  const dimensionId = dimension.id;
  let limit;
  switch (dimension.id) {
    case "minecraft:overworld":
      limit = { up: 319, down: -64 };
      break;
    case "minecraft:nether":
      limit = { up: 127, down: 0 };
      break;
    case "minecraft:the_end":
      limit = { up: 319, down: 0 };
      break;
    default:
      limit = { up: 511, down: -512 };
      break;
  };
  // Up or Down
  const UoD = player.isSneaking ? -1 : 1;
  const { x, y, z } = block.location;
  let firstBlockLocation;
  for (let i = y + UoD; i * UoD <= limit[UoD === 1 ? "up" : "down"] * UoD; i += UoD) {
    if (dimension.getBlock({ x: x, y: i, z: z })?.typeId === "televator:televator") {
      firstBlockLocation = { fx: x, fy: i, fz: z };
      break;
    };
  };
  if (!firstBlockLocation) return;
  const { fx, fy, fz } = firstBlockLocation;
  system.run(() => {
    player.teleport({ x: fx + 0.5, y: fy + 1, z: fz + 0.5 });
  });
});

system.beforeEvents.startup.subscribe(init => {
  init.blockComponentRegistry.registerCustomComponent("televator:televator", { onPlayerInteract(ev) { } } );
});