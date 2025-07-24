module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    // Indentation
    indent: ["error", 2],

    // Line endings
    "linebreak-style": ["error", "unix"],

    // Quotes
    quotes: ["error", "single"],
    "jsx-quotes": ["error", "prefer-double"],

    // Semicolons
    semi: ["error", "always"],

    // Trailing commas
    "comma-dangle": ["error", "always-multiline"],

    // Object spacing
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],

    // Function spacing
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],

    // Arrow function spacing
    "arrow-spacing": ["error", { before: true, after: true }],

    // Template literals
    "template-curly-spacing": ["error", "never"],

    // No console in production
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",

    // No unused variables
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

    // No var
    "no-var": "error",
    "prefer-const": "error",

    // Max line length
    "max-len": ["error", { code: 100, ignoreUrls: true }],

    // Import rules
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
      },
    ],
    "import/no-unresolved": "off",
    "import/extensions": "off",

    // Express specific rules
    "no-underscore-dangle": ["error", { allow: ["_id"] }],

    // Async/await
    "prefer-promise-reject-errors": "off",

    // Class methods
    "class-methods-use-this": "off",

    // Object destructuring
    "prefer-destructuring": [
      "error",
      {
        array: false,
        object: true,
      },
    ],

    // Function complexity
    complexity: ["warn", 10],

    // Max parameters
    "max-params": ["error", 4],

    // No magic numbers
    "no-magic-numbers": [
      "warn",
      {
        ignore: [-1, 0, 1, 2, 10, 100],
        ignoreArrayIndexes: true,
        detectObjects: false,
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.test.js", "**/*.spec.js"],
      env: {
        jest: true,
      },
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["scripts/**/*.js"],
      rules: {
        "no-console": "off",
      },
    },
  ],
};
