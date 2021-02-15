/* ***************************************************************************
 *
 * Copyright (c) 2021, the temporal-cache-js authors.
 *
 * This file is part of the temporal-cache-js library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
module.exports = {
    bail: 5,
    clearMocks: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    slowTestThreshold: 20,
    testEnvironment: "node",
    transformIgnorePatterns: [
      "/node_modules/",
    ],
    verbose: true,
  };
  