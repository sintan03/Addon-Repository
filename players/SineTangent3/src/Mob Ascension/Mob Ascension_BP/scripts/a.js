let p = 0.0001;
for (let i = 0; i <= 1500; i += 10) {
    const sub = Math.floor(i ** 0.6);
    const a = Math.floor(1 * (sub * 2 + 1) - (sub + 1));
    console.log(`${i}: ${a}, ${a / p}`);
    p = Math.max(0.0001, a);
};