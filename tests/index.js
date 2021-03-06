/* global describe, it, beforeEach, afterEach */

import React, { Component, PropTypes } from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { findRenderedDOMComponentWithTag, Simulate } from 'react-addons-test-utils'
import { Route, Router, Link, Redirect, RouteStack, connectHistory } from '../src'
import { createMemoryHistory } from 'history'

import expect from 'expect'
import expectJSX from 'expect-jsx'
expect.extend(expectJSX)


describe('Router', () => {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('will introduce a `history` context', done => {
    class App extends Component {
      static contextTypes = {
        history: PropTypes.object
      }
      componentDidMount() {
        expect(this.context.history).toExist()
        done()
      }
      render() {
        return null
      }
    }

    render(<Router>
      <App />
    </Router>, node)
  })

  it('prop: default history object', () => {
    class App extends Component {
      static contextTypes = {
        history: PropTypes.object
      }
      componentDidMount() {
        this.context.history.listen(l => expect(l.pathname).toEqual(window.location.pathname))()
      }
      render() {
        return null
      }
    }

    render(<Router>
      <App />
    </Router>, node)
  })

  it('prop: custom history object', () => {
    class App extends Component {
      static contextTypes = {
        history: PropTypes.object
      }
      componentDidMount() {
        this.context.history.listen(l => expect(l.pathname).toEqual('/123'))()
      }
      render() {
        return null
      }
    }
    let h = createMemoryHistory('/123')
    render(<Router history={h}>
      <App />
    </Router>, node)

  })

  it('does not render multiple children', () => {
    function App() {
      return <noscript/>
    }

    expect(() => render(<Router>
      <App />
      <App />
      <App />
    </Router>, node)).toThrow()
  })

  it('can override context when nested', () => {
    let h = createMemoryHistory('/')

    class App extends Component {
      static contextTypes = {
        history: PropTypes.object
      }
      render() {
        return <div>
          <Router history={h}><Inner onCtx={ctx => expect(ctx.history).toEqual(h)}/></Router>
          <Inner onCtx={ctx => expect(ctx.history).toEqual(this.context.history)} />
        </div>
      }
    }

    class Inner extends Component {
      static contextTypes = {
        history: PropTypes.object
      }
      componentDidMount() {
        this.props.onCtx(this.context)
      }
      render() {
        return null
      }
    }

    render(<Router>
      <App/>
    </Router>, node)
  })

})

describe('@connectHistory', () => {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('expects context.history', () => {
    @connectHistory
    class X extends Component {
      render() {
        return null
      }
    }

    expect(() => render(<X/>, node)).toThrow()

    node = document.createElement('div')
    unmountComponentAtNode(node)

    expect(() => render(<Router><X/></Router>, node)).toNotThrow()

  })
  it('receives the current location', () => {
    @connectHistory
    class X extends Component {
      render() {
        return <div>{this.props.location.pathname}</div>
      }
    }

    let h = createMemoryHistory('/babbabooey')

    render(<Router history={h}><X/></Router>, node)
    expect(node.innerText).toEqual('/babbabooey')

  })

  it('refreshes when the url changes', () => {
    @connectHistory
    class X extends Component {
      render() {
        return <div>{this.props.location.pathname}</div>
      }
    }

    let h = createMemoryHistory('/babbabooey')

    render(<Router history={h}><X/></Router>, node)
    h.push('/hueylewis')
    expect(node.innerText).toEqual('/hueylewis')
  })

})

