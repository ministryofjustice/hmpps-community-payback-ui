import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'

export default function appointmentRoutes(controllers: Controllers, router: Router): Router {
  const { appointmentsController, appointments: { attendanceOutcomeController, logHoursController } = {} } = controllers

  router.get(paths.appointments.projectDetails.pattern, async (req, res, next) => {
    const handler = appointmentsController.projectDetails()
    await handler(req, res, next)
  })

  router.post(paths.appointments.projectDetails.pattern, async (req, res, next) => {
    const handler = appointmentsController.updateProjectDetails()
    await handler(req, res, next)
  })

  router.get(paths.appointments.attendanceOutcome.pattern, async (req, res, next) => {
    const handler = attendanceOutcomeController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.attendanceOutcome.pattern, async (req, res, next) => {
    const handler = attendanceOutcomeController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.logHours.pattern, async (req, res, next) => {
    const handler = logHoursController.show()
    await handler(req, res, next)
  })

  return router
}
