// @flow
import { shallow, mount, render } from 'enzyme'

///// PUBLIC HELPER FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////////////
export const mockBrowserHistory = {
  push: jest.fn(() => {}),
  replace: jest.fn(() => {}),
  goBack: jest.fn(() => {}),
  length: 5
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveRendered: any,
      toBeTrueOrWrite: any
    }
  }
}

expect.extend({
  toHaveRendered(comp, selectors) {
    const problemSelectors = selectors.filter(selector => {
      const missing = comp.find(selector).length === 0
      return this.isNot ? !missing : missing
    })

    const selectorsList = this.utils.printExpected(selectors.join(', '))
    const problemSelectorsList = this.utils.printReceived(
      problemSelectors.join(', ')
    )

    if (
      this.isNot ? problemSelectors.length !== 0 : problemSelectors.length === 0
    ) {
      return {
        message: () =>
          `Expected no components matching selectors: \n  ${selectorsList} \n to have been rendered but you rendered \n  ${problemSelectorsList}`,
        pass: true
      }
    } else {
      return {
        message: () =>
          `Expected components matching selectors \n  ${selectorsList} \n to have been rendered but you're missing \n  ${problemSelectorsList}`,
        pass: false
      }
    }
  },
  toBeTrueOrWrite(received, message) {
    return received
      ? { pass: true, message: () => '' }
      : { pass: false, message: () => this.utils.printReceived(message) }
  }
})

export function hocTestRunner(
  component,
  mount,
  storeAsContext
) {
  const comp = shallow(component)
  const childElement = comp.get(0)
  return new TestRunner(childElement, mount)
}

////  TEST RUNNER CLASS ////////////////////////////////////////////////////////////////////////////////////////////////


export class TestRunner {
  comp
  isMount
  constructor(
    component,
    isMount?: boolean
  ) {
    this.isMount = isMount
    this.comp = isMount
      ? mount(component)
      : shallow(component)
  }
  print(selector?: string) {
    const node = selector ? this.grab(selector) : this.comp
    if (node) {
      const debug = node.debug()
      console.warn(
        '***RENDERED*COMPONENT****',
        debug,
        '***RENDERED*COMPONENT*****'
      )
      return debug
    } else {
      console.warn('***** Unable to find node to print ******')
    }
  }
  getText(selector?: string) {
    const node = selector
      ? render(this.grab(selector))
      : render(this.comp)
    return node.text()
  }
  find(selector: string) {
    return this.comp.find(selector)
  }
  grab(selector: string) {
    const findArray = this.comp.find(selector)
    const componentFound = findArray.length > 0
    expect(componentFound).toBeTrueOrWrite(
      `unable to grab component with selector: ${selector}`
    )
    return findArray.first()
  }
  verifyRender(selectors: Array<string> | string) {
    const normalizedSelectors =
      typeof selectors === 'string' ? [selectors] : selectors
    expect(this.comp).toHaveRendered(normalizedSelectors)
  }
  verifyAbsence(selectors: Array<string> | string) {
    const normalizedSelectors =
      typeof selectors === 'string' ? [selectors] : selectors
    expect(this.comp).not.toHaveRendered(normalizedSelectors)
    return this.comp
  }
  getProps(selector?: string) {
    if (selector) {
      return this.grab(selector).props()
    }
    return this.isMount ? this.comp.props() : this.comp.instance().props
  }
  verifyPropsContain(props: Object, selector?: string) {
    if (selector) {
      expect(this.grab(selector).props()).toEqual(
        expect.objectContaining(props)
      )
    } else {
      expect(this.comp.props()).toEqual(expect.objectContaining(props))
    }
  }
  verifyStateContains(state: Object, selector?: string) {
    if (selector) {
      const selected = this.grab(selector)
      const selectedState = selected ? selected.state() : null
      expect(selectedState).toEqual(expect.objectContaining(state))
    } else {
      expect(this.comp.state()).toEqual(expect.objectContaining(state))
    }
  }
  getState(selector?: string) {
    if (selector) {
      const child = this.spawn(selector).comp
      try {
        return child.state()
      }
      catch(e){
        console.error(e)
        return {}
      }
    }
    return this.comp.state()
  }
  performTouchTaps(
    selectors,
    finalState,
    spies
  ) {
    const normalizedSelectors =
      typeof selectors === 'string' ? [selectors] : selectors
    normalizedSelectors.forEach(selector => {
      const selected = this.grab(selector)

      if (selected) {
        selected.simulate('click')
        this.comp.update()
      }
    })

    if (finalState) {
      this.verifyStateContains(finalState)
    }
    if (spies) {
      spies.forEach(spy => {
        expect(spy).toHaveBeenCalled()
      })
    }
  }
  performEvents(
    selectors: Array<string> | string,
    event: string & { type: string, returns: any },
    finalState?: Object,
    spies?: Array<Function>
  ) {
    const normalizedSelectors =
      typeof selectors === 'string' ? [selectors] : selectors
    normalizedSelectors.forEach(selector => {
      const selected = this.grab(selector)
      if (selected) {
        selected.simulate(
          event.type || event,
          event.returns || {
            preventDefault: () => {}
          }
        )
        this.comp.update()
      }
    })

    if (finalState) {
      expect(expect.objectContaining(finalState)).toEqual(this.comp.state())
    }

    if (spies) {
      spies.forEach(spy => {
        expect(spy).toHaveBeenCalled()
      })
    }
  }
  snapshot() {
    expect(this.comp).toMatchSnapshot()
  }
  update() {
    this.comp.update()
  }
  spawn(selector?: string, shouldMount?: boolean): TestRunner {
    const grabbed = selector ? this.grab(selector) : this.comp
    return new TestRunner(grabbed.get(0), shouldMount)
  }
  done() {
    jest.clearAllMocks()
    this.comp.unmount()
  }
}
