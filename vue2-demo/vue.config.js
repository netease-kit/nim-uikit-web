const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const fs = require("fs");

// module.exports = defineConfig({
//   transpileDependencies: true,
// });

// const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

// function reactVirtualized() {
//   return {
//     name: "my:react-virtualized",
//     configResolved() {
//       const file = require
//         .resolve("react-virtualized")
//         .replace(
//           path.join("dist", "commonjs", "index.js"),
//           path.join("dist", "es", "WindowScroller", "utils", "onScroll.js")
//         );
//       const code = fs.readFileSync(file, "utf-8");
//       const modified = code.replace(WRONG_CODE, "");
//       fs.writeFileSync(file, modified);
//     },
//   };
// }

module.exports = defineConfig({
  transpileDependencies: true,
  // configureWebpack: {
  //   plugins: [reactVirtualized],
  // },
});
