// @ts-check

export class Decimal {

    /**
     * @param { Number | Decimal | undefined } value 
     */
    constructor(value) {
        if (value === undefined) {
            /** @type { Number } */ this.m = 0;
            /** @type { Number } */ this.e = 0;
        } else if (value instanceof Decimal) {
            this.m = value.m;
            this.e = value.e;
        } else {
            [this.m, this.e] = this.sort(value);
        };
    };

    format(value) {
        
    };

    /**
     * @param { Number } value 
     * @returns { [Number, Number] }
     */
    sort(value) {
        if (value >= 1) {
            for (let i = 0; ; i++) {
                if (value < 10 ** (i + 1)) {
                    return [value / 10 ** i, i];
                };
            };
        } else {
            for (let i = 0; ; i--) {
                if (value > 10 ** (i - 1)) {
                    return [value / 10 ** i, i];
                };
            };
        };
    };
};