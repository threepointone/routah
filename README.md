routah
---

yet another router, via react + history + route-parser

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

Route
---

Link
---

Redirect
---





