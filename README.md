routah
---

yet another router, via react + history + route-parser


// tl;dr - routes anywhere in your react component tree

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
    <Route match='/products/:id' component={Product}/>
    {/* link to urls / location objects */}
    <Link to={...}/>
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






