module.exports = {
  "root": true,
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "parserOptions": {
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "globals": {
    "Class": true,
    "$Keys": true,
    "$Exact": true,
    "$Diff": true,
    "$Rest": true,
    "$Shape": true,
    "$PropertyType": true,
    "SyntheticInputEvent": true,
    "SyntheticKeyboardEvent": true,
    "SyntheticMouseEvent": true,
    "SyntheticEvent": true,
    "React": true,
    "jest": true,
    "expect": true,
    "test": true,
    "fail": true,
    "beforeAll": true,
    "afterAll": true,
    "beforeEach": true,
    "afterEach": true,
    "describe": true,
    "TimeoutID": true,
    "IntervalID": true
  },
  "plugins": ["react"],
  "rules": {
    "no-var": "warn",
    "no-console": "warn",
    "no-param-reassign": "warn",
    "react/no-unused-state": "error",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    // "react/no-typos": "error",
    "react/prop-types": "off"
  }
}
