import React, {Component, Children, PropTypes} from 'react';

// express.js` path matching
import pathToRegexp from 'path-to-regexp';

import {createHistory, createMemoryHistory, useBeforeUnload} from 'history';

// setup a hidden singleton history object. a good default.
const isBrowser = typeof window !== 'undefined';
if (isBrowser){
  window.__routah_history__ = window.__routah_history__ || useBeforeUnload(createHistory)();
}

const has = {}.hasOwnProperty;

function find(arr, fn){
  for (let el of arr){
    let res = fn(el);
    if (res){
      return res;
    }
  }
}


// a helper to get the current location from the history object
function currentLocation(h){
  let loc;
  h.listen(location => loc = location)();
  return loc;
}

function decodeParam(val) {
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
    var val = decodeParam(m[i]);

    if (val !== undefined || !(params::has(prop))) {
      params[prop] = val;
    }
  }
  return params;

}


function matches(patterns, url){
  if (!patterns){
    return true;
  }
  if (!Array.isArray(patterns)){
    return pathMatch(patterns, url);
  }

  return find(patterns, p => pathMatch(p, url));
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
    history: PropTypes.object,
    url: PropTypes.string,  // only for server side
    children: React.PropTypes.element.isRequired,
  };
  static defaultProps = {
    url: '/'
  };
  static contextTypes = {
    // discover if we're nested in abother <Router/>
    routah: PropTypes.object
  };
  static childContextTypes = {
    routah: PropTypes.object.isRequired
  };
  __routah_history__ = isBrowser ? global.__routah_history__ : useBeforeUnload(createMemoryHistory)(this.props.url);
  getChildContext(){

    return {
      routah: {
        history: (this.props::has('history') ? this.props.history : null) || (this.context.routah || {}).history || this.__routah_history__
      }
    };
  }
  render(){
    return Children.only(this.props.children);
  }
}


// The big idea -
// `<Route path={...} .../>` will render only when `path` matches the current browser url
// that's it.
// we introduce some lifecycle hooks and customizability for ease of dev
export class Route extends Component{
  static propTypes = {
    path: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    component: PropTypes.func,
    notFound: PropTypes.func,
    passProps: PropTypes.object,
    onMount: PropTypes.func,
    onEnter: PropTypes.func,
    onLeave: PropTypes.func,
    onUnload: PropTypes.func,
    children: PropTypes.func
  };
  static defaultProps = {
    notFound: () => null,
    passProps: {},
    children: () => {},
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
    this.dispose = this.context.routah.history.listen(this.refresh);

  }
  componentDidMount(){
    let h = this.context.routah.history;
    if (matches(this.props.path,  h.createHref(currentLocation(h)))){
      this.props.onMount(currentLocation(h));
    }

    this.disposeBefore = this.context.routah.history.listenBefore((location, callback) => {
      let matchesCurrent = matches(this.props.path,  h.createHref(currentLocation(h)));
      let matchesNext = matches(this.props.path,  h.createHref(location));
      if (!matchesCurrent && matchesNext){
        return this.props.onEnter(location, callback);
      }
      if (matchesCurrent && !matchesNext){
        return this.props.onLeave(location, callback);
      }

      return callback();
    });

    this.disposeUnload = this.context.routah.history.listenBeforeUnload(() => {
      if (matches(this.props.path,  h.createHref(currentLocation(h)))){
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
    let el;
    if (this.state.matches){
      if (this.props.component){
        // components / props flavor
        el = React.createElement(this.props.component, {location, history, ...this.props.passProps});
      }
      else {
        // render callback
        el = this.props.children(location, history);
      }
    }

    return el || this.props.notFound(location);
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


// a useful replacement for <a> elements.
// includes clickjacking, and custom styling when 'active',
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
    activeClass: 'active',
    style: {},
    activeStyle: {}
  };

  state = {
    location: '/'
  };

  onClick = e => {
    e.preventDefault();
    this.props.onClick(e);
    this.context.routah.history.push(this.props.to);
  };
  componentWillMount(){
    this.dispose = this.context.routah.history.listen(location =>this.setState({location}));
  }

  render(){
    let h = this.context.routah.history;
    let active = h.createHref(this.props.to) === h.createHref(this.state.location);

    return <a
      href={h.createHref(this.props.to)}
      {...this.props}
      className={`${this.props.className} ${active ? this.props.activeClass : ''}`.trim()}
      style={{...this.props.style, ...(active ? this.props.activeStyle : {})}}
      onClick={this.onClick}>
      {this.props.children}
    </a>;
  }
  componentWillMount(){
    this.dispose = this.context.routah.history.listen(location =>this.setState({location}));
  }
  componentWillUnmount(){
    this.dispose();
    delete this.dispose;
  }
}


// `<Redirect to={...}/>` simply triggers `history.push()` when rendered
// todo - handle server side redirect
export class Redirect extends Component{

  static contextTypes = {
    routah: PropTypes.object
  };
  componentDidMount(){
    this.context.routah.history.push(this.props.to);
  }
  render(){
    return null;
  }
}


// a la react-router, only the first-matching `<Route/>` child is rendered.
export class RouteStack extends Component{
  static contextTypes = {
    routah: PropTypes.object
  };

  static propTypes = {
    notFound: PropTypes.func,
    children(props) {
      return find(Children.toArray(props.children), c => c.type !== Route) ?
        new Error('<RouteStack/> only accepts <Route/>s as children.') :
        null;
    }
  };
  static defaultProps = {
    notFound: () => null
  };
  componentWillMount(){
    this.dispose = this.context.routah.history.listen(location => this.setState({location}));
  }
  componentWillUnmount(){
    this.dispose();
    delete this.dispose;
  }
  render(){
    let url = this.context.routah.history.createHref(this.state.location);
    return find(Children.toArray(this.props.children), c => {
      if (c.type !== Route){
        throw new Error('<RouteStack> only accepts <Route/> elements as children');
      }
      return matches(c.props.path, url) ? c : false;
    }) || this.props.notFound();
  }
}

