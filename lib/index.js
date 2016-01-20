'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteStack = exports.Redirect = exports.Link = exports.Route = exports.Router = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _history = require('history');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// express.js` path matching

// setup a hidden singleton history object. a good default.
var isBrowser = typeof window !== 'undefined';
if (isBrowser) {
  window.__routah_history__ = window.__routah_history__ || (0, _history.useBeforeUnload)(_history.createHistory)();
}

var has = {}.hasOwnProperty;

function find(arr, fn) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var el = _step.value;

      var res = fn(el);
      if (res) {
        return res;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

// a helper to get the current location from the history object
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
  var keys = [],
      params = {},
      _path = undefined,
      regexp = (0, _pathToRegexp2.default)(pattern, keys),
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

// top level component. pass in a history object.
// <Router history={history}>
//   <App/>
// </Router>
// todo - use a default history singleton in browser

var Router = exports.Router = function (_Component) {
  _inherits(Router, _Component);

  function Router() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Router);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Router)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
      location: null
    }, _this.__routah_history__ = isBrowser ? global.__routah_history__ : (0, _history.useBeforeUnload)(_history.createMemoryHistory)(_this.props.url), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Router, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _context;

      return {
        routah: {
          history: ((_context = this.props, has).call(_context, 'history') ? this.props.history : null) || (this.context.routah || {}).history || this.__routah_history__
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return Router;
}(_react.Component);

// The big idea -
// `<Route path={...} .../>` will render only when `path` matches the current browser url
// that's it.
// we introduce some lifecycle hooks and customizability for ease of dev

Router.propTypes = {
  history: _react.PropTypes.object,
  url: _react.PropTypes.string, // only for server side
  children: _react2.default.PropTypes.element.isRequired
};
Router.defaultProps = {
  url: '/'
};
Router.contextTypes = {
  // discover if we're nested in abother <Router/>
  routah: _react.PropTypes.object
};
Router.childContextTypes = {
  routah: _react.PropTypes.object.isRequired
};

var Route = exports.Route = function (_Component2) {
  _inherits(Route, _Component2);

  function Route() {
    var _Object$getPrototypeO2;

    var _temp2, _this2, _ret2;

    _classCallCheck(this, Route);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(Route)).call.apply(_Object$getPrototypeO2, [this].concat(args))), _this2), _this2.refresh = function () {
      var location = arguments.length <= 0 || arguments[0] === undefined ? _this2.state.location : arguments[0];
      var props = arguments.length <= 1 || arguments[1] === undefined ? _this2.props : arguments[1];

      var doesMatch = true,
          match = undefined;
      if (props.path) {
        match = matches(props.path, _this2.context.routah.history.createHref(location));
        doesMatch = !!match;
      }

      _this2.setState({
        location: _extends({}, location, {
          params: match || {}
        }),
        matches: doesMatch
      });
    }, _temp2), _possibleConstructorReturn(_this2, _ret2);
  }

  _createClass(Route, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.refresh(currentLocation(this.context.routah.history));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var h = this.context.routah.history;
      var started = false;
      this.dispose = h.listen(function (location) {
        // discard first response
        if (!started) {
          started = true;
          return;
        }
        _this3.refresh(location);
      });

      if (matches(this.props.path, h.createHref(this.state.location))) {
        this.props.onMount(this.state.location);
      }

      this.disposeBefore = h.listenBefore(function (location, callback) {
        var matchesCurrent = matches(_this3.props.path, h.createHref(_this3.state.location));
        var matchesNext = matches(_this3.props.path, h.createHref(location));
        if (!matchesCurrent && matchesNext) {
          return _this3.props.onEnter(location, callback);
        }
        if (matchesCurrent && !matchesNext) {
          return _this3.props.onLeave(location, callback);
        }

        return callback();
      });

      if (this.props.onUnload && !h.listenBeforeUnload) {
        throw new Error('you have an unload listener, but haven\'t wrapped your history object with useBeforeUnload');
      }

      if (h.listenBeforeUnload) {
        this.disposeUnload = h.listenBeforeUnload(function () {
          if (matches(_this3.props.path, h.createHref(_this3.state.location))) {
            return _this3.props.onUnload(_this3.state.location);
          }
        });
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(next) {
      if (next.path !== this.props.path) {
        // todo - fire onenter/onleave hooks here too?
        this.refresh(undefined, next);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var location = this.state.location;
      var history = this.context.routah.history;

      var el = undefined;
      if (this.state.matches) {
        if (this.props.component) {
          // components / props flavor
          el = _react2.default.createElement(this.props.component, _extends({ location: location, history: history }, this.props.passProps));
        } else {
          // render callback
          el = this.props.children(location, history);
        }
      }

      return el || this.props.notFound(location);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.dispose();
      this.disposeBefore();
      delete this.dispose;
      delete this.disposeBefore;
      if (this.disposeUnload) {
        this.disposeUnload();
        delete this.disposeUnload;
      }
    }
  }]);

  return Route;
}(_react.Component);

