import * as React from 'react'
import '../server/server'
import App from '../client/app'
import { TestRunner } from "../../test-utils/test-api"

let testRunner
beforeAll(() => {
  testRunner = new TestRunner(<App/>)
})

test('test', () => {
  testRunner.verifyRender('.scoreContainer', '.winOrLose', '.title')
})
