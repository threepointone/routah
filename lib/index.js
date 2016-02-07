'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2, _class3, _class4, _temp6, _class5, _class6, _temp8, _class7, _temp9, _class8, _class9, _temp10; // the usual suspects

// express.js path matching

// history utils

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteStack = exports.Redirect = exports.Link = exports.Route = exports.Router = undefined;
exports.connectHistory = connectHistory;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _history = require('history');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isBrowser = typeof window !== 'undefined';

// setup a hidden singleton history object. a good default.
var HISTORY = isBrowser ? (0, _history.useBeforeUnload)(_history.createHistory)() : null;

var has = {}.hasOwnProperty;

// top level component. (optional) pass in a history object.
// <Router history={history}>
//   <App/>
// </Router>
var Router = exports.Router = (_temp2 = _class = function (_Component) {
  _inherits(Router, _Component);

  function Router() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Router);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Router)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.__history__ = isBrowser ? HISTORY : (0, _history.useBeforeUnload)(_history.createMemoryHistory)(_this.props.url), _temp), _possibleConstructorReturn(_this, _ret);
  }
  // default history. on server, this is a new instance with every element

  _createClass(Router, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        history: this.props.history || this.context.history || this.__history__
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return Router;
}(_react.Component), _class.propTypes = {
  history: _react.PropTypes.object,
  url: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object]), // shortcut, only for server side
  children: _react2.default.PropTypes.element.isRequired
}, _class.defaultProps = {
  url: !isBrowser ? '/' : null
}, _class.contextTypes = {
  // discover if we're nested in another <Router/> / some other provider
  history: _react.PropTypes.object
}, _class.childContextTypes = {
  history: _react.PropTypes.object.isRequired
}, _temp2);

// for an array, run fn on every element and break on the first truthy return value

function find(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    var res = fn(arr[i]);
    if (res) {
      return res;
    }
  }
}

// a helper to get the current location from the history object
// (this was way more useful before the refactor)
function currentLocation(h) {
  var loc = undefined;
  h.listen(function (location) {
    return loc = location;
  })();
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
function pathMatch(pattern, path) {
  var end = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  var keys = [],
      params = {},
      _path = undefined,
      regexp = (0, _pathToRegexp2.default)(pattern, keys, { end: end }),
      m = regexp.exec(path);
  if (!m) {
    return false;
  }
  _path = m[0];

  for (var i = 1; i < m.length; i++) {
    var key = keys[i - 1];
    var prop = key.name;
    var val = decodeParam(m[i]);

    if (val !== undefined || !has.call(params, prop)) {
      params[prop] = val;
    }
  }
  return params;
}

// given pattern | [pattern] and a url, tell if pattern matches
function matches(patterns, url) {
  if (!patterns) {
    return true;
  }
  if (!Array.isArray(patterns)) {
    return pathMatch(patterns, url);
  }

  return find(patterns, function (p) {
    return pathMatch(p, url);
  });
}

// decorator for a component to hook up to the history object
// to get location passed to it as a prop every time it changes
// not really a public api, though we export it for testability
function connectHistory(Target) {
  var _class2, _temp4;

  return _temp4 = _class2 = function (_Component2) {
    _inherits(History, _Component2);

    function History() {
      var _Object$getPrototypeO2;

      var _temp3, _this2, _ret2;

      _classCallCheck(this, History);

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _ret2 = (_temp3 = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(History)).call.apply(_Object$getPrototypeO2, [this].concat(args))), _this2), _this2.state = {
        location: currentLocation(_this2.context.history) // start with the initial location
      }, _temp3), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(History, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        if (!this.context.history) {
          throw new Error('did you forget a parent <Router>?');
        }
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this3 = this;

        var started = false;
        this.dispose = this.context.history.listen(function (location) {
          // discard first (sync) response since we already have it
          if (!started) {
            started = true;
            return;
          }
          // sometimes (esp. when nested) - this throws saying its already unmounted
          // must understand what's going on
          _this3.setState({ location: location });
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        // clean up
        this.dispose();
      }
    }, {
      key: 'render',
      value: function render() {
        // add location to originally passed props, and send down
        return _react2.default.createElement(Target, _extends({}, this.props, { location: this.state.location }), this.props.children);
      }
    }]);

    return History;
  }(_react.Component), _class2.displayName = 'history:(' + (Target.displayName || Target.name) + ')', _class2.contextTypes = {
    history: _react.PropTypes.object
  }, _temp4;
}

