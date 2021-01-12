import { TransformOptions } from "@babel/core";
import { Target, BabelConfigs } from "../../../types";

/**
 * Targets object for passing configurations to a target.
 */
interface Targets {
  /**
   * The module configuration.
   */
  module: {
    /**
     * The esmodules flag.
     */
    esmodules: boolean;
  };

  /**
   * ES5 configuration object.
   */
  es5: {
    /**
     * The browsers list.
     */
    browsers: Array<string>;
  };

  /**
   * Server configuration.
   */
  server: {
    /**
     * Node version for the server.
     */
    node: string;
  };
}

const targets: Targets = {
  // Browsers with <script type="module"></script> support. This is the list:
  // "edge": "16",
  // "firefox": "60",
  // "chrome": "61",
  // "safari": "10.1",
  // "opera": "48",
  // "ios_saf": "10.3",
  // "and_ff": "60"
  module: { esmodules: true },
  // Browsers with Proxy support, which is needed by Overmind.
  // For older browsers (ie8-11) we support AMP fallback.
  es5: {
    browsers: [
      "and_chr >= 67",
      "and_ff >= 18",
      "and_uc >= 11.8",
      "android >= 67",
      "not android <= 4.4.4",
      "chrome >= 49",
      "edge >= 12",
      "firefox >= 18",
      "ios_saf >= 10",
      "not op_mini all",
      "op_mob >= 46",
      "opera >= 36",
      "safari >= 10",
      "samsung >= 5",
    ],
  },
  // Node version used by AWS Lambda.
  server: { node: "8.10" },
};

export default (): BabelConfigs => {
  /**
   * Function to generate the babel config based on a target.
   *
   * @param target - The target name.
   * @returns Returns the babel transformation.
   */
  const getConfig = (target: Target): TransformOptions => {
    const presets = [
      // Instead of using a TS transpiler, this removes the typescript code.
      "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          targets: targets[target],
          useBuiltIns: target === "es5" && "entry",
          corejs: target === "es5" && "3",
          modules: false,
        },
      ],
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
      // Babel plugin for Emotion CSS property and other goodness.
      "@emotion/babel-preset-css-prop",
    ];
    const plugins = [
      //
      "babel-plugin-frontity",
      // Support for babel macros. See: https://community.frontity.org/t/tailwindcss-with-babel-macro-plugin-and-css-in-js/1040
      "babel-plugin-macros",
      // Support for dynamic imports: import("./my-file").
      "@babel/plugin-syntax-dynamic-import",
      // Needed for loadable-component SSR..
      "@loadable/babel-plugin",
      // Support for the rest spread: { ...obj }.
      "@babel/plugin-proposal-object-rest-spread",
      // Support for the class props: class MyClass { myProp = 'hi there' }.
      "@babel/plugin-proposal-class-properties",
      // Cherry-pick Lodash modules.
      "babel-plugin-lodash",
      // Transform inline environment variables (for process.env.CWD).
      [
        "babel-plugin-transform-inline-environment-variables",
        {
          include: ["CWD"],
        },
      ],
    ];
    return {
      compact: true,
      presets,
      plugins,
    };
  };

  return {
    module: getConfig("module"),
    es5: getConfig("es5"),
    server: getConfig("server"),
  };
};
