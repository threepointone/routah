import React, { Component, PropTypes } from 'react'
import { Route, Router } from '../lib'

function times(n, fn) {
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(fn(i))
  }
  return arr
}

let ctr = 0

class App extends Component {
  static contextTypes = {
    history: PropTypes.object
  }
  componentDidMount() {
    setInterval(() => {
      this.context.history.push('/' + ctr)
      ctr++
    }, 10)
  }
  render() {
    return <table>
      <tbody>
        {times(20, i =>
          <tr>
          {times(20, j =>
            <td>
            <Route>{loc =>
              <span>{i}:{j}:{loc.pathname}</span>
            }</Route>
            </td>)}
          </tr>)}
      </tbody>
    </table>
  }
}


export default <Router><App/></Router>
