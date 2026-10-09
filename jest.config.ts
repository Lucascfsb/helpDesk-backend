import type { Config } from "@jest/types";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const config: Config.InitialOptions = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
  setupFiles: ["dotenv/config"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/generated/",
    "/src/database/",
  ],
};

export default config;
