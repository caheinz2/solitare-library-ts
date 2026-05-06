import preset from "../../jest.preset.mjs";

/** @type {import("jest").Config} */
const config = {
  ...preset,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.test.json"
      }
    ]
  }
};

export default config;
