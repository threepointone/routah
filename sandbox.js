import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import {Router, Link, Route, Redirect} from './src';


class App extends Component{
  static contextTypes = {
    routah: PropTypes.object
  };
  render(){
    console.log(this.context);
    return <Route onEnter={(l, cb) => console.log('enter', l.pathname) || cb() } onLeave={(l, cb) => console.log('leave', l.pathname) || cb()}>{
      location => {
        let dest1 = Math.round(Math.random() * 1000);
        return <div>
          you're at {location.pathname} <br/>
          <Route path={location.pathname}>{
            loc => <span>inside</span>
          }</Route>
          <Route path='/secret' onEnter={(l, cb) => console.log('enter', l.pathname) || cb() } onLeave={(l, cb) => console.log('leave', l.pathname) || cb()} onUnload={() => 'are you sure'}>{
            () => <div>matched!</div>
          }</Route>
          <Link to={`/${dest1}`}>/{dest1}</Link> <br/>
          or else <span onClick={() => console.log(this, 'this') || this.context.routah.history.push(`/secret`)}>secret</span> <br/>
          and here's a <Link to='/secret' activeStyle={{border: '1px solid red'}}>secret link</Link>
        </div>;
      }
    }</Route>;
  }
}


render(<Router><App/></Router>, document.getElementById('app'));
