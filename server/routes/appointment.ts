import { Router } from 'express'
import paths from '../paths'
import AppointmentsController from '../controllers/appointmentsController'

export default function appointmentRoutes(appointmentsController: AppointmentsController, router: Router): Router {
  router.get(paths.appointments.projectDetails.pattern, async (req, res, next) => {
    const handler = appointmentsController.projectDetails()
    await handler(req, res, next)
  })

  router.get(paths.appointments.attendanceOutcome.pattern, async (req, res, next) => {
    const handler = appointmentsController.attendanceOutcome()
    await handler(req, res, next)
  })

  router.post(paths.appointments.update.pattern, async (req, res, next) => {
    const handler = appointmentsController.update()
    await handler(req, res, next)
  })

  return router
}
