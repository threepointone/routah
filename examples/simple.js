// active links
// breadcrumbs
// passing props to children
// query params
// sidebar
import React, {Component} from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, RouteStack, Redirect} from '../src';


class App extends Component{
  render(){
    return <div>
      <ul>
        <li><Link to='/about'>about</Link></li>
        <li><Link to='/inbox'>inbox</Link></li>
        <li><Link to='/'>home</Link></li>
      </ul>
      <div>
        <Route path='/about'>{
          () => <div>about us</div>
        }</Route>
        <Route path='/inbox'>{
          () => <div>about us</div>
        }</Route>
        <Route path='/dashboard'>{
          () => <div>dashboard</div>
        }</Route>
        <Route path='/'>{
          () => <Redirect to='/dashboard' />
        }</Route>;
      </div>
    </div>;
  }
}

export default <Router><App/></Router>;
