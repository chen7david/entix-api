import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    // add other path aliases here mirror the tsconfig.json
  },
  testRegex: ".*\\.test\\.tsx?$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  detectOpenHandles: true,
  verbose: true,
};

export default config;
