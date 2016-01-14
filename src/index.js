import React, {Component, PropTypes} from 'react';
import Matcher from 'route-parser';

function currentLocation(h){
  let loc;
  h.listen(location => loc = location)();
  return loc;
}

function matches(patterns, url){
  if(!Array.isArray(patterns)){
    patterns = [patterns];
  }

  for(let pattern of patterns){
    var matcher = new Matcher(pattern);
    let res = matcher.match(url)
    if(res){
      return res;
    }
  }
  return false;
}


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



export class Route extends Component{
  static propTypes = {
    match: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    component: PropTypes.func,
    notFound: PropTypes.func,
    props: PropTypes.object
  };
  static defaultProps = {
    notFound: () => <noscript/>,
    props: {}
  };
  static contextTypes = {
    routah: PropTypes.object
  };
  componentWillMount(){
    this.dispose = this.context.routah.history.listen(location => {
      let doesMatch = true, match;
      if(this.props.path){
        match = matches(this.props.path, this.context.routah.history.createHref(location));
        doesMatch = !!match;
      }

      this.setState({
        location: {
          ...location,
          params: match || {}
        },
        matches: doesMatch
      })
    });
  }
  render(){
    let {location} = this.state;
    if(this.state.matches){
      if(this.props.component){
        return React.createElement(this.props.component, {location, ...this.props.props});
      }
      return this.props.children(location);
    }
    return this.props.notFound(location);
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
  static propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    activeClass: PropTypes.string,
    activeStyle: PropTypes.object
  };

  static defaultProps = {
    onClick: () => {},
    className: '',
    activeClass: '',
    activeStyle: {}
  };

  onClick = e => {
    e.preventDefault();
    this.props.onClick(e);
    this.context.routah.history.push(this.props.to);
  };
  render(){
    let h = this.context.routah.history;
    let active = h.createHref(this.props.to) === h.createHref(currentLocation(h));
    return <a
      href={this.context.routah.history.createHref(this.props.to)}
      {...this.props}
      className={`${this.props.className} ${active ? this.props.activeClass : ''}`}
      style={{...this.props.style, ...(active ? this.props.activeStyle : {})}}
      onClick={this.onClick}>
      {this.props.children}
    </a>;
  }
}

// todo - handle server side redirect
export class Redirect extends Component{

  static contextTypes = {
    routah: PropTypes.object
  };
  componentDidMount(){
    this.context.routah.history.push(this.props.to);
  }
  render(){
    return <noscript/>
  }
}
