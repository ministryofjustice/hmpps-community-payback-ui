import { Router } from 'express'
import paths from '../paths'
import actions from './actions'
import { Page } from '../services/auditService'
import { Controllers } from '../controllers'
import { APPOINTMENT_FORM_PAGES_AUDIT_MAP, AppointmentFormPage } from '../pages/appointments/pathMap'
import { Services } from '../services'
import featureFlagMiddleware from './featureFlagMiddleware'
import requirementMiddleware from './requirementMiddleware'
import buildRequirementPagePaths from '../paths/requirementPagePaths'
import limitedOffenderMiddleware from './limitedOffenderMiddleware'

const bulkUpdateAppointmentFormPages: Array<AppointmentFormPage> = [
  'choose-supervisor',
  'choose-project',
  'attendance-outcome',
  'log-hours',
  'log-compliance',
  'confirm-details',
]

export default function sessionRoutes(controllers: Controllers, router: Router, services: Services): Router {
  const selectPeopleRoute = paths.sessions.update.pattern.replace(':page', 'select-people')

  const { get, post } = actions(router)
  const { sessionsController, appointments, peopleController, requirementController } = controllers

  get('/sessions', sessionsController.index(), { auditEvent: Page.VIEW_SESSIONS_SEARCH_PAGE })
  get('/sessions/search', sessionsController.search('GROUP'), { auditEvent: Page.VIEW_SESSIONS })
  get(
    '/sessions/search/inductions',
    [featureFlagMiddleware('inductionTabsEnabled'), sessionsController.search('INDUCTION')],
    { auditEvent: Page.VIEW_INDUCTIONS },
  )
  get(paths.sessions.show.pattern, sessionsController.show())

  get(selectPeopleRoute, appointments.bulkUpdateController.show(), {
    auditEvent: Page.VIEW_SESSIONS_SELECT_PEOPLE,
  })

  post(selectPeopleRoute, appointments.bulkUpdateController.submitUpdate(), {
    auditEvent: Page.EDIT_SESSIONS_SELECT_PEOPLE,
  })
  post(paths.sessions.create.findAPerson.pattern, services.personSearchService.post)
  get(
    paths.sessions.create.findAPerson.pattern,
    [
      featureFlagMiddleware('createAppointmentEnabled'),
      services.personSearchService.get,
      (req, res, next) => {
        const resultPath = paths.sessions.create.requirement({
          projectCode: req.params.projectCode,
          date: req.params.date,
          crn: ':crn',
        })

        const backPath = paths.sessions.show({ projectCode: req.params.projectCode, date: req.params.date })
        return peopleController.search(Page.SEARCH_SESSIONS_FIND_A_PERSON_RESULTS, { resultPath, backPath })(
          req,
          res,
          next,
        )
      },
    ],
    {
      auditEvent: Page.SEARCH_SESSIONS_FIND_A_PERSON,
    },
  )

  get(
    paths.sessions.create.requirement.pattern,
    [
      limitedOffenderMiddleware({ offenderService: services.offenderService, backPath: paths.people.find({}) }),
      requirementMiddleware(services.offenderService, paths.sessions.create.createAppointment),
      (req, res, next) =>
        requirementController.show(
          buildRequirementPagePaths(paths.sessions.create, {
            projectCode: req.params.projectCode,
            date: req.params.date,
            crn: req.params.crn,
          }),
        )(req, res, next),
    ],
    {
      auditEvent: Page.VIEW_CREATE_APPOINTMENT_REQUIREMENT_PAGE,
    },
  )
  post(
    paths.sessions.create.requirement.pattern,
    (req, res, next) => {
      return requirementController.submit(
        buildRequirementPagePaths(paths.sessions.create, {
          crn: req.params.crn,
          projectCode: req.params.projectCode,
          date: req.params.date,
        }),
      )(req, res, next)
    },
    {
      auditEvent: Page.EDIT_CREATE_APPOINTMENT_REQUIREMENT_PAGE,
    },
  )

  bulkUpdateAppointmentFormPages.forEach((page: AppointmentFormPage) => {
    const controller = appointments.updateControllers[page]

    const { pattern } = paths.sessions.update
    const patternWithPage = pattern.replace(':page', page)

    get(patternWithPage, controller.show(), {
      auditEvent: `BULK_${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].show}`,
    })

    post(patternWithPage, controller.submitUpdate(), {
      auditEvent: `${APPOINTMENT_FORM_PAGES_AUDIT_MAP[page].submit}_BULK`,
    })
  })

  get(paths.sessions.create.createAppointment.pattern, [
    limitedOffenderMiddleware({ offenderService: services.offenderService, backPath: paths.people.find({}) }),
    appointments.appointmentsController.createForProject(),
  ])

  return router
}
