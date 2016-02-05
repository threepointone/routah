routah
---

[work in progress]

`npm install routah --save`

- heavily inspired by [react-router](https://github.com/rackt/react-router) and [react-motion](https://github.com/chenglou/react-motion)
- render `<Route />` elements anywhere in your app
- [express](http://expressjs.com/)-style pattern matching
- server-side friendly
- tests
- more!

```jsx

import {Router, Route, Link, Redirect} from 'routah';

function App(){
  return <div>
    <ul>
      {/* link across the app */}
      <li><Link to='/1'>Page 1</Link></li>
      <li><Link to='/2'>Page 2</Link></li>
      <li><Link to='/p/1e536f'>Page 3</Link></li>
      <li><Link to='/4'>Page 4</Link></li>
    </ul>

    {/* renders when the browser url is /1 */}
    <Route path='/1' component={Page1} />
    {/* and similarly when /2 */}
    <Route path='/2' component={Page2} passProps={{more: data}}/>

    {/* match across paths */}
    <Route path={['/p/:id', 'para/:id']}>{
      location => // you can use a render callback
        <div>
          <MyApp section={location.params.id} sub={location.query.sub} />
          {/* render routes wherever */}
          <Route path='/p/special'
            component={Special} onEnter={::console.log} />
        </div>
    }</Route>

    {/* you can also redirect to other portions of the app */}
    <Route path='/3'>{
      location => <Redirect to='/2' /> // triggers a `history.push`
    }</Route>

    {/* read the docs/examples for more! */}
  </div>;
}

ReactDOM.render(<Router><App/></Router>, document.body)
```


Router
---

Wrap your application in a `<Router>` element to start the router
```jsx
render(<Router><App/></Router>, element);
```

- `history` - (optional) [history](https://github.com/rackt/history) object

Route
---

A `<Route path={...}>` element renders only when the current url matches the `path` expression.
```jsx
// you can use a render-callback
<Route path='/about'>{
  () => <div>About Us</div>
}</Route>

// or pass the component and optionally props
<Route path={['/inbox', '/inbox/:id']} component={Inbox} passProps={{some: data}} />
```

- `path` - an [express-style](https://github.com/pillarjs/path-to-regexp) path matcher
- `path` - an array of the above
- render via `children (location, history)` - a [render-callback](https://discuss.reactjs.org/t/children-as-a-function-render-callbacks/626)
- render via `component` - a `React.Component` which will receive *{location, history}* as props
- `passProps` - additional props to transfer when using `component`
- `onMount (location)`
- `onEnter (location, callback)`
- `onLeave (location, callback)`
- `onUnload (location)`
- `notFound (location)`  - a render-callback when `path` doesn't match. defaults to `() => null`

Link
---

A `<Link to={...}>` is a replacement for `<a>` elements
```jsx
<Link to={{path: '/inbox', query: {id}}}>message {id}</Link>
```

- `to` - url
- `to` - a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)
- `onClick`, `className`, `style` - analogous to ReactDOM props

Redirect
---

A `<Redirect to={...} />` triggers a redirect to `to` whenever/wherever rendered.
```jsx
<Route path='/old'>{
  () => <Redirect to='/new'/>
}<Route>
```

- `to` - url
- `to` - a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)

RouteStack
---

This emulates a behavior from react-router - given one or more `<Routes/>`, render only the first matching element. This makes it easy to make Index/NotFound pages. eg -
```jsx
<RouteStack notFound={() => <NotFound/> }>
  <Route path='/about' component={About} />
  <Route path='/inbox' component={Inbox} />
  <Route component={Default} />
</RouteStack>
```

- `children` - one or more `<Route/>` elements
- `notFound (location)` - when no child matches. good for 404s!

context.history
---

The `history` object is passed via `context` to all its descendants. Use it to trigger actions on the url -

- `push` - url
- `push` - [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)
- `replace` - url
- `replace` - [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)
- `go(n)`
- `goBack()`
- `goForward()`
- [more](https://github.com/rackt/history/blob/master/docs/GettingStarted.md)


differences from react-router
---

- `Route` accepts a 'children as a function' [render-callback]([render-callback](https://discuss.reactjs.org/t/children-as-a-function-render-callbacks/626)) (as an alternative to `component`/`passProps` props)
- `<Route />` elements can be rendered anywhere in the app
- urls don't get 'nested', no activeClass/activeStyle - [issue #1](https://github.com/threepointone/routah/issues/1)
- sibling `<Route />` elements don't depend on each other (use `<RouteStack />` for similar behavior)
- no async data/components/routes loading - consider using a lib like [AsyncProps](https://github.com/rackt/async-props), [react-resolver](http://ericclemmons.com/react-resolver/), etc
