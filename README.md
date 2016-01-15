routah
---

`npm install react history@2.0.0-rc2 routah --save`

- heavily inspired by [react-router](https://github.com/rackt/react-router) and [react-motion](https://github.com/chenglou/react-motion)
- nest `<Route />` elements anywhere in your app
- [express](http://expressjs.com/)-style pattern matching
- [redux-simple-router](https://www.npmjs.com/package/redux-simple-router) compatible
- server-side friendly
- more!


```jsx

import {Router, Route, Link, Redirect} from 'routah';

function App(){
  return <div>
    <ul>
      {/* link across the app */}
      <li><Link to='/1'>Page 1</Link></li>
      <li><Link to='/2'>Page 2</Link></li>
      <li><Link to='/3'>Page 3</Link></li>
      <li><Link to='/p/1e536f'>Page 3</Link></li>
      <li><Link to='/4'>Page 4</Link></li>
    </ul>

    {/* renders when the browser url is /1 */}
    <Route path='/1' component={Page1} />
    {/* and similarly when /2 */}
    <Route path='/2' component={Page2} props={{more: data}}/>

    {/* you can use a render callback */}
    <Route path='/3'>{
      location => <Page3 /> /* add your own logic */
    }</Route>

    {/* match across paths */}
    <Route path={['/p/:id', 'para/:id']}>{
      location =>
        <div>
          <Page section={location.params.id} sub={location.query.sub} />
          {/* nest routes wherever */}
          <Route path='/p/special' component={Special}/>
        </div>
    }</Route>

    {/* you can also redirect to other portions of the app */}
    <Route path='/4'>{
      location => <Redirect to='/2' /> // triggers a `history.push`
    }</Route>

    {/* access the history object */}
    <Route>{ (loc, history) =>
      <div onClick={() => history.push('/1')}>back to /1</div>
    }</Route>

    {/* customize a '404' render */}
    <Route path='/5' notFound={location => <NotFound location={location}/>}> {
      location => false // triggers notFound
    }</Route>
  </div>;
}

ReactDOM.render(<Router><App/></Router>, document.body)
```

differences from react-router
---

- `Route` accepts a 'children as a function' [render-callback]([render-callback](https://discuss.reactjs.org/t/children-as-a-function-render-callbacks/626)) (as an alternative to `component`/`props` props)
- `<Route />` elements can be nested anywhere in the app
- sibling `<Route />` elements don't depend on each other (use `<RouteStack />` for similar behavior)
- very little work has gone into this (so far)



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
<Route path={['/inbox', '/inbox/:id']} component={Inbox} props={{some: data}} />
```


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

A `<Link to={...}>` is a replacement for `<a>` elements
```jsx
<Link to={{path: '/inbox', query: {id}}}>message {id}</Link>
```

- `to` - url
- `to` - a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)
- `onClick`, `className`, `style` - analogous to ReactDOM props
- `activeClass` - added to className when `to` matches current url. defaults to 'active'.
- `activeStyle` - merged to style when `to` matches current url

Redirect
---

A `<Redirect to={...} />` triggers a redirect to `to` whenever/wherever rendered.
```jsx
<Route path='/old' component={Redirect}, props={{to: '/new'}} />
```

- `to` - url
- `to` - a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor)


RouteStack
---

This emulates a behavior from react-router - given one or more `<Routes/>`, render only the first matching element. This makes it easy to make Index/NotFound pages. eg -
```jsx
<RouteStack>
  <Route path='/about' component={About} />
  <Route path='/inbox' component={Inbox} />
  <Route component={NotFound} />
</RouteStack>
```

- `children` - one or more `<Route/>` elements
- `notFound ()` - when no child matches. good for 404s!

