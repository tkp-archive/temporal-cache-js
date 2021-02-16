/* ***************************************************************************
 *
 * Copyright (c) 2021, the temporal-cache-js authors.
 *
 * This file is part of the temporal-cache-js library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const { interval } = require("../temporalcache");

describe("Interval tests", () => {
  test("test basic", (done) => {
    const now = new Date(2018, 1, 1, 1, 1, 0);

    const foo = interval({ seconds: 1 })(() => Math.random());

    const x = foo();
    expect(x).toBe(foo());

    setTimeout(() => {
      expect(x).toBe(foo());
      done();
    }, 100);

    setTimeout(() => {
      expect(x === foo()).toBe(true);
      done();
    }, 1000);
  });
});
