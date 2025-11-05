import { Router } from 'express'
import SessionsController from '../controllers/sessionsController'
import paths from '../paths'

export default function sessionRoutes(sessionsController: SessionsController, router: Router): Router {
  router.get('/sessions', async (req, res, next) => {
    const { query } = req

    if (query.provider) {
      const handler = sessionsController.index()
      return handler(req, res, next)
    }

    const handler = sessionsController.start()
    return handler(req, res, next)
  })

  router.get('/sessions/search', async (req, res, next) => {
    const handler = sessionsController.search()
    await handler(req, res, next)
  })

  router.get(paths.sessions.show.pattern, async (req, res, next) => {
    const handler = sessionsController.show()
    await handler(req, res, next)
  })

  return router
}
