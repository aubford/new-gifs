import * as React from "react"
import "../server/server"
import App from "../client/app"
import { TestRunner } from "../../test-utils/test-api"

let testRunner

describe("integration test", () => {
  beforeAll(() => {
    testRunner = new TestRunner(<App/>)
  })

  test("render", () => {
    testRunner.verifyRender(".scoreContainer", ".winOrLose", ".title")
  })

  test("players", () => {
    expect(testRunner.comp.state().players.length).toBeGreaterThan(1)
  })
})