// The big idea -
// `<Route path={...} .../>` will render only when `path` matches the current browser url
// that's it.
// we introduce some lifecycle hooks and customizability for ease of dev

var Route = exports.Route = connectHistory(_class3 = (_temp6 = _class4 = function (_Component3) {
  _inherits(Route, _Component3);

  function Route() {
    var _Object$getPrototypeO3;

    var _temp5, _this4, _ret3;

    _classCallCheck(this, Route);

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _ret3 = (_temp5 = (_this4 = _possibleConstructorReturn(this, (_Object$getPrototypeO3 = Object.getPrototypeOf(Route)).call.apply(_Object$getPrototypeO3, [this].concat(args))), _this4), _this4.state = _this4.compute(_this4.props.location, _this4.props.path), _temp5), _possibleConstructorReturn(_this4, _ret3);
  }

  // start with initial data

  _createClass(Route, [{
    key: 'compute',

    // return an enhanced location object
    value: function compute(location, path) {
      var doesMatch = true,
          match = undefined;
      if (path) {
        // pull out params etc
        match = matches(path, this.context.history.createPath(location.pathname));
        doesMatch = !!match;
      }

      return {
        location: _extends({}, location, {
          params: match || {}
        }),
        matches: doesMatch
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this5 = this;

      var h = this.context.history;

      // hooks

      // onMount
      if (matches(this.props.path, h.createPath(this.state.location.pathname))) {
        this.props.onMount(this.state.location);
      }

      // onEnter / onLeave
      this.disposeBefore = h.listenBefore(function (location, callback) {
        var matchesCurrent = matches(_this5.props.path, h.createPath(_this5.state.location.pathname));
        var matchesNext = matches(_this5.props.path, h.createPath(location.pathname));
        if (!matchesCurrent && matchesNext) {
          return _this5.props.onEnter(location, callback);
        }
        if (matchesCurrent && !matchesNext) {
          return _this5.props.onLeave(location, callback);
        }

        return callback();
      });

      // onUnload
      if (this.props.onUnload && !h.listenBeforeUnload) {
        throw new Error('you have an unload listener, but haven\'t wrapped your history object with useBeforeUnload');
      }

      if (h.listenBeforeUnload) {
        this.disposeUnload = h.listenBeforeUnload(function () {
          if (_this5.props.onUnload && matches(_this5.props.path, h.createPath(_this5.state.location.pathname))) {
            return _this5.props.onUnload(_this5.state.location);
          }
        });
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(next) {
      // refresh on new location / path
      this.setState(this.compute(next.location, next.path));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // cleanup
      this.disposeBefore();
      if (this.disposeUnload) {
        this.disposeUnload();
      }
    }
  }, {
    key: 'render',
    value: function render() {

      var el = undefined;

      if (this.state.matches) {
        if (this.props.component) {
          // components / props flavor
          el = _react2.default.createElement(this.props.component, _extends({}, this.props.passProps, { location: this.state.location }));
        } else {
          // render callback
          el = this.props.children(this.state.location);
        }
      }

      return el || this.props.notFound(this.state.location);
    }
  }]);

  return Route;
}(_react.Component), _class4.propTypes = {
  // path | [path], where path follows [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
  path: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
  // a render callback
  children: _react.PropTypes.func,
  // an alternative to the render callback
  component: _react.PropTypes.func,
  passProps: _react.PropTypes.object,

  // hooks
  onMount: _react.PropTypes.func,
  onEnter: _react.PropTypes.func,
  onLeave: _react.PropTypes.func,
  onUnload: _react.PropTypes.func,

  // render when nothing matches
  notFound: _react.PropTypes.func
}, _class4.defaultProps = {
  notFound: function notFound() {
    return null;
  },
  passProps: {},
  children: function children() {},
  onMount: function onMount() {},
  onEnter: function onEnter(l, cb) {
    return cb();
  },
  onLeave: function onLeave(l, cb) {
    return cb();
  }
}, _class4.contextTypes = {
  history: _react.PropTypes.object
}, _temp6)) || _class3;

// a useful replacement for <a> elements.
// includes clickjacking

var Link = exports.Link = connectHistory(_class5 = (_temp8 = _class6 = function (_Component4) {
  _inherits(Link, _Component4);

  function Link() {
    var _Object$getPrototypeO4;

    var _temp7, _this6, _ret4;

    _classCallCheck(this, Link);

    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return _ret4 = (_temp7 = (_this6 = _possibleConstructorReturn(this, (_Object$getPrototypeO4 = Object.getPrototypeOf(Link)).call.apply(_Object$getPrototypeO4, [this].concat(args))), _this6), _this6.onClick = function (e) {
      _this6.props.onClick(e);
      if (!_this6.props._target) {
        e.preventDefault();
        _this6.context.history.push(_this6.props.to);
      }
    }, _temp7), _possibleConstructorReturn(_this6, _ret4);
  }

  _createClass(Link, [{
    key: 'render',
    value: function render() {
      var h = this.context.history;
      var href = h.createHref(this.props.to);

      return _react2.default.createElement(
        'a',
        _extends({
          href: href
        }, this.props, {
          className: this.props.className,
          style: this.props.style,
          onClick: this.onClick }),
        this.props.children
      );
    }
  }]);

  return Link;
}(_react.Component), _class6.contextTypes = {
  history: _react.PropTypes.object
}, _class6.propTypes = {
  // a location descriptor, via rackt/history
  to: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object]),
  onClick: _react.PropTypes.func,
  className: _react.PropTypes.string,
  style: _react.PropTypes.object
}, _class6.defaultProps = {
  onClick: function onClick() {},
  className: '',
  style: {}
}, _temp8)) || _class5;

// `<Redirect to={...}/>` simply triggers `history.push()` when rendered
// todo - handle server side redirect

var Redirect = exports.Redirect = (_temp9 = _class7 = function (_Component5) {
  _inherits(Redirect, _Component5);

  function Redirect() {
    _classCallCheck(this, Redirect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Redirect).apply(this, arguments));
  }

  _createClass(Redirect, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      // calling it here ensures it'll be 'called' on server side as well
      this.context.history.push(this.props.to);
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return Redirect;
}(_react.Component), _class7.contextTypes = {
  history: _react.PropTypes.object
}, _temp9);

// a la react-router, only the first-matching `<Route/>` child is rendered.

var RouteStack = exports.RouteStack = connectHistory(_class8 = (_temp10 = _class9 = function (_Component6) {
  _inherits(RouteStack, _Component6);

  function RouteStack() {
    _classCallCheck(this, RouteStack);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(RouteStack).apply(this, arguments));
  }

  _createClass(RouteStack, [{
    key: 'render',
    value: function render() {
      var url = this.context.history.createPath(this.props.location.pathname);
      return find(_react.Children.toArray(this.props.children), function (c) {
        if (c.type !== Route) {
          throw new Error('<RouteStack> only accepts <Route/> elements as children');
        }
        return matches(c.props.path, url) ? c : false;
      }) || this.props.notFound(this.props.location);
    }
  }]);

  return RouteStack;
}(_react.Component), _class9.contextTypes = {
  history: _react.PropTypes.object
}, _class9.propTypes = {
  notFound: _react.PropTypes.func,
  children: function children(props) {
    // ensure children are only <Route/>s
    return find(_react.Children.toArray(props.children), function (c) {
      return c.type !== Route;
    }) ? new Error('<RouteStack/> only accepts <Route/>s as children.') : null;
  }
}, _class9.defaultProps = {
  notFound: function notFound() {
    return null;
  }
}, _temp10)) || _class8;