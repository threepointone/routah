// the usual suspects
import React, {Component, Children, PropTypes} from 'react';

// express.js path matching
import pathToRegexp from 'path-to-regexp';

// history utils
import {createHistory, createMemoryHistory, useBeforeUnload} from 'history';

const isBrowser = typeof window !== 'undefined';

// setup a hidden singleton history object. a good default.
const HISTORY = isBrowser ? useBeforeUnload(createHistory)() : null;

const has = {}.hasOwnProperty;

// top level component. (optional) pass in a history object.
// <Router history={history}>
//   <App/>
// </Router>
export class Router extends Component{
  static propTypes = {
    history: PropTypes.object,
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),  // shortcut, only for server side
    children: React.PropTypes.element.isRequired,
  };

  static defaultProps = {
    url: !isBrowser ? '/' : null
  };

  static contextTypes = {
    // discover if we're nested in another <Router/> / some other provider
    history: PropTypes.object
  };

  static childContextTypes = {
    history: PropTypes.object.isRequired
  };
  // default history. on server, this is a new instance with every element
  __history__ = isBrowser ? HISTORY : useBeforeUnload(createMemoryHistory)(this.props.url);

  getChildContext(){
    return {
      history:
        this.props.history ||
        this.context.history ||
        this.__history__
    };
  }

  render(){
    return Children.only(this.props.children);
  }
}


// for an array, run fn on every element and break on the first truthy return value
function find(arr, fn){
  for (let i = 0; i < arr.length; i++){
    let res = fn(arr[i]);
    if (res){
      return res;
    }
  }
}


// a helper to get the current location from the history object
// (this was way more useful before the refactor)
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
function pathMatch(pattern, path, end = true){
  let keys = [], params = {}, _path,
    regexp = pathToRegexp(pattern, keys, {end}), m = regexp.exec(path);
  if (!m){
    return false;
  }
  _path = m[0];

  for (let i = 1; i < m.length; i++) {
    let key = keys[i - 1];
    let prop = key.name;
    let val = decodeParam(m[i]);

    if (val !== undefined || !params::has(prop)) {
      params[prop] = val;
    }
  }
  return params;
}


// given pattern | [pattern] and a url, tell if pattern matches
function matches(patterns, url){
  if (!patterns){
    return true;
  }
  if (!Array.isArray(patterns)){
    return pathMatch(patterns, url);
  }

  return find(patterns, p => pathMatch(p, url));
}


// decorator for a component to hook up to the history object
// to get location passed to it as a prop every time it changes
// not really a public api, though we export it for testability
export function connectHistory(Target){
  return class History extends Component{
    static displayName = 'history:(' + (Target.displayName || Target.name) + ')';

    static contextTypes = {
      history: PropTypes.object
    };

    state = {
      location: currentLocation(this.context.history)  // start with the initial location
    };

    componentWillMount(){
      if (!this.context.history){
        throw new Error('did you forget a parent <Router>?');
      }
    }

    componentDidMount(){
      let started = false;
      this.dispose = this.context.history.listen(location => {
        // discard first (sync) response since we already have it
        if (!started){
          started = true;
          return;
        }
        // sometimes (esp. when nested) - this throws saying its already unmounted
        // must understand what's going on
        this.setState({location});
      });
    }

    componentWillUnmount(){
      // clean up
      this.dispose();
    }

    render(){
      // add location to originally passed props, and send down
      return React.createElement(Target, {...this.props, location: this.state.location}, this.props.children);
    }
  };
}


// The big idea -
// `<Route path={...} .../>` will render only when `path` matches the current browser url
// that's it.
// we introduce some lifecycle hooks and customizability for ease of dev
@connectHistory
export class Route extends Component{
  static propTypes = {
    // path | [path], where path follows [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
    path: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    // a render callback
    children: PropTypes.func,
    // an alternative to the render callback
    component: PropTypes.func,
    passProps: PropTypes.object,

    // hooks
    onMount: PropTypes.func,
    onEnter: PropTypes.func,
    onLeave: PropTypes.func,
    onUnload: PropTypes.func,

    // render when nothing matches
    notFound: PropTypes.func
  };

  static defaultProps = {
    notFound: () => null,
    passProps: {},
    children: () => {},
    onMount: () => {},
    onEnter: (l, cb) => cb(),
    onLeave: (l, cb) => cb()
  };

