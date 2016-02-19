import React, { Component } from 'react'
import { renderToString } from 'react-dom/server'
import { Router, Route, Link } from '../src'

class App extends Component {
  render() {
    return <div>
      <Route path='/foo'>{
        () => <div>foo</div>
      }</Route>
      <Route path='/bar' component={Bar}/>
    </div>
  }
}

function Bar() {
  return <div>bar</div>
}

console.log(renderToString(<Router url='/bar'><App/></Router>))
