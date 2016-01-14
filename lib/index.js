'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Redirect = exports.Link = exports.Route = exports.Router = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _history = require('history');

var _routeParser = require('route-parser');

var _routeParser2 = _interopRequireDefault(_routeParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (typeof window !== 'undefined') {
  window.__routah_history__ = window.__routah_history__ || (0, _history.useBeforeUnload)(_history.createHistory)();
}

// a helper to get the current location from the history object
function currentLocation(h) {
  var loc = undefined;
  h.listen(function (location) {
    return loc = location;
  })();
  return loc;
}

// pattern matching for urls
function matches(patterns, url) {
  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = patterns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pattern = _step.value;

      var matcher = new _routeParser2.default(pattern);
      var res = matcher.match(url);
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

  return false;
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
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Router, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        routah: {
          history: this.props.history || global.__routah_history__
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);

  return Router;
}(_react.Component);

Router.propTypes = {
  history: _react.PropTypes.object
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

    return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(Route)).call.apply(_Object$getPrototypeO2, [this].concat(args))), _this2), _this2.refresh = function (location) {
      var doesMatch = true,
          match = undefined;
      if (_this2.props.path) {
        match = matches(_this2.props.path, _this2.context.routah.history.createHref(location));
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
      var _this3 = this;

      var h = this.context.routah.history;
      this.dispose = this.context.routah.history.listen(this.refresh);

      if (!this.props.path || matches(this.props.path, h.createHref(currentLocation(h)))) {
        this.props.onMount(currentLocation(h));
      }

      this.disposeBefore = this.context.routah.history.listenBefore(function (location, callback) {
        var matchesCurrent = !_this3.props.path || matches(_this3.props.path, h.createHref(currentLocation(h)));
        var matchesNext = !_this3.props.path || matches(_this3.props.path, h.createHref(location));
        if (!matchesCurrent && matchesNext) {
          return _this3.props.onEnter(location, callback);
        }
        if (matchesCurrent && !matchesNext) {
          return _this3.props.onLeave(location, callback);
        }

        return callback();
      });

      this.disposeUnload = this.context.routah.history.listenBeforeUnload(function () {
        if (!_this3.props.path || matches(_this3.props.path, h.createHref(currentLocation(h)))) {
          return _this3.props.onUnload(currentLocation(h));
        }
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(next) {
      if (next.path !== this.props.path) {
        this.refresh(currentLocation(this.context.routah.history));
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var location = this.state.location;

      if (this.state.matches) {
        if (this.props.component) {
          return _react2.default.createElement(this.props.component, _extends({ location: location }, this.props.props));
        }
        return this.props.children(location);
      }
      return this.props.notFound(location);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.dispose();
      this.disposeBefore();
      this.disposeUnload();
      delete this.dispose;
      delete this.disposeBefore;
      delete this.disposeUnload;
    }
  }]);

  return Route;
}(_react.Component);

Route.propTypes = {
  match: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
  component: _react.PropTypes.func,
  notFound: _react.PropTypes.func,
  props: _react.PropTypes.object,
  onLeave: _react.PropTypes.func,
  onEnter: _react.PropTypes.func
};
Route.defaultProps = {
  notFound: function notFound() {
    return _react2.default.createElement('noscript', null);
  },
  props: {},
  onMount: function onMount() {},
  onEnter: function onEnter(l, cb) {
    return cb();
  },
  onLeave: function onLeave(l, cb) {
    return cb();
  },
  onUnload: function onUnload() {}
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

    return _ret3 = (_temp3 = (_this4 = _possibleConstructorReturn(this, (_Object$getPrototypeO3 = Object.getPrototypeOf(Link)).call.apply(_Object$getPrototypeO3, [this].concat(args))), _this4), _this4.onClick = function (e) {
      e.preventDefault();
      _this4.props.onClick(e);
      _this4.context.routah.history.push(_this4.props.to);
    }, _temp3), _possibleConstructorReturn(_this4, _ret3);
  }

  _createClass(Link, [{
    key: 'render',
    value: function render() {
      var h = this.context.routah.history;
      var active = h.createHref(this.props.to) === h.createHref(currentLocation(h));

      return _react2.default.createElement(
        'a',
        _extends({
          href: this.context.routah.history.createHref(this.props.to)
        }, this.props, {
          className: this.props.className + ' ' + (active ? this.props.activeClass : ''),
          style: _extends({}, this.props.style, active ? this.props.activeStyle : {}),
          onClick: this.onClick }),
        this.props.children
      );
    }
  }]);

  return Link;
}(_react.Component);

// todo - handle server side redirect

Link.contextTypes = {
  routah: _react.PropTypes.object
};
Link.propTypes = {
  to: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object]),
  onClick: _react.PropTypes.func,
  className: _react.PropTypes.string,
  activeClass: _react.PropTypes.string,
  activeStyle: _react.PropTypes.object
};
Link.defaultProps = {
  onClick: function onClick() {},
  className: '',
  activeClass: '',
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
      return _react2.default.createElement('noscript', null);
    }
  }]);

  return Redirect;
}(_react.Component);

Redirect.contextTypes = {
  routah: _react.PropTypes.object
};