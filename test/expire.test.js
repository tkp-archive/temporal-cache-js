/* ***************************************************************************
 *
 * Copyright (c) 2021, the temporal-cache-js authors.
 *
 * This file is part of the temporal-cache-js library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const {expire} = require("../temporalcache");


describe("Expire tests", () => {
    test("test basic", () => {
        let now = new Date(2018, 1, 1, 1, 1, 1);
        let later = new Date(2018, 1, 1, 1, 2, 0);
        let later2 = new Date(2018, 1, 1, 1, 2, 1);

        // mock date
        const realDate = Date;
        global.Date = class extends Date {
            constructor() {
              return now;
            }
          };

        const foo = expire({second: 1})(() => {
            return Math.random();
        });

        let x = foo();
        expect(x).toBe(foo());

        now = later;

        expect(x === foo()).toBe(true);

        now = later2;

        expect(x !== foo()).toBe(true);

        global.Date = realDate;
    });
});