  static contextTypes = {
    history: PropTypes.object
  };

  // start with initial data
  state = this.compute(this.props.location, this.props.path);

  // return an enhanced location object
  compute (location, path){
    let doesMatch = true, match;
    if (path){
      // pull out params etc
      match = matches(path, this.context.history.createPath(location.pathname));
      doesMatch = !!match;
    }

    return {
      location: {
        ...location,
        params: match || {}
      },
      matches: doesMatch
    };
  }

  componentDidMount(){
    let h = this.context.history;

    // hooks

    // onMount
    if (matches(this.props.path,  h.createPath(this.state.location.pathname))){
      this.props.onMount(this.state.location);
    }

    // onEnter / onLeave
    this.disposeBefore = h.listenBefore((location, callback) => {
      let matchesCurrent = matches(this.props.path,  h.createPath(this.state.location.pathname));
      let matchesNext = matches(this.props.path,  h.createPath(location.pathname));
      if (!matchesCurrent && matchesNext){
        return this.props.onEnter(location, callback);
      }
      if (matchesCurrent && !matchesNext){
        return this.props.onLeave(location, callback);
      }

      return callback();
    });

    // onUnload
    if (this.props.onUnload && !h.listenBeforeUnload){
      throw new Error('you have an unload listener, but haven\'t wrapped your history object with useBeforeUnload');
    }

    if (h.listenBeforeUnload){
      this.disposeUnload = h.listenBeforeUnload(() => {
        if (this.props.onUnload && matches(this.props.path,  h.createPath(this.state.location.pathname))){
          return this.props.onUnload(this.state.location);
        }
      });
    }
  }

  componentWillReceiveProps(next){
    // refresh on new location / path
    this.setState(this.compute(next.location, next.path));
  }

  componentWillUnmount(){
    // cleanup
    this.disposeBefore();
    if (this.disposeUnload){
      this.disposeUnload();
    }
  }

  render(){

    let el;

    if (this.state.matches){
      if (this.props.component){
        // components / props flavor
        el = React.createElement(this.props.component, {...this.props.passProps, location: this.state.location});
      }
      else {
        // render callback
        el = this.props.children(this.state.location);
      }
    }

    return el || this.props.notFound(this.state.location);
  }
}


// a useful replacement for <a> elements.
// includes clickjacking
@connectHistory
export class Link extends Component{
  static contextTypes = {
    history: PropTypes.object
  };

  static propTypes = {
    // a location descriptor, via rackt/history
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onClick: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
  };

  static defaultProps = {
    onClick: () => {},
    className: '',
    style: {},
  };

  onClick = e => {
    this.props.onClick(e);
    if (!this.props._target){
      e.preventDefault();
      this.context.history.push(this.props.to);
    }
  };

  render(){
    let h = this.context.history;
    let href = h.createHref(this.props.to);

    return <a
      href={href}
      {...this.props}
      className={this.props.className}
      style={this.props.style}
      onClick={this.onClick}>
      {this.props.children}
    </a>;
  }

}


// `<Redirect to={...}/>` simply triggers `history.push()` when rendered
// todo - handle server side redirect
export class Redirect extends Component{
  static contextTypes = {
    history: PropTypes.object
  };

  componentWillMount(){
    // calling it here ensures it'll be 'called' on server side as well
    this.context.history.push(this.props.to);
  }

  render(){
    return null;
  }
}


// a la react-router, only the first-matching `<Route/>` child is rendered.
@connectHistory
export class RouteStack extends Component{
  static contextTypes = {
    history: PropTypes.object
  };

  static propTypes = {
    notFound: PropTypes.func,
    children(props) {
      // ensure children are only <Route/>s
      return find(Children.toArray(props.children), c => c.type !== Route) ?
        new Error('<RouteStack/> only accepts <Route/>s as children.') :
        null;
    }
  };

  static defaultProps = {
    notFound: () => null
  };

  render(){
    let url = this.context.history.createPath(this.props.location.pathname);
    return find(Children.toArray(this.props.children), c => {
      if (c.type !== Route){
        throw new Error('<RouteStack> only accepts <Route/> elements as children');
      }
      return matches(c.props.path, url) ? c : false;
    }) || this.props.notFound(this.props.location);
  }
}

