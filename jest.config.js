module.exports = {
  testPathIgnorePatterns: [
    "/.idea/"
  ],
  roots: [
    "<rootDir>/src"
  ],
  transform: {
    "^.+\.tsx?$": "ts-jest"
  },
  setupFiles: [
    "<rootDir>/test-utils/setupTests.ts"
  ],
  preset: "ts-jest",
  moduleFileExtensions: [
    "js",
    "ts",
    "tsx",
    "json"
  ],
  globals: {
    "NODE_ENV": "test"
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test-utils/fileMock.js",
     "\\.(css|less)$": "<rootDir>/test-utils/styleMock.js"
  }
}