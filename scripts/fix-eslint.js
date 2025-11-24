const { existsSync, rmSync } = require("fs");
const path = require("path");

const nestedNodeModules = path.join(
  __dirname,
  "..",
  "node_modules",
  "eslint",
  "node_modules"
);

if (existsSync(nestedNodeModules)) {
  rmSync(nestedNodeModules, { recursive: true, force: true });
  console.log(
    "[postinstall] Removed nested node_modules inside eslint to let it resolve hoisted @eslint/eslintrc."
  );
}

