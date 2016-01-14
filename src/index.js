import React, {Component, PropTypes} from 'react';
import Matcher from 'route-parser';

export class Router extends Component{
  state = {
    location: null
  };
  static propTypes = {
    history: PropTypes.object.isRequired
  };
  static childContextTypes = {
    routah: PropTypes.object
  };
  getChildContext(){
    return {
      routah: {
        history: this.props.history
      }
    }
  }
  render(){
    return this.props.children;
  }
}



function matches(patterns, url){
  console.log(patterns);
  if(!Array.isArray(patterns)){
    patterns = [patterns];
  }

  for(let pattern of patterns){
    var matcher = new Matcher(pattern);
    if(matcher.match(url)){
      return true;
    }
  }
  return false;
}

export class Route extends Component{
  static propTypes = {
    match: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    notFound: PropTypes.func
  };
  static defaultProps = {
    notFound: () => <noscript/>
  };
  static contextTypes = {
    routah: PropTypes.object
  };
  componentWillMount(){
    this.dispose = this.context.routah.history.listen(location => {
      this.setState({
        location,
        matches: this.props.match ? matches(this.props.match, this.context.routah.history.createHref(location)) : true
      })
    });
  }
  render(){
    return this.state.matches ?
      this.props.children(this.state.location) :
      this.props.notFound(this.state.location);
  }
  componentWillUnmount(){
    this.dispose();
    delete this.dispose();
  }
}


export class Link extends Component{
  static contextTypes = {
    routah: PropTypes.object
  };

  onClick = e => {
    e.preventDefault();
    this.context.routah.history.push(this.props.to);
  };
  render(){
    return <a href={this.context.routah.history.createHref(this.props.to)} {...this.props} onClick={this.onClick}>
      {this.props.children}
    </a>;
  }
}