// a useful replacement for <a> elements.
// includes clickjacking, and custom styling when 'active',

Route.propTypes = {
  path: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
  component: _react.PropTypes.func,
  notFound: _react.PropTypes.func,
  passProps: _react.PropTypes.object,
  onMount: _react.PropTypes.func,
  onEnter: _react.PropTypes.func,
  onLeave: _react.PropTypes.func,
  onUnload: _react.PropTypes.func,
  children: _react.PropTypes.func
};
Route.defaultProps = {
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
};
Route.contextTypes = {
  routah: _react.PropTypes.object
};

var Link = exports.Link = function (_Component3) {
  _inherits(Link, _Component3);

  function Link() {
    var _Object$getPrototypeO3;

    var _temp3, _this4, _ret3;

    _classCallCheck(this, Link);

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _ret3 = (_temp3 = (_this4 = _possibleConstructorReturn(this, (_Object$getPrototypeO3 = Object.getPrototypeOf(Link)).call.apply(_Object$getPrototypeO3, [this].concat(args))), _this4), _this4.state = {
      location: '/'
    }, _this4.onClick = function (e) {
      e.preventDefault();
      _this4.props.onClick(e);
      _this4.context.routah.history.push(_this4.props.to);
    }, _temp3), _possibleConstructorReturn(_this4, _ret3);
  }

  _createClass(Link, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        location: currentLocation(this.context.routah.history)
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this5 = this;

      var started = false;
      this.dispose = this.context.routah.history.listen(function (location) {
        // discard first response
        if (!started) {
          started = true;
          return;
        }
        _this5.setState({ location: location });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var h = this.context.routah.history;
      var active = h.createHref(this.props.to) === h.createHref(this.state.location);

      return _react2.default.createElement(
        'a',
        _extends({
          href: h.createHref(this.props.to)
        }, this.props, {
          className: (this.props.className + ' ' + (active ? this.props.activeClass : '')).trim(),
          style: _extends({}, this.props.style, active ? this.props.activeStyle : {}),
          onClick: this.onClick }),
        this.props.children
      );
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.dispose();
      delete this.dispose;
    }
  }]);

  return Link;
}(_react.Component);

// `<Redirect to={...}/>` simply triggers `history.push()` when rendered
// todo - handle server side redirect

Link.contextTypes = {
  routah: _react.PropTypes.object
};
Link.propTypes = {
  to: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object]),
  onClick: _react.PropTypes.func,
  className: _react.PropTypes.string,
  style: _react.PropTypes.object,
  activeClass: _react.PropTypes.string,
  activeStyle: _react.PropTypes.object
};
Link.defaultProps = {
  onClick: function onClick() {},
  className: '',
  activeClass: 'active',
  style: {},
  activeStyle: {}
};

var Redirect = exports.Redirect = function (_Component4) {
  _inherits(Redirect, _Component4);

  function Redirect() {
    _classCallCheck(this, Redirect);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Redirect).apply(this, arguments));
  }

  _createClass(Redirect, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.context.routah.history.push(this.props.to);
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return Redirect;
}(_react.Component);

// a la react-router, only the first-matching `<Route/>` child is rendered.

Redirect.contextTypes = {
  routah: _react.PropTypes.object
};

var RouteStack = exports.RouteStack = function (_Component5) {
  _inherits(RouteStack, _Component5);

  function RouteStack() {
    _classCallCheck(this, RouteStack);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(RouteStack).apply(this, arguments));
  }

  _createClass(RouteStack, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        location: currentLocation(this.context.routah.history)
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this8 = this;

      var started = false;
      this.dispose = this.context.routah.history.listen(function (location) {
        // discard first response
        if (!started) {
          started = true;
          return;
        }
        _this8.setState({ location: location });
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.dispose();
      delete this.dispose;
    }
  }, {
    key: 'render',
    value: function render() {
      var url = this.context.routah.history.createHref(this.state.location);
      return find(_react.Children.toArray(this.props.children), function (c) {
        if (c.type !== Route) {
          throw new Error('<RouteStack> only accepts <Route/> elements as children');
        }
        return matches(c.props.path, url) ? c : false;
      }) || this.props.notFound(this.state.location);
    }
  }]);

  return RouteStack;
}(_react.Component);

RouteStack.contextTypes = {
  routah: _react.PropTypes.object
};
RouteStack.propTypes = {
  notFound: _react.PropTypes.func,
  children: function children(props) {
    return find(_react.Children.toArray(props.children), function (c) {
      return c.type !== Route;
    }) ? new Error('<RouteStack/> only accepts <Route/>s as children.') : null;
  }
};
RouteStack.defaultProps = {
  notFound: function notFound() {
    return null;
  }
};