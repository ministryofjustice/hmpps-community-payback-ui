import { Router } from 'express'
import paths from '../paths'
import type { Controllers } from '../controllers'
import AuditService, { Page } from '../services/auditService'

export default function appointmentRoutes(
  controllers: Controllers,
  router: Router,
  auditService: AuditService,
): Router {
  const {
    appointments: {
      attendanceOutcomeController,
      logComplianceController,
      logHoursController,
      appointmentDetailsController,
      confirmController,
    } = {},
  } = controllers

  router.get(paths.appointments.appointmentDetails.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_APPOINTMENT_DETAILS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = appointmentDetailsController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.appointmentDetails.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SUBMIT_APPOINTMENT_PROJECT_DETAILS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = appointmentDetailsController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.attendanceOutcome.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = attendanceOutcomeController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.attendanceOutcome.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SUBMIT_APPOINTMENT_ATTENDANCE_OUTCOME_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = attendanceOutcomeController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.logHours.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_APPOINTMENT_LOG_HOURS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = logHoursController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.logHours.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SUBMIT_APPOINTMENT_LOG_HOURS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = logHoursController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.logCompliance.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_APPOINTMENT_LOG_COMPLIANCE_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = logComplianceController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.logCompliance.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SUBMIT_APPOINTMENT_LOG_COMPLIANCE_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = logComplianceController.submit()
    await handler(req, res, next)
  })

  router.get(paths.appointments.confirm.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SHOW_APPOINTMENT_CONFIRM_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const handler = confirmController.show()
    await handler(req, res, next)
  })

  router.post(paths.appointments.confirm.pattern, async (req, res, next) => {
    await auditService.logPageView(Page.SUBMIT_APPOINTMENT_CONFIRM_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })
    const handler = confirmController.submit()
    await handler(req, res, next)
  })

  return router
}
