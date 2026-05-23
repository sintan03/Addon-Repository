import * as server from "@minecraft/server";

export const bossData = {
    "sineboss:crusher": {
        phase: [0.5],
        rate: [
            [5, 3],
            [7, 2, 4]
        ],
        skill: [
            [
                {
                    type: `line`,
                    next: 4,
                    charge: {
                        cooltime: 40,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:wind_explosion_emitter`, offsetY: 1 },
                        sound: { name: `wind_charge.burst`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:critical_hit_emitter`, offset: { width: 1, height: 2 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 5,
                        tick: 80,
                        speed: 0.3,
                        distance: 0.8,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:large_explosion`, offsetY: 0 },
                        sound: false,
                        rotate: [-40, 0, 40],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `circle`,
                    next: 4,
                    charge: {
                        cooltime: 60,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:egg_destroy_emitter`, offsetY: 1 },
                        sound: { name: `random.fizz`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:knockback_roar_particle`, offset: { width: 0, height: 1 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 4,
                        tick: 50,
                        angleMulti: 3,
                        rotationSpeed: 32,
                        speed: 15,
                        distance: 0.8,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:cauldron_explosion_emitter`, offsetY: 0 },
                        sound: false,
                        rotate: [60, 180, 300],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
            ],
            [
                {
                    type: `line`,
                    next: 3,
                    //next: 1,
                    charge: {
                        cooltime: 40,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:wind_explosion_emitter`, offsetY: 1 },
                        sound: { name: `wind_charge.burst`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:critical_hit_emitter`, offset: { width: 1, height: 2 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 7,
                        tick: 80,
                        speed: 0.5,
                        //speed: 1.2,
                        distance: 1,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:large_explosion`, offsetY: 0 },
                        sound: false,
                        rotate: [-60, -30, 0, 30, 60],
                        //rotate: [-180, -165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `circle`,
                    next: 6,
                    charge: {
                        cooltime: 120,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:egg_destroy_emitter`, offsetY: 1 },
                        sound: { name: `random.fizz`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:knockback_roar_particle`, offset: { width: 0, height: 1 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 6,
                        tick: 100,
                        angleMulti: 3,
                        rotationSpeed: 32,
                        //rotationSpeed: 32,
                        speed: 15,
                        //speed: 30,
                        distance: 1,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:cauldron_explosion_emitter`, offsetY: 0 },
                        sound: false,
                        rotate: [0, 72, 144, 216, 288],
                        //rotate: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `explosion`,
                    next: 5,
                    //next: 1,
                    charge: {
                        cooltime: 80,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:huge_explosion_emitter`, offsetY: 1 },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:totem_particle`, offset: { width: 1, height: 2 } },
                        sound: { name: `beacon.activate`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 0,
                        tick: 50,
                        speed: 0.4,
                        distance: 0,
                        delay: 1.5,
                        bullet: 20,
                        amount: { start: 0, end: 1 },
                        particle: { name: `minecraft:mobflame_single`, offsetY: 0 },
                        sound: { name: `random.fuse`, volume: 1.0, pitch: 1.0 },
                        explosion: {
                            damage: 8,
                            tick: 40,
                            distance: 4,
                            particle: { name: `minecraft:huge_explosion_emitter`, offset: { x: 0, y: 0, z: 0 } },
                            sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                        },
                        locOff: { width: 0, height: 1 },
                    }
                },
            ]
        ]
    },
    "sineboss:true_crusher": {
        phase: [0.6, 0.3],
        rate: [
            [5, 3],
            [7, 2, 4],
            [4, 1, 3]
        ],
        skill: [
            [
                {
                    type: `line`,
                    next: 4,
                    charge: {
                        cooltime: 40,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:wind_explosion_emitter`, offsetY: 1 },
                        sound: { name: `wind_charge.burst`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:critical_hit_emitter`, offset: { width: 1, height: 2 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 8,
                        tick: 70,
                        speed: 0.4,
                        distance: 0.8,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:large_explosion`, offsetY: 0 },
                        sound: { name: `random.explode`, volume: 0.5, pitch: 0.8 },
                        rotate: [-80, -40, 0, 40, 80],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `circle`,
                    next: 4,
                    charge: {
                        cooltime: 60,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:egg_destroy_emitter`, offsetY: 1 },
                        sound: { name: `random.fizz`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:knockback_roar_particle`, offset: { width: 0, height: 1 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 6,
                        tick: 50,
                        angleMulti: 3,
                        rotationSpeed: 32,
                        speed: 15,
                        distance: 0.8,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:cauldron_explosion_emitter`, offsetY: 0 },
                        sound: { name: `random.fizz`, volume: 0.5, pitch: 1.0 },
                        rotate: [0, 60, 120, 180, 240, 300],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
            ],
            [
                {
                    type: `line`,
                    next: 3,
                    charge: {
                        cooltime: 40,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:wind_explosion_emitter`, offsetY: 1 },
                        sound: { name: `wind_charge.burst`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:critical_hit_emitter`, offset: { width: 1, height: 2 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 10,
                        tick: 60,
                        speed: 0.5,
                        distance: 1,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:large_explosion`, offsetY: 0 },
                        sound: { name: `random.explode`, volume: 0.5, pitch: 0.8 },
                        rotate: [-100, -75, -50, -25, 0, 25, 50, 75, 100],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `circle`,
                    next: 6,
                    charge: {
                        cooltime: 100,
                        tick: 40,
                        amplifier: 4,
                        particle: { name: `minecraft:egg_destroy_emitter`, offsetY: 1 },
                        sound: { name: `random.fizz`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:knockback_roar_particle`, offset: { width: 0, height: 1 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 8,
                        tick: 100,
                        angleMulti: 4,
                        rotationSpeed: 32,
                        speed: 15,
                        distance: 1,
                        amount: { start: -1, end: 3 },
                        particle: { name: `minecraft:cauldron_explosion_emitter`, offsetY: 0 },
                        sound: { name: `random.fizz`, volume: 0.5, pitch: 1.0 },
                        rotate: [0, 72, 144, 216, 288],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `explosion`,
                    next: 5,
                    charge: {
                        cooltime: 80,
                        tick: 40,
                        amplifier: 3,
                        particle: { name: `minecraft:huge_explosion_emitter`, offsetY: 1 },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:totem_particle`, offset: { width: 1, height: 2 } },
                        sound: { name: `beacon.activate`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 0,
                        tick: 80,
                        speed: 0.5,
                        distance: 0,
                        delay: 1.5,
                        bullet: 25,
                        amount: { start: 0, end: 1 },
                        particle: { name: `minecraft:mobflame_single`, offsetY: 0 },
                        sound: { name: `random.fuse`, volume: 1.0, pitch: 1.0 },
                        explosion: {
                            damage: 10,
                            tick: 45,
                            distance: 4,
                            particle: { name: `minecraft:huge_explosion_emitter`, offset: { x: 0, y: 0, z: 0 } },
                            sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                        },
                        locOff: { width: 0, height: 1 },
                    }
                },
            ],
            [
                {
                    type: `line`,
                    next: 2,
                    //next: 1,
                    charge: {
                        cooltime: 1,
                        tick: 20,
                        amplifier: 3,
                        particle: { name: `minecraft:wind_explosion_emitter`, offsetY: 1 },
                        sound: { name: `wind_charge.burst`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:critical_hit_emitter`, offset: { width: 1, height: 2 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 13,
                        tick: 60,
                        speed: 0.6,
                        distance: 1,
                        amount: { start: -1, end: 4 },
                        particle: { name: `minecraft:large_explosion`, offsetY: 0 },
                        sound: { name: `random.explode`, volume: 0.5, pitch: 0.8 },
                        rotate: [-160, -120, -80, -40, 0, 40, 80, 120, 160],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `circle`,
                    next: 5,
                    charge: {
                        cooltime: 1,
                        tick: 20,
                        amplifier: 3,
                        particle: { name: `minecraft:egg_destroy_emitter`, offsetY: 1 },
                        sound: { name: `random.fizz`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:knockback_roar_particle`, offset: { width: 0, height: 1 } },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 11,
                        tick: 100,
                        angleMulti: 7,
                        rotationSpeed: 32,
                        speed: 15,
                        distance: 1,
                        amount: { start: -1, end: 4 },
                        particle: { name: `minecraft:cauldron_explosion_emitter`, offsetY: 0 },
                        sound: { name: `random.fizz`, volume: 0.5, pitch: 1.0 },
                        rotate: [0, 72, 144, 216, 288],
                        locOff: { width: 0, height: 0.3 },
                    }
                },
                {
                    type: `explosion`,
                    next: 4,
                    charge: {
                        cooltime: 1,
                        tick: 20,
                        amplifier: 3,
                        particle: { name: `minecraft:huge_explosion_emitter`, offsetY: 1 },
                        sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                    },
                    active: {
                        particle: { name: `minecraft:totem_particle`, offset: { width: 1, height: 2 } },
                        sound: { name: `beacon.activate`, volume: 1.0, pitch: 1.0 }
                    },
                    attack: {
                        damage: 0,
                        tick: 100,
                        speed: 0.28,
                        distance: 0,
                        delay: 1,
                        bullet: 55,
                        amount: { start: 0, end: 1 },
                        particle: { name: `minecraft:mobflame_single`, offsetY: 0 },
                        sound: { name: `random.fuse`, volume: 1.0, pitch: 1.0 },
                        explosion: {
                            damage: 15,
                            tick: 70,
                            distance: 4,
                            particle: { name: `minecraft:huge_explosion_emitter`, offset: { x: 0, y: 0, z: 0 } },
                            sound: { name: `random.explode`, volume: 1.0, pitch: 1.0 }
                        },
                        locOff: { width: 0, height: 1 },
                    }
                },
            ]
        ]
    },
};