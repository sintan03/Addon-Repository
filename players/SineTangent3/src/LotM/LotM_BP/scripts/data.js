const defaultMap = new Map().set(`playerId`, Object.fromEntries(Object.entries()));

const mapData = {
    gain: {
        block: 1,
        crystal: 1,
        platinum: 1,
        iridium: 1,
        cookie: 1
    },
    auto: {
        block: 0,
        crystal: 0,
        platinum: 0,
        iridium: 0,
        cookie: 0
    },
    chance: {
        block: 1,
        crystal: 0.0001,
        platinum: 0.0001,
        iridium: 0.0001,
        cookie: 0.0001
    }
};

export const defaultDp = {
    resource: {
        block: 0,
        crystal: 0,
        platinum: 0,
        iridium: 0,
        cookie: 0
    },
    item: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

export const itemData = [
    {
        // 採掘速度
        type: `block`,
        base: 64,
        multi: 2
    },
    {
        // 獲得量x2
        type: `block`,
        base: 128,
        multi: 8
    },
    {
        // block+10
        type: `block`,
        base: 8192,
        multi: 8
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
        type: `iridium`,
        base: 1,
        multi: 6
    },
    {
        // platinum自動+10%
        type: `iridium`,
        base: 64,
        multi: 8
    },
    {
        // 獲得量x2
        type: `iridium`,
        base: 256,
        multi: 64
    },
    {
        // iridium+10
        type: `iridium`,
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
        // iridium自動+10%
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

export const itemEffects = [
    (state, lv) => state
];