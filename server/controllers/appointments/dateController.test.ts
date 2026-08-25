import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import createAppointmentFormFactory from '../../testutils/factories/createAppointmentFormFactory'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import DateController from './dateController'
import DatePage from '../../pages/appointments/datePage'

jest.mock('../shared/getAppointmentOrSession')

describe('DateController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const projectCode = '2'
  const formId = '123'
  const request = createMock<Request>({ params: { appointmentId, projectCode }, query: { form: formId } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const getAppointmentOrSessionMock: jest.Mock = getAppointmentOrSession as unknown as jest.Mock

  let dateController: DateController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()
  const offenderService = createMock<OffenderService>()

  beforeEach(() => {
    jest.resetAllMocks()

    dateController = new DateController(appointmentService, formService, sessionService, offenderService)

    getAppointmentOrSessionMock.mockResolvedValue({ appointment: appointmentFactory.build() })
  })

  describe('show', () => {
    it('should throw when the form is not a create appointment form', async () => {
      const form = appointmentOutcomeFormFactory.build()
      formService.getForm.mockResolvedValue(form)
      jest
        .spyOn(DatePage.prototype, 'commonViewData')
        .mockReturnValue({ heading: { title: '', caption: '' }, backLink: '', updatePath: '' })

      const requestHandler = dateController.show()

      await expect(requestHandler(request, response, next)).rejects.toThrow(
        'Date form step is currently only implemented for create appointment journey.',
      )
    })
  })

  describe('create', () => {
    it('renders the page', async () => {
      const form = createAppointmentFormFactory.build({ projectTypeGroup: 'INDIVIDUAL' })
      const offenderSummary = caseDetailsSummaryFactory.build()
      const pathsResult = { backLink: 'paths-back-link', updatePath: 'update-path', form: formId }
      const heading = { title: 'heading-title', caption: 'heading-caption' }
      const viewData = { date: '01/01/2026' }
      const backLink = 'back-link-from-getBackPath'

      formService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(offenderSummary)
      jest.spyOn(DatePage.prototype, 'paths').mockReturnValue(pathsResult)
      jest.spyOn(DatePage.prototype, 'offenderHeading').mockReturnValue(heading)
      jest.spyOn(DatePage.prototype, 'viewData').mockReturnValue(viewData)
      const getBackPathSpy = jest.spyOn(DatePage.prototype, 'getBackPath').mockReturnValue(backLink)

      const requestHandler = dateController.create()
      await requestHandler(request, response, next)

      expect(getBackPathSpy).toHaveBeenCalledWith({
        form,
        projectTypeGroup: form.projectTypeGroup,
        formId,
        offenderSummary,
      })

      expect(response.render).toHaveBeenCalledWith('appointments/update/date', {
        ...pathsResult,
        heading,
        ...viewData,
        backLink,
      })
    })
  })

  describe('submitCreate', () => {
    it('rerenders the page with errors', async () => {
      const form = createAppointmentFormFactory.build({ projectTypeGroup: 'GROUP' })
      const offenderSummary = caseDetailsSummaryFactory.build()
      const pathsResult = { backLink: 'paths-back-link', updatePath: 'update-path', form: formId }
      const heading = { title: 'heading-title', caption: 'heading-caption' }
      const viewData = { date: 'invalid-date' }
      const backLink = 'back-link-from-getBackPath'
      const errors = { date: { text: 'Enter a real date' } }
      const errorSummary = [
        { text: 'Enter a real date', href: '#date', attributes: { 'data-cy-error-date': 'Enter a real date' } },
      ]

      formService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(offenderSummary)
      jest.spyOn(DatePage.prototype, 'paths').mockReturnValue(pathsResult)
      jest.spyOn(DatePage.prototype, 'offenderHeading').mockReturnValue(heading)
      jest.spyOn(DatePage.prototype, 'viewData').mockReturnValue(viewData)
      jest.spyOn(DatePage.prototype, 'validationErrors').mockReturnValue({ hasErrors: true, errors, errorSummary })
      const getBackPathSpy = jest.spyOn(DatePage.prototype, 'getBackPath').mockReturnValue(backLink)

      const requestHandler = dateController.submitCreate()
      await requestHandler(request, response, next)

      expect(getBackPathSpy).toHaveBeenCalledWith({
        form,
        projectTypeGroup: form.projectTypeGroup,
        formId,
        offenderSummary,
      })

      expect(response.render).toHaveBeenCalledWith('appointments/update/date', {
        heading,
        ...pathsResult,
        ...viewData,
        backLink,
        errorSummary,
        errors,
      })
    })
  })
})
