import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import {Router, Link, Route} from '../src';
import {createHistory} from 'history';

function log(...args){
  console.log(...args, this);
  return this;
}

let h = createHistory();

class App extends Component{
  render(){
    return <Router history={h}>
      <User/>
    </Router>;
  }
  componentWillUnMount(){
    this.disponse();
  }
}

class User extends Component{
  render(){
    return <Route>{
      location => {
        let dest1 = Math.round(Math.random()*1000);
        return <div>
          you're at {location.pathname} <br/>
          <Route match='/secret'>{
            () => <div>matched!</div>
          }</Route>
          <Link to={`/${dest1}`}>/{dest1}</Link> <br/>
          or else <span onClick={() => h.push(`/secret`)}>secret</span>
        </div>;
      }
    }</Route>;
  }
}


render(<App/>, document.getElementById('app'));
