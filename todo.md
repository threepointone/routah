
- comparisons should/shouldn't include querystring?
- webpack dev flow
- handle multiple redirects on the same render tree
- cache path regexps
- a11y
- test query string matching etc
- perfffff

(via rr)
- stringifyQuery
- parseQuery
- expose history helpers

- ~ transitions / leave / enter, onBeforeUnload * todo: authWare flow
- ~ animations between urls * use hooks/springs?
- ~ scroll states * use rackt/scroll-behavior, after historyV2 compat
- ~ redirects * todo: server side handling
- ~ testsssss

- ✓ expose context.routah
- ✓ dynamic routing * require.ensure should just work
- ✓ redux-simple-router * it just works!

- ✓ default browser history object
- ✓ default node history object
- ✓ path-to-regexp for matching
- ✓ server side rendering
- ✓ `<NotFound/>` via RouteStack
- ✓ overwrite context.history for a subtree

- x `<IndexRoute />`? * not needed, just use a `<Route path='/' />`
- x async data * not a concern of this library (or fetch prop? or falcor?)
- x activeClass / activeStyle - removed - wasn't 'right'
- x properly 'nest' urls - delegate