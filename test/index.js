import path from 'path'
import fs from 'fs'
import test from 'ava'

import loader from '../routes-loader'

import routeTree from './fixtures/site-tree.json'
import routeList from './fixtures/site-list.json'

function LoaderMock({ query = '', resource = 'fixtures/site/index.js' }) {
  this.query = query
  this.context = 'site'
  this.resourcePath = path.join(__dirname, resource)
  this.cacheable = () => {}

  this.contextDependencies = []
  this.addContextDependency = (d) => { this.contextDependencies.push(d) }

  this.dependencies = []
  this.addDependency = (d) => { this.dependencies.push(d) }
}

test('tree of routes', t => {
  const loaderContext = new LoaderMock({ query: '?raw' })
  const routes = eval(loader.call(loaderContext)) /* eslint no-eval: 0 */

  t.deepEqual(routes, routeTree)
})

test('list of routes', t => {
  const loaderContext = new LoaderMock({ query: '?list' })
  const routes = eval(loader.call(loaderContext)) /* eslint no-eval: 0 */

  t.deepEqual(routes, routeList)
})

test('react-router routes', t => {
  const loaderContext = new LoaderMock({ query: '' })
  const routes = loader.call(loaderContext)

  const reactRouterExampleFile = path.join(__dirname, 'fixtures/site-react-router.txt')
  const reactRouterRoutes = fs.readFileSync(reactRouterExampleFile).toString()

  t.is(routes, reactRouterRoutes)
})

test('no child routes', t => {
  const loaderContext = new LoaderMock({
    query: '?raw',
    resource: 'fixtures/site/product/details/index.js',
  })
  const routes = eval(loader.call(loaderContext)) /* eslint no-eval: 0 */
  t.is(routes.childRoutes.length, 2)
  t.is(routes.childRoutes[0].path, 'x')
})
