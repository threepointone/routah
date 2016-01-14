import React, {Component, PropTypes} from 'react';
import {createHistory, useBeforeUnload} from 'history';

if (typeof window !== 'undefined'){
  window.__routah_history__ = window.__routah_history__ || useBeforeUnload(createHistory)();
}

// import Matcher from 'route-parser';
import pathToRegexp from 'path-to-regexp';

const has = {}.hasOwnProperty;

// a helper to get the current location from the history object
function currentLocation(h){
  let loc;
  h.listen(location => loc = location)();
  return loc;
}

function decode_param(val) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = 'Failed to decode param \'' + val + '\'';
      err.status = err.statusCode = 400;
    }

    throw err;
  }
}



// pattern matching for urls
function pathMatch(pattern, path){
  let keys = [], params = {}, _path,
    regexp = pathToRegexp(pattern, keys), m = regexp.exec(path);
  if (!m){
    return false;
  }
  _path = m[0];

  for (var i = 1; i < m.length; i++) {
    var key = keys[i - 1];
    var prop = key.name;
    var val = decode_param(m[i]);

    if (val !== undefined || !(params::has(prop))) {
      params[prop] = val;
    }
  }
  return params;

}
function matches(patterns, url){
  if (!Array.isArray(patterns)){
    patterns = [patterns];
  }

  for (let pattern of patterns){
    let res = pathMatch(pattern, url);
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
    history: PropTypes.object
  };
  static childContextTypes = {
    routah: PropTypes.object.isRequired
  };
  getChildContext(){
    return {
      routah: {
        history: this.props.history || global.__routah_history__
      }
    };
  }
  render(){
    return this.props.children;
  }
}



export class Route extends Component{
  static propTypes = {
    path: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    component: PropTypes.func,
    notFound: PropTypes.func,
    props: PropTypes.object,
    onMount: PropTypes.func,
    onLeave: PropTypes.func,
    onEnter: PropTypes.func,
    onUnload: PropTypes.func
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
  refresh = (location = currentLocation(this.context.routah.history), props = this.props) => {
    let doesMatch = true, match;
    if (props.path){
      match = matches(props.path, this.context.routah.history.createHref(location));
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
      let matchesCurrent = !this.props.path || matches(this.props.path,  h.createHref(currentLocation(h)));
      let matchesNext = !this.props.path || matches(this.props.path,  h.createHref(location));
      if (!matchesCurrent && matchesNext){
        return this.props.onEnter(location, callback);
      }
      if (matchesCurrent && !matchesNext){
        return this.props.onLeave(location, callback);
      }

      return callback();
    });

    this.disposeUnload = this.context.routah.history.listenBeforeUnload(() => {
      if (!this.props.path || matches(this.props.path,  h.createHref(currentLocation(h)))){
        return this.props.onUnload(currentLocation(h));
      }
    });

  }
  componentWillReceiveProps(next){
    if (next.path !== this.props.path){
      // todo - fire onenter/onleave hooks here too?
      this.refresh(undefined, next);
    }
  }
  render(){
    let {location} = this.state;
    let {history} = this.context.routah;
    if (this.state.matches){
      if (this.props.component){
        return React.createElement(this.props.component, {location, history, ...this.props.props});
      }
      return this.props.children(location, history);
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
    style: PropTypes.object,
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
