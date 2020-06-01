import babel from "rollup-plugin-babel";
import autoExternal from "rollup-plugin-auto-external";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const INPUT_NAME = "index.mjs";
const OUTPUT_NAME = "publish_subscribe";
const UMD_NAME = "PublishSubscribe";

export default {
  input: `./src/${INPUT_NAME}`,
  output: [
    {
      file: `./dist/${OUTPUT_NAME}.cjs`,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: `./dist/${OUTPUT_NAME}.mjs`,
      format: "es",
      sourcemap: true,
    },
    {
      file: `./dist/${OUTPUT_NAME}.js`,
      format: "umd",
      name: UMD_NAME,
      sourcemap: true,
    },
    {
      file: `./dist/${OUTPUT_NAME}.min.js`,
      format: "umd",
      name: UMD_NAME,

      sourcemap: true,
    },
  ],
  plugins: [
    babel({ babelrc: true }),
    autoExternal(),
    resolve.nodeResolve(),
    commonjs(),
    terser({
      keep_classnames: true,
      keep_fnames: true,
      output: {
        comments: false,
      },
      warnings: true,
    }),
  ],
};
