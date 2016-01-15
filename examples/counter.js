import React, {Component} from 'react';
import {render} from 'react-dom';
import {Router, Route, Link} from '../src';

const active = {
  border: '1px solid red'
};

class Counter extends Component{
  state = {
    count: 0
  };
  onClick = () => {
    this.setState({
      count: this.state.count + 1
    });
  };
  render(){
    return <div>

                    <ul>
        <li><Link activeStyle={active} to='/1'>1</Link></li>
        <li><Link activeStyle={active} to='/2'>2</Link></li>
        <li><Link activeStyle={active} to='/3'>3</Link></li>
      </ul>

      </div>;

  }
}

render(<Router><Counter/></Router>, document.getElementById('app'));
