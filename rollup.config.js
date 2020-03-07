import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import autoExternal from "rollup-plugin-auto-external";

const INPUT_NAME = "index.mjs";
const OUTPUT_NAME = "publish_subscribe";
const UMD_NAME = "PublishSubscribe";

export default {
  input: `./src/${INPUT_NAME}`,
  output: [
    {
      file: `./dist/${OUTPUT_NAME}.cjs`,
      format: "cjs",
      plugins: [autoExternal(), resolve(), commonjs()]
    },
    {
      file: `./dist/${OUTPUT_NAME}.mjs`,
      format: "es",
      plugins: [autoExternal(), resolve(), commonjs()]
    },
    {
      file: `./dist/${OUTPUT_NAME}.js`,
      format: "umd",
      name: UMD_NAME,
      plugins: [autoExternal(), resolve(), commonjs()],
      sourcemap: false,
    },
    {
      file: `./dist/${OUTPUT_NAME}.min.js`,
      format: "umd",
      name: UMD_NAME,
      plugins: [
        autoExternal(),
        resolve(),
        commonjs(),
        terser({
          sourcemap: true,
          warnings: true,
          keep_classnames: true,
          keep_fnames: true
        })
      ],
      sourcemap: true
    }
  ]
};
