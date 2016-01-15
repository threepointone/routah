/* global describe, it */
import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import expect from 'expect';
import expectJSX from 'expect-jsx';

import {Route, Router, Link, Redirect, RouteStack} from '../src';

expect.extend(expectJSX);

describe('Router', ()=> {
  it('will introduce a routah context', done => {
    let el = <Router>{() => <Route/>}</Router>;
    console.log(el.props.children);
    expect(el).toEqualJSX(<Route/>);
  });
});
describe('Route', ()=> {});
describe('Link', ()=> {});
describe('Redirect', ()=> {});
describe('RouteStack', ()=> {});
