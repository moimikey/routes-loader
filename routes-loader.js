const path = require('path')
const dtree = require('directory-tree')

function treeToRoutes(tree, root, ctx, level = '') {
  const route = {
    path: level || '/',
    childRoutes: [],
  }

  if (tree.children) {
    tree.children.forEach(child => {
      const file = child.path.replace(root, ctx)
      const path = child.name.replace(/\..+$/, '')

      if (child.children) {
        route.childRoutes.push(treeToRoutes(child, root, ctx, path))
      } else {
        const component = { file }

        switch (path) {
          case '_layout':
            route.component = component
            break
          case 'index':
            route.indexRoute = component
            break
          case '404':
            route.childRoutes.push({ component, path: '*' })
            break
          default:
            route.childRoutes.push({ path, component })
            break
        }
      }
    })
  }

  return route
}

function routeList(routes) {
  return [routes].reduce(function reduceRoutes(list, route) {
    const uri = route.path
    const parent = uri === '/' ? '' : uri

    if (route.childRoutes) {
      const index = {
        path: uri,
        file: route.indexRoute.file,
      }
      const children = route.childRoutes.map(reduceRoutes.bind(null, list)).map(child =>
        child.map(c => ({
          path: `${parent}/${c.path}`,
          file: c.file,
        }))
      )
      return [].concat.apply([index], children)
    }

    if (uri === '*') {
      return list.concat({
        path: uri.replace('*', '404'),
        file: route.component.file,
      })
    }

    return list.concat({
      path: uri,
      file: route.component.file,
    })
  }, [])
}

function reactRouterRoutes(routes) {
  return JSON.stringify(routes, (k, v) => {
    if (k === 'component' || k === 'indexRoute') {
      return v.file
    }
    return v
  }, 2).replace(/(\s+)"(component|indexRoute)": (".+")/g, (match, whitespace, type, file) => {
    const indent = whitespace.replace('\n', '')
    const loaderFn = type === 'component' ? 'getComponent' : 'getIndexRoute'
    const loaderCb = type === 'component' ? 'cb(null, page.default || page)' : 'cb(null, { component: page.default || page })'

    return `${whitespace}${loaderFn}(nextState, cb) {
${indent}  System.import(${file})
${indent}    .then(page => { ${loaderCb} }, error => { cb(error, null) })
${indent}}`
  })
}

function transformResult(routes, query) {
  if (query.indexOf('?raw') === 0) {
    return JSON.stringify(routes, null, 2)
  } else if (query.indexOf('?list') === 0) {
    return JSON.stringify(routeList(routes), null, 2)
  }

  return reactRouterRoutes(routes)
}

module.exports = function ReactRouterRoutesLoader() {
  const root = path.join(this.resourcePath, '..')

  const tree = dtree(root)
  const routes = treeToRoutes(tree, root, this.context)

  this.addContextDependency(root)
  return `module.exports = ${transformResult(routes, this.query)}\n`
}
