import React, {Component, PropTypes} from 'react';
import Matcher from 'route-parser';

// a helper to get the current location from the history object
function currentLocation(h){
  let loc;
  h.listen(location => loc = location)();
  return loc;
}

// pattern matching for urls
function matches(patterns, url){
  if (!Array.isArray(patterns)){
    patterns = [patterns];
  }

  for (let pattern of patterns){
    var matcher = new Matcher(pattern);
    let res = matcher.match(url);
    if (res){
      return res;
    }
  }
  return false;
}


// top level component. pass in a history object.
// <Router history={history}>
//   <App/>
// </Router>
// todo - use a default history singleton in browser
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
    };
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
    props: PropTypes.object,
    onLeave: PropTypes.func,
    onEnter: PropTypes.func
  };
  static defaultProps = {
    notFound: () => <noscript/>,
    props: {},
    onMount: () => {},
    onEnter: (l, cb) => cb(),
    onLeave: (l, cb) => cb(),
    onUnload: () => {}
  };
  static contextTypes = {
    routah: PropTypes.object
  };
  refresh = location => {
    let doesMatch = true, match;
    if (this.props.path){
      match = matches(this.props.path, this.context.routah.history.createHref(location));
      doesMatch = !!match;
    }

    this.setState({
      location: {
        ...location,
        params: match || {}
      },
      matches: doesMatch
    });
  };
  componentWillMount(){
    let h = this.context.routah.history;
    this.dispose = this.context.routah.history.listen(this.refresh);

    if (!this.props.path || matches(this.props.path,  h.createHref(currentLocation(h)))){
      this.props.onMount(currentLocation(h));
    }

    this.disposeBefore = this.context.routah.history.listenBefore((location, callback) => {
      if (!this.props.path || matches(this.props.path,  h.createHref(location))){
        return this.props.onEnter(location, callback);
      }
      else {
        return this.props.onLeave(location, callback);
      }
    });

    this.disposeUnload = this.context.routah.history.listenBeforeUnload(() => {
      if (!this.props.path || matches(this.props.path,  h.createHref(currentLocation(h)))){
        return this.props.onUnload(currentLocation(h));
      }
    });

  }
  componentWillReceiveProps(next){
    if (next.path !== this.props.path){
      this.refresh(currentLocation(this.context.routah.history));
    }
  }
  render(){
    let {location} = this.state;
    if (this.state.matches){
      if (this.props.component){
        return React.createElement(this.props.component, {location, ...this.props.props});
      }
      return this.props.children(location);
    }
    return this.props.notFound(location);
  }
  componentWillUnmount(){
    this.dispose();
    this.disposeBefore();
    this.disposeUnload();
    delete this.dispose;
    delete this.disposeBefore;
    delete this.disposeUnload;
  }
}


export class Link extends Component{
  static contextTypes = {
    routah: PropTypes.object
  };
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onClick: PropTypes.func,
    className: PropTypes.string,
    activeClass: PropTypes.string,
    activeStyle: PropTypes.object
  };

  static defaultProps = {
    onClick: () => {},
    className: '',
    activeClass: '',
    style: {},
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
    return <noscript/>;
  }
}
