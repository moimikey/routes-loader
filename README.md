# Routes Loader

Webpack loader to transform a directory to a routes object.

## Usage

```
// ready to use with react router + bundle splitting
import reactRouterRoutes from 'routes!./pages'

render((
  <Router history={browserHistory} routes={reactRouterRoutes} />
), document.getElementById('react'))


// array of routes and their corresponding files, useful for sitemaps and pre-rendering
import routeList from 'routes?list!./pages'


// easy integration with another routing solution
import genericRoutes from 'routes?raw!./pages'
```

## Special Routes

Any file named '_layout' will be treated as a layout component for all routes in the same directory.

Any route named '404' will have a path of '*'

## Requirements

Requires webpack 2.0
