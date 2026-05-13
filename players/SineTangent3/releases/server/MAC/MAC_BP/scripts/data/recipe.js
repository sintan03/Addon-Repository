export const convert = {
    0: `minecraft:air`,
    1: `minecraft:diamond`,
    2: `minecraft:diamond_block`,
    3: `minecraft:nether_star`,
    4: `minecraft:emerald`,
    5: `minecraft:gold_ingot`,
    6: `minecraft:gold_nugget`,
    7: `minecraft:emerald_block`,
    8: `minecraft:purpur_block`,
    9: `minecraft:chest`,
    "G": `minecraft:gunpowder`,
    "I": `minecraft:iron_ingot`,
    "R": `minecraft:redstone_block`,
};

/*
identifierはマインしてクラフトした時のscripteventのid、被ってもよい

inputは文字列でも行ける...はず

inputAmount: [
    0, 0, 0, 0, 0, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1, 0,
    0, 0, 0, 0, 1, 1, 1, 0, 0,
    1, 0, 0, 1, 1, 1, 0, 0, 0,
    0, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0, 0,
    0, 1, 0, 1, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 1, 0, 0, 0, 0,
],
全部1でもいいし、空にしてもいい


        input: [
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],

*/

export const recipes = [
    {
        identifier: `mac:default`,
        input: [
            0, 0, 0, 0, 1, 0, 0, 0, 0,
            0, 0, 0, 1, 2, 1, 0, 0, 0,
            0, 0, 0, 1, 2, 1, 0, 0, 0,
            0, 1, 1, 2, 1, 2, 1, 1, 0,
            1, 2, 2, 1, 3, 1, 2, 2, 1,
            0, 1, 1, 2, 1, 2, 1, 1, 0,
            0, 0, 0, 1, 2, 1, 0, 0, 0,
            0, 0, 0, 1, 2, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0, 0,
        ],
        inputAmount: [],
        output: { id: `minecraft:nether_star`, amount: 2 }
    },
    {
        identifier: `mac:default`,
        input: [
            0, 0, 0, 5, 5, 5, 0, 0, 0,
            0, 0, 5, 6, 6, 6, 5, 0, 0,
            0, 0, 5, 7, 6, 7, 5, 0, 0,
            0, 0, 5, 6, 6, 6, 5, 0, 0,
            5, 5, 6, 6, 6, 6, 6, 5, 5,
            0, 5, 6, 6, 6, 6, 6, 5, 0,
            0, 0, 5, 6, 6, 6, 5, 0, 0,
            0, 0, 5, 6, 6, 6, 5, 0, 0,
            0, 0, 0, 5, 5, 5, 0, 0, 0,
        ],
        inputAmount: [],
        output: { id: `minecraft:totem_of_undying`, amount: 1 }
    },
    {
        identifier: `mac:default`,
        input: [
            8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 0, 0, 0, 0, 0, 0, 0, 8,
            8, 0, 8, 8, 8, 8, 8, 0, 8,
            8, 0, 8, 0, 0, 0, 8, 0, 8,
            8, 0, 8, 0, 0, 0, 8, 0, 8,
            8, 8, 8, 0, 0, 0, 8, 8, 8,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        inputAmount: [],
        output: { id: `minecraft:shulker_shell`, amount: 1 }
    },
    {
        identifier: `mac:default`,
        input: [
            0, 0, 0, 0, 0, 0, 0, "I", "I",
            0, 0, 0, 0, 0, "I", "I", "I", "I",
            0, 0, 0, "I", "I", 0, "I", "I", 0,
            0, 0, "I", 0, 0, "I", 0, "I", 0,
            0, 0, 0, 0, "I", 0, "I", 0, 0,
            0, 0, 0, "I", 0, 0, "I", 0, 0,
            0, 0, "I", 0, 0, "I", 0, 0, 0,
            0, "I", 0, 0, 0, 0, 0, 0, 0,
            "I", 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        inputAmount: [],
        output: { id: `parry:parry_lance`, amount: 1 }
    },
    {
        identifier: `mac:default`,
        input: [
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, "I", "I", "I", "I", "I", 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        inputAmount: [],
        output: { id: `parry:parry_shield`, amount: 1 }
    },
    {
        identifier: `mac:default`,
        input: [
            0, 0, 0, 0, 0, 0, 0, "R", "R",
            0, 0, 0, 0, 0, 0, "R", "R", "R",
            0, 0, 0, 0, 0, "R", "R", "R", 0,
            0, 0, 0, 0, "R", "R", "R", 0, 0,
            0, "R", 0, "R", 3, "R", 0, 0, 0,
            0, 0, "R", "R", "R", 0, 0, 0, 0,
            0, 0, "R", "R", 0, 0, 0, 0, 0,
            0, "R", 0, 0, "R", 0, 0, 0, 0,
            "R", 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        inputAmount: [],
        output: { id: `ee:materialized_sword`, amount: 1 }
    }
]