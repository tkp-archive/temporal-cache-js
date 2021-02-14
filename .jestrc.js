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
  