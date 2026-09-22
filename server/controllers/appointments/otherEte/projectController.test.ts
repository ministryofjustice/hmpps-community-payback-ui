import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ProjectController from './projectController'
import AppointmentFormService from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import getProjectsAndTeams from '../../shared/getProjectsAndTeams'
import createAppointmentFormFactory from '../../../testutils/factories/createAppointmentFormFactory'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import AppointmentUtils from '../../../utils/appointmentUtils'
import { buildOtherEtePath } from '../../../pages/appointments/otherEte/pathMap'

jest.mock('../../shared/getProjectsAndTeams')

describe('ProjectController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '2'
  const formId = 'form-1'
  const username = 'user'

  const formService = createMock<AppointmentFormService>()
  const offenderService = createMock<OffenderService>()
  const providerService = createMock<ProviderService>()
  const projectService = createMock<ProjectService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const getProjectsAndTeamsMock: jest.Mock = getProjectsAndTeams as unknown as jest.Mock

  const contextData = {
    teamItems: [{ value: 'T1', text: 'Team 1' }],
    projectItems: [{ value: 'PR1', text: 'Project 1' }],
  }
  const caseDetailsSummary = caseDetailsSummaryFactory.build()
  const heading = { title: 'title', caption: 'caption' }

  let controller: ProjectController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ProjectController(formService, offenderService, providerService, projectService)

    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    getProjectsAndTeamsMock.mockReturnValue(contextData)
    jest.spyOn(AppointmentUtils, 'appointmentHeading').mockReturnValue(heading)
  })

  describe('show', () => {
    it('fetches team and project options using the provider and team from the form', async () => {
      const form = createAppointmentFormFactory.build({
        provider: { code: 'PROVIDER-1', name: 'Provider 1' },
        projectTeam: { code: 'FORM-TEAM', name: 'Team' },
        project: undefined,
      })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        method: 'GET',
        query: { form: formId },
        body: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectTypeGroup: form.projectTypeGroup,
          providerCode: 'PROVIDER-1',
          teamCode: 'FORM-TEAM',
          projectCode: undefined,
        }),
      )

      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseProject', {
        heading,
        backLink: buildOtherEtePath('region', formId),
        updatePath: buildOtherEtePath('project', formId),
        form: formId,
        ...contextData,
        errors: {},
      })
    })

    it('uses the team from the query string when present', async () => {
      const form = createAppointmentFormFactory.build({
        provider: { code: 'PROVIDER-1', name: 'Provider 1' },
        projectTeam: { code: 'FORM-TEAM', name: 'Team' },
      })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        method: 'GET',
        query: { form: formId, team: 'QUERY-TEAM' },
        body: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(getProjectsAndTeamsMock).toHaveBeenCalledWith(expect.objectContaining({ teamCode: 'QUERY-TEAM' }))
    })
  })

  describe('submitUpdate', () => {
    it('saves the selected team and project and redirects to the outcome page', async () => {
      const form = createAppointmentFormFactory.build({
        provider: { code: 'PROVIDER-1', name: 'Provider 1' },
        projectTeam: undefined,
        project: undefined,
      })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        method: 'POST',
        query: { form: formId },
        body: { team: 'T1', project: 'PR1' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).toHaveBeenCalledWith(
        formId,
        username,
        expect.objectContaining({
          projectTeam: { code: 'T1', name: 'Team 1' },
          project: { code: 'PR1', name: 'Project 1' },
        }),
      )
      expect(response.redirect).toHaveBeenCalledWith(buildOtherEtePath('outcome', formId))
    })

    it('re-renders the template with errors when no team is selected', async () => {
      const form = createAppointmentFormFactory.build({
        provider: { code: 'PROVIDER-1', name: 'Provider 1' },
        projectTeam: undefined,
        project: undefined,
      })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        method: 'POST',
        query: { form: formId },
        body: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/chooseProject',
        expect.objectContaining({
          errors: { team: { text: 'Choose a team' } },
        }),
      )
    })
  })
})
