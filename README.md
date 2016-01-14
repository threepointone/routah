routah
---

`npm install react history@2.0.0-rc2 routah --save`

- heavily inspired by [react-router](https://github.com/rackt/react-router) and [react-motion](https://github.com/chenglou/react-motion)
- nest `<Route />` elements anywhere in your app
- [express](http://expressjs.com/)-style pattern matching
- [redux-simple-router](https://www.npmjs.com/package/redux-simple-router) compatible
- server-side friendly
- more!

[work in progress]

```jsx
<Route match={'/product/:id'}>{
  ({location: {pathname, params}}) =>
    <div>
      you're at {location.pathname}
      <Product details={params.id} />
      <Link to='/home'> ~~Homepage~~ <Link>
    </div>
}</Route>
```

// longform
```jsx
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, Redirect} from 'routah';


function App(){
  return <div>
    {/* use a render callback */}
    <Route path='/'>{
      location => // via rackt/history
        <Homepage />
    }<Route>
    {/* or pass a component */}
    <Route path={['/products/:id', '/byId/:id']} component={Product} props={{some: data}} />
    {/* link to urls / location objects */}
    <Link to={...}>elsewhere</Link>
  </div>;
}

render(<Router> // or you could pass in a custom rackt/history object
  <App/>
</Router>, $('#app'));
```


Router
---

Wrap your application in a `<Router>` element to start the router

- `history` - (optional) [history](https://github.com/rackt/history) object

Route
---

A `<Route path={...}>` element renders only when the current url matches the `path` expression.

- `path` - an [express-style](https://github.com/pillarjs/path-to-regexp) path matcher
- `path` - an array of the above
- render via `children (location, history)` - a [render-callback](https://discuss.reactjs.org/t/children-as-a-function-render-callbacks/626)
- render via `component` - a `React.Component` which will receive *{location, history}* as props
- `props` - additional props to transfer when using `component`
- `onMount (location)`
- `onEnter (location, callback)`
- `onLeave (location, callback)`
- `onUnload (location)`
- `notFound ()`  - a render-callback when `path` doesn't match. defaults to `() => <noscript/>`


Link
---

A `<Link to={...}>` is a drop in replacement for `<a>` elements

- `to` - - url
- `to` - a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)
- `onClick`, `className`, `style` - analogous to ReactDOM props
- `activeClass` - added to className when `to` matches current url
- `activeStyle` - merged to style when `to` matches current url

Redirect
---

A `<Redirect to={...} />` triggers a redirect to `to` whenever rendered.

- `to` - url
- `to` - a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)