describe('Route', () => {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('requires a Router parent / history context', () => {
    expect(() => render(<Route/>, node)).toThrow()
  })

  it('prop: children()', () => {

    render(<Router>
      <Route>{ () => <div>test123</div> }</Route>
    </Router>, node)

    expect(node.innerText).toEqual('test123')
  })

  it('renders with the current url', () => {
    render(<Router history={createMemoryHistory('/babbabooey')}>
      <Route>{ location => <div>{location.pathname}</div> }</Route>
    </Router>, node)

    expect(node.innerText).toEqual('/babbabooey')
  })

  it('prop: path', () => {
    class Inner extends Component {
      render() {
        return <div>{this.props.location.pathname}:{this.props.x}</div>
      }
    }
    render(<Router history={createMemoryHistory('/babba/booey?x=1')}>
      <div>
        {/* renders with current location */}
        <Route>{ location => <div>{location.pathname}</div>}</Route>


        {/* can also pass component / passProps */}
        <Route component={Inner} passProps={{ x: 'whoo' }} />

        {/* non-matching path won't render */}
        <Route path='/hueylewis'>{ () => { throw new Error('won\'t throw') }}</Route>

        {/* express style matching */}
        <Route path='/babba/:huh'>{ location => {
          expect(location.params.huh === 'booey')
          return <div>huhpassed</div>
        }}</Route>

        {/* pass multiple paths as an array  */}
        <Route path={[ '/notmatching/:huh', '/:matching/booey' ]}>{ location => {
          expect(location.params.matching === 'babba')
          return <div>huhpassed</div>
        }}</Route>

        {/* custom notFound render */}
        <Route path='/notmatching' notFound={() => <div>notfound</div>}>{ () => { throw new Error('won\'t render') } }</Route>

        {/* can be nested */}
        <Route path='/babba/:id'>{
          () => {
            return <div>
              <Route path='/babba/booey'>{() => <div>x</div>}</Route>
              <Route path='/babba/gabba'>{() => { throw new Error('won\'t throw') }}</Route>
            </div>
          }
        }</Route>

      </div>
    </Router>, node)

    expect(node.innerText).toEqual('/babba/booey/babba/booey:whoohuhpassedhuhpassednotfoundx')
  })


  it('does not render multiple children', () => {
    expect(() => render(<Router><Route>{() => [ <div/>, <div/> ]}</Route></Router>, node)).toThrow()
  })

  it('prop: onMount onEnter onLeave onUnload')

  it('refreshes when the url changes', () => {
    let h = createMemoryHistory('/x')
    render(<Router history={h}><Route>{l => <div>{l.pathname}</div>}</Route></Router>, node)
    expect(node.innerText).toEqual('/x')
    h.push('/y')
    expect(node.innerText).toEqual('/y')
  })

})

describe('Link', () => {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('requires a Router parent / history context', () => {
    expect(() => render(<Link/>, node)).toThrow()
  })

  it('prop: to', () => {
    let tree = render(<Router>
      <Link to='/x'>go where?</Link>
    </Router>, node)

    expect(findRenderedDOMComponentWithTag(tree, 'a').pathname).toEqual('/x')
  })

  it('prop: onClick className style', done => {
    let h = createMemoryHistory()
    let tree = render(<Router history={h}>
      <Link to='/x' className='some thing here' onClick={e => (e.preventDefault(), done())}>go where?</Link>
    </Router>, node)
    let a = findRenderedDOMComponentWithTag(tree, 'a')
    expect(a.pathname).toEqual('/x')
    expect([ ...a.classList ]).toEqual([ 'some', 'thing', 'here' ])
    Simulate.click(a)

  })


  it('refreshes when the url changes', () => {
    // previous set
  })


})

describe('Redirect', ()=> {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('requires a Router parent / history context', () => {
    expect(() => render(<Redirect/>, node)).toThrow()
  })

  it('prop: to', () => {
    let h = createMemoryHistory('/x')
    render(<Router history={h}>
      <Redirect to={'/y'} />
    </Router>, node)
    h.listen(l => expect(l.pathname).toEqual('/y'))()
  })

})

describe('RouteStack', ()=> {
  let node
  beforeEach(() => node = document.createElement('div'))
  afterEach(() => unmountComponentAtNode(node))

  it('requires a Router parent / history context', () => {
    expect(() => render(<RouteStack/>, node)).toThrow()
  })

  it('only accepts <Route/> elements as children', () => {
    expect(() => render(<Router>
        <RouteStack>
          <div />
          <Route path='/xyz'/>
          <Route />
        </RouteStack>
      </Router>, node)).toThrow()
    // ugh
    node = document.createElement('div')
    unmountComponentAtNode(node)

    render(<Router>
        <RouteStack>
          <Route path='/xyz'/>
          <Route path='/123'/>
          <Route />
        </RouteStack>
      </Router>, node)
  })

  it('only renders the first matching <Route/>', () => {
    let h = createMemoryHistory('/3')
    render(<Router history={h}>
      <RouteStack>
        <Route path='/xyz'>{() => <span> yay again! </span> }</Route>
        <Route path='/3'>{() => <span> yay! </span> }</Route>
        <Route path='/3'>{() => <span> boo :( </span> }</Route>
      </RouteStack>
    </Router>, node)
    expect(node.innerText).toEqual(' yay! ')
    h.push('/xyz')
    expect(node.innerText).toEqual(' yay again! ')
  })

  it('refreshes when the url changes', () => {
    // above set
  })

  it('prop: notFound', () => {
    render(<Router>
      <RouteStack notFound={() => <div>here!</div>}>
        <Route path='/xyz'>{() => <span> yay again! </span> }</Route>
        <Route path='/3'>{() => <span> yay! </span> }</Route>
        <Route path='/3'>{() => <span> boo :( </span> }</Route>
      </RouteStack>
    </Router>, node)
    expect(node.innerText).toEqual('here!')
  })
})

describe('util', () => {
  it('path matching')
})
