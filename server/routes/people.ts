import { Router } from 'express'
import paths from '../paths'
import type { Services } from '../services'
import actions from './actions'
import { Page } from '../services/auditService'
import requirementMiddleware from './requirementMiddleware'
import { Controllers } from '../controllers'
import limitedOffenderMiddleware from './limitedOffenderMiddleware'

export default function peopleRoutes(controllers: Controllers, services: Services, router: Router): Router {
  const { get, post } = actions(router)
  const {
    peopleController,
    requirementController,
    appointments: { appointmentsController },
  } = controllers

  post(paths.people.find.pattern, services.personSearchService.post)
  get(
    paths.people.find.pattern,
    [
      services.personSearchService.get,
      (req, res, next) => {
        const resultPath = paths.people.requirement({
          crn: ':crn',
        })
        return peopleController.search(Page.SEARCH_FIND_A_PERSON_RESULTS, { resultPath, backPath: '/' })(req, res, next)
      },
    ],
    {
      auditEvent: Page.SEARCH_FIND_A_PERSON,
    },
  )

  get(
    paths.people.requirement.pattern,
    [
      requirementMiddleware(services.offenderService, paths.people.appointments, { mode: 'view' }),
      (req, res, next) => {
        return requirementController.show({
          updatePath: paths.people.requirement({
            crn: req.params.crn,
          }),
          backPath: paths.people.find({}),
        })(req, res, next)
      },
    ],
    {
      auditEvent: Page.VIEW_FIND_A_PERSON_REQUIREMENT_PAGE,
    },
  )

  post(
    paths.people.requirement.pattern,
    (req, res, next) => {
      return requirementController.submit({
        backPath: paths.people.find({}),
        updatePath: paths.people.requirement({ crn: req.params.crn }),
        nextPath: paths.people.appointments,
        viewAppointmentsParams: { appointmentSection: 'upcoming' },
      })(req, res, next)
    },
    {
      auditEvent: Page.EDIT_FIND_A_PERSON_REQUIREMENT_PAGE,
    },
  )

  get(
    paths.people.appointments.pattern,
    [
      limitedOffenderMiddleware({ offenderService: services.offenderService, backPath: paths.people.find({}) }),
      appointmentsController.show(),
    ],
    { auditEvent: Page.VIEW_APPOINTMENTS_PAGE },
  )

  return router
}
