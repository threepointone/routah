/* global describe, it */
import React, {Component, PropTypes} from 'react';
import {Router, Route} from '../src';
import {renderToString, renderToStaticMarkup} from 'react-dom/server';
import {createMemoryHistory} from 'history';

import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('server side routah', () => {
  it('prop: history', done => {
    class App extends Component{
      static contextTypes = {
        history: PropTypes.object
      };
      componentWillMount(){
        this.context.history.listen(l => expect(l.pathname).toEqual('/xyz'))();
        done();
      }
      render(){
        return null;
      }
    }

    renderToString(<Router history={createMemoryHistory('/xyz')}><App/></Router>);
  });
  it('prop: url', done => {
    class App extends Component{
      static contextTypes = {
        history: PropTypes.object
      };
      componentWillMount(){
        this.context.history.listen(l => expect(l.pathname).toEqual('/xyz'))();
        done();
      }
      render(){
        return null;
      }
    }

    renderToString(<Router url='/xyz'><App/></Router>);

  });
  it('should render to string/markup');
  it('should catch redirects');


});
