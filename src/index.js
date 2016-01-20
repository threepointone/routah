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

// decorator for a component to hook up to the history object
// to get location passed to it as a prop every time it changes
// not really a public api, though we should probably export it for testability
function connectHistory(Target){
  return class History extends Component{
    static displayName = 'Ó:' + Target.displayName;
    static contextTypes = {
      routah: PropTypes.object
    };
    state = {
      location: currentLocation(this.context.routah.history)
    };
    componentDidMount(){
      let started = false;
      this.dispose = this.context.routah.history.listen(location => {
        // discard first response
        if (!started){
          started = true;
          return;
        }
        this.setState({location});
      });
    }
    componentWillUnmount(){
      this.dispose();
      delete this.dispose;
    }
    render(){
      return React.createElement(Target, {...this.props, location: this.state.location}, this.props.children);
    }
  };
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

    if (val !== undefined || !params::has(prop)) {
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
        history:
          (this.props::has('history') ? this.props.history : null) ||
          (this.context.routah || {}).history
          || this.__routah_history__
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
@connectHistory
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
    onLeave: (l, cb) => cb()
  };
  static contextTypes = {
    routah: PropTypes.object
  };
  state = {
    location: this.props.location
  };
  refresh = (location = this.state.location, path = this.props.path) => {
    let doesMatch = true, match;
    if (path){
      match = matches(path, this.context.routah.history.createHref(location));
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
    this.refresh();
  }
  componentDidMount(){
    let h = this.context.routah.history;

    if (matches(this.props.path,  h.createHref(this.state.location))){
      this.props.onMount(this.state.location);
    }

    this.disposeBefore = h.listenBefore((location, callback) => {
      let matchesCurrent = matches(this.props.path,  h.createHref(this.state.location));
      let matchesNext = matches(this.props.path,  h.createHref(location));
      if (!matchesCurrent && matchesNext){
        return this.props.onEnter(location, callback);
      }
      if (matchesCurrent && !matchesNext){
        return this.props.onLeave(location, callback);
      }

      return callback();
    });

    if (this.props.onUnload && !h.listenBeforeUnload){
      throw new Error('you have an unload listener, but haven\'t wrapped your history object with useBeforeUnload');
    }

    if (h.listenBeforeUnload){
      this.disposeUnload = h.listenBeforeUnload(() => {
        if (matches(this.props.path,  h.createHref(this.state.location))){
          return this.props.onUnload(this.state.location);
        }
      });
    }
  }
  componentWillReceiveProps(next){
    this.refresh(next.location, next.path);
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
    this.disposeBefore();
    delete this.disposeBefore;
    if (this.disposeUnload){
      this.disposeUnload();
      delete this.disposeUnload;
    }
  }
}


// a useful replacement for <a> elements.
// includes clickjacking, and custom styling when 'active',
@connectHistory
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


  onClick = e => {
    e.preventDefault();
    this.props.onClick(e);
    this.context.routah.history.push(this.props.to);
  };
  render(){
    let h = this.context.routah.history;
    let activeHref = h.createHref(this.props.to);
    let active = activeHref === h.createHref(this.props.location);

    return <a
      href={h.createHref(this.props.to)}
      {...this.props}
      className={`${this.props.className} ${active ? this.props.activeClass : ''}`.trim()}
      style={{...this.props.style, ...active ? this.props.activeStyle : {}}}
      onClick={this.onClick}>
      {this.props.children}
    </a>;
  }

}


// `<Redirect to={...}/>` simply triggers `history.push()` when rendered
// todo - handle server side redirect
export class Redirect extends Component{
  static contextTypes = {
    routah: PropTypes.object
  };
  componentWillMount(){
    this.context.routah.history.push(this.props.to);
  }
  render(){
    return null;
  }
}


// a la react-router, only the first-matching `<Route/>` child is rendered.
@connectHistory
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
  render(){
    let url = this.context.routah.history.createHref(this.props.location);
    return find(Children.toArray(this.props.children), c => {
      if (c.type !== Route){
        throw new Error('<RouteStack> only accepts <Route/> elements as children');
      }
      return matches(c.props.path, url) ? c : false;
    }) || this.props.notFound(this.props.location);
  }
}

