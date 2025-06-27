export default {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // Keep viewBox for responsiveness
          removeViewBox: false,
          // Keep useful attributes
          removeUnknownsAndDefaults: {
            keepDataAttrs: false,
            keepAriaAttrs: true,
            keepRoleAttr: true,
          },
          // Clean up IDs but keep necessary ones
          cleanupIds: {
            minify: true,
            preserve: ["linearGradient", "radialGradient", "pattern"],
          },
          // Optimize paths
          convertPathData: {
            floatPrecision: 2,
            transformPrecision: 5,
          },
          // Sort attributes for consistency
          sortAttrs: true,
          // Merge paths when possible
          mergePaths: true,
          // Convert colors to shorter format when possible
          convertColors: {
            currentColor: false,
            names2hex: true,
            rgb2hex: true,
            shorthex: true,
            shortname: true,
          },
        },
      },
    },
    // Remove metadata
    "removeMetadata",
    // Remove comments
    "removeComments",
    // Remove editor namespace and elements
    "removeEditorsNSData",
    // Remove off-canvas paths (separate plugin)
    "removeOffCanvasPaths",
    // Optimize numeric values
    {
      name: "cleanupNumericValues",
      params: {
        floatPrecision: 2,
      },
    },
  ],
};
