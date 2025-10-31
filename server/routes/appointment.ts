import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'

export default function appointmentRoutes(controllers: Controllers, router: Router): Router {
  const {
    appointments: {
      attendanceOutcomeController,
      enforcementController,
      logComplianceController,
      logHoursController,
      projectDetailsController,
      confirmController,
    } = {},
  } = controllers

  router.get(paths.appointments.projectDetails.pattern, async (req, res, next) => {
    const handler = projectDetailsController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.projectDetails.pattern, async (req, res, next) => {
    const handler = projectDetailsController.submit()
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

  router.post(paths.appointments.logHours.pattern, async (req, res, next) => {
    const handler = logHoursController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.logCompliance.pattern, async (req, res, next) => {
    const handler = logComplianceController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.logCompliance.pattern, async (req, res, next) => {
    const handler = logComplianceController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.enforcement.pattern, async (req, res, next) => {
    const handler = enforcementController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.enforcement.pattern, async (req, res, next) => {
    const handler = enforcementController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.confirm.pattern, async (req, res, next) => {
    const handler = confirmController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.confirm.pattern, async (req, res, next) => {
    const handler = confirmController.submit()
    await handler(req, res, next)
  })

  return router
}
