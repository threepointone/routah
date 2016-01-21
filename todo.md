- handle multiple redirects on the same render tree
- cache path regexps
- a11y
- test query string matching etc
- perfffff

(via rr)
- stringifyQuery
- parseQuery
- expose context.routah
- expose history helpers

- ✓ dynamic routing * require.ensure should just work
- ✓ redux-simple-router * it just works!
- ✓ activeClass / activeStyle
- ✓ default browser history object
- ✓ default node history object
- ✓ path-to-regexp for matching
- ✓ server side rendering
- ✓ `<NotFound/>` via RouteStack
- ✓ hot swap history objects?

- ~ transitions / leave / enter, onBeforeUnload * todo: authWare flow
- ~ animations between urls * use hooks/springs?
- ~ scroll states * use rackt/scroll-behavior, after historyV2 compat
- ~ redirects * todo: server side handling
- ~ overwrite context.routah for a subtree * todo -  handle redirects on said tree
- ~ .dispose() on server side - to test
- ~ testsssss

- x async data * not a concern of this library (or fetch prop? or falcor?)
- x `<IndexRoute />`? * not needed, just use a `<Route path='/' />`

