import * as React    from 'react'
import * as ReactDOM from 'react-dom'
import './main.css'
import App      from './app'

// @ts-ignore
console.logg = (name, value) => console.log(
  '%c *** ' + name,
  'color: orange; font-weight: bold; font-size: 18px',
  value
)

ReactDOM.render(<App />, document.getElementById('root'))