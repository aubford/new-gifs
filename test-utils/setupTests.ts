// import "jsdom-global/register";
import {GlobalWithFetchMock} from "jest-fetch-mock"
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

Enzyme.configure({ adapter: new Adapter() })

// eslint-disable-next-line
console.logg = console.warn