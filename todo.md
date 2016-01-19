
- overwrite context.routah for a subtree (and handle redirects on said tree)
- handle multiple redirects on the same render tree
- a11y
- .dispose() on server side
- hot swap history objects?
- test query string matching etc
- testsssss
- perfffff


- ✓ dynamic routing * require.ensure should just work
- ✓ redux-simple-router * it just works!
- ✓ activeClass / activeStyle
- ✓ default browser history object
- ✓ default node history object
- ✓ path-to-regexp for matching
- ✓ server side rendering
- ✓ `<NotFound/>` via RouteStack


- ~ transitions / leave / enter, onBeforeUnload * todo: authWare flow
- ~ animations between urls * use hooks/springs?
- ~ scroll states * use rackt/scroll-behavior, after historyV2 compat
- ~ redirects * todo: server side handling


- x async data * not a concern of this library (or fetch prop? or falcor?)
- x `<IndexRoute />`? * not needed, just use a `<Route path='/' />`

