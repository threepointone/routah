routah
---

yet another router, via react + history + path-to-regexp

tl;dr - routes anywhere in your react component tree

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

Render a `<Router>` element in your react app to start the router

- history - (optional) history object via [rackt/history]

Route
---

A `<Route path={...}>` element renders only when the current url matches the `path` expression.

- path - _string_ -  an [express-style](https://github.com/pillarjs/path-to-regexp) path matcher
- path - _array_ - an array of the above

- children - _function_ - (location, history) - [a render-callback](https://discuss.reactjs.org/t/children-as-a-function-render-callbacks/626)
OR
- component (_React.Component_) + props (_object_) which will also receive *{location, history}*

- hooks - _function_
  - onMount(location)
  - onEnter(location, callback)
  - onLeave(location, callback)
  - onUnload(location)

- notFound - _function_  - a render-callback when path doesn't match. defaults to `() => <noscript/>`


Link
---

A `<Link to={...}>` is a drop in replacement for `<a>` elements

- to - _string_ - url
- to - _object_ -  [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)
- onClick, className, style - analogous to dom
- activeClass - _string_ - added to className when `to` matches current url
- activeStyle - _object_ - merged to style when `to` matches current url

Redirect
---

A `<Redirect to={...} />` triggers a redirect to `to` whenever rendered.

- to - _string_ - url
- to - _object_ -  [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)




