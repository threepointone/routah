/* global describe, it, beforeEach, afterEach */

import React, {Component, PropTypes} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import {Route, Router, Link, Redirect, RouteStack} from '../src';
import {createMemoryHistory} from 'history';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);


// a helper to get the current location from the history object
function currentLocation(h){
  let loc;
  h.listen(location => loc = location)();
  return loc;
}



describe('Router', () => {
  let node;
  beforeEach(() => node = document.createElement('div'));
  afterEach(() => unmountComponentAtNode(node));

  it('will introduce a `routah` context', done => {
    class App extends Component{
      static contextTypes = {
        routah: PropTypes.object
      };
      componentDidMount(){
        expect(this.context.routah).toExist();
        expect(this.context.routah.history).toExist();
        done();
      }
      render(){
        return null;
      }
    }
    render(<Router><App /></Router>, node);
  });

  it('prop: default history object', done => {
    class App extends Component{
      static contextTypes = {
        routah: PropTypes.object
      };
      componentDidMount(){
        expect(currentLocation(this.context.routah.history).pathname).toEqual(window.location.pathname);
        done();
      }
      render(){
        return null;
      }
    }
    render(<Router><App /></Router>, node);
  });

  it('prop: custom history object', done => {
    class App extends Component{
      static contextTypes = {
        routah: PropTypes.object
      };
      componentDidMount(){
        expect(currentLocation(this.context.routah.history).pathname).toEqual('/123');
        done();
      }
      render(){
        return null;
      }
    }
    let h = createMemoryHistory('/123');
    render(<Router history={h}><App /></Router>, node);

  });

  it('does not render multiple children', () => {
    function App(){
      return <noscript/>;
    }

    expect(() => render(<Router><App /><App /><App /></Router>, node)).toThrow();
  });

  it('can override context when nested', () => {
    let h = createMemoryHistory('/');
    class App extends Component{
      static contextTypes = {
        routah: PropTypes.object
      };
      render(){
        return <div>
          <Router history={h}><Inner onCtx={ctx => expect(ctx.routah.history).toEqual(h)}/></Router>
          <Inner onCtx={ctx => expect(ctx.routah.history).toEqual(this.context.routah.history)} />
        </div>;
      }
    }
    class Inner extends Component{
      static contextTypes = {
        routah: PropTypes.object
      };
      componentDidMount(){
        this.props.onCtx(this.context);
      }
      render(){
        return null;
      }
    }

    render(<Router><App/></Router>, node);
  });

});

describe('Route', () => {
  it('prop: children()');

  it('renders with the current url');

  it('prop: path');

  it('renders only when the path matches');

  it('accepts multiple paths');

  it('accepts a component/props combo');

  it('accepts a render callback');

  it('prop: onMount onEnter onLeave onUnload');

  it('props: nout found');

  it('refreshes when the url changes');

  it('it can be nested');

  it('cleans up after itself');

});

describe('Link', () => {
  it('prop: to');

  it('prop: onClick className style');

  it('prop: activeStyle activeClass');

  it('refreshes when the url changes');

  it('cleans up after itself');

});

describe('Redirect', ()=> {
  it('prop: to');

});

describe('RouteStack', ()=> {
  it('prop: children');

  it('prop: notFound');
});

describe('util', () => {
  it('path matching');
});
