import * as React from 'react'
import '../server/server'
import App from '../client/app'
import { mount } from "enzyme"

// window.location.search = '123'
const generateApp = () => mount(<App />)

test('test', () => {
  const app = generateApp()
  console.log("app", app.state())
  expect(app).toBeTruthy()
})
