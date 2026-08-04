import { Router } from 'express'
import paths from '../paths'
import { Page } from '../services/auditService'
import actions from './actions'
import { Services } from '../services'
import featureFlagMiddleware from './featureFlagMiddleware'
import { Controllers } from '../controllers'
import requirementMiddleware from './requirementMiddleware'

export default function projectRoutes(controllers: Controllers, router: Router, services: Services): Router {
  const { get, post } = actions(router)
  const { projectsController, personSearchController, requirementController, appointments } = controllers

  get(paths.projects.index.pattern, projectsController.index(), { auditEvent: Page.VIEW_PROJECTS_SEARCH_PAGE })
  get(paths.projects.show.pattern, projectsController.show())
  get(paths.projects.filter.pattern, projectsController.filter(), {
    auditEvent: Page.SEARCH_PROJECTS,
  })

  post(paths.projects.create.findAPerson.pattern, services.personSearchService.post)
  get(
    paths.projects.create.findAPerson.pattern,
    [
      featureFlagMiddleware('createAppointmentEnabled'),
      services.personSearchService.get,
      (req, res, next) => {
        const resultPath = paths.projects.create.requirement({
          projectCode: req.params.projectCode,
          crn: ':crn',
        })
        return personSearchController.show(Page.SEARCH_PROJECT_FIND_A_PERSON_RESULTS, resultPath)(req, res, next)
      },
    ],
    {
      auditEvent: Page.SEARCH_PROJECT_FIND_A_PERSON,
    },
  )

  get(
    paths.projects.create.requirement.pattern,
    [
      requirementMiddleware(services.offenderService, paths.projects.create.createAppointment),
      (req, res, next) => {
        const { crn, projectCode } = req.params
        return requirementController.show({
          backPath: paths.projects.create.findAPerson({ projectCode }),
          updatePath: paths.projects.create.requirement({ crn, projectCode }),
        })(req, res, next)
      },
    ],
    {
      auditEvent: Page.VIEW_CREATE_APPOINTMENT_REQUIREMENT_PAGE,
    },
  )
  post(
    paths.projects.create.requirement.pattern,
    (req, res, next) => {
      const params = {
        crn: req.params.crn,
        projectCode: req.params.projectCode,
      }
      return requirementController.submit({
        backPath: paths.projects.create.findAPerson(params),
        updatePath: paths.projects.create.requirement(params),
        createAppointmentPath: paths.projects.create.createAppointment,
      })(req, res, next)
    },
    {
      auditEvent: Page.EDIT_CREATE_APPOINTMENT_REQUIREMENT_PAGE,
    },
  )

  get(paths.projects.create.createAppointment.pattern, appointments.appointmentsController.create())

  return router
}
