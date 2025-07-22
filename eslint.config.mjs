import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js"], // Target JS files
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // 🔥 Gives access to process, __dirname, __filename, etc.
      },
    },
    rules: {
      
      "no-unused-vars": "warn", // Instead of error
      "no-undef": "error", // Keep this strict
    },
  },
]);
