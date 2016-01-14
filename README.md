routah
---

yet another router, via react + history + route-parser

tl;dr - routes anywhere in your react component tree

[work in progress]

```jsx
<Route match={'/product/:id'}>{
  ({location}) =>
    <div>
      you're at {location.pathname}
      {...product details}
      <Link to='/home'>Homepage<Link>
    </div>
}</Route>
```

// longform
```jsx
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link} from 'routah';

const history = require('history').createHistory();


function App(){
  return <div>
    {/* use a render callback */}
    <Route match='/'>{
      location => // via rackt/history
        <Homepage/>
    }<Route>
    {/* or pass a component */}
    <Route match='/products/:id'>{
      (location, params) =>
        <Product id={location.params.id} />
    }<Route>
    {/* link to urls / location objects */}
    <Link to={...}>elsewhere</Link>
  </div>;
}

render(<Router history={history}> // via rackt/history
  <App/>
</Root>, $('#app'));
```

Router
---

Route
---

Link
---






