import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import ProviderService from '../../services/providerService'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import ChooseRegionPage from '../../pages/appointments/chooseRegionPage'
import ChooseRegionController from './chooseRegionController'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import createAppointmentFormFactory from '../../testutils/factories/createAppointmentFormFactory'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'

jest.mock('../../pages/appointments/chooseRegionPage')
jest.mock('../shared/getAppointmentOrSession')

describe('ChooseRegionController', () => {
  const username = 'user'
  const formId = '123'
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const chooseRegionPageMock: jest.Mock = ChooseRegionPage as unknown as jest.Mock<ChooseRegionPage>
  const getAppointmentOrSessionMock: jest.Mock = getAppointmentOrSession as unknown as jest.Mock

  const appointmentService = createMock<AppointmentService>()
  const appointmentFormService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()
  const offenderService = createMock<OffenderService>()
  const providerService = createMock<ProviderService>()

  const providers = providerSummaryFactory.buildList(2)
  const providerItems = [{ value: providers[0].code, text: providers[0].name }]

  let controller: ChooseRegionController

  let mockPageInstance: {
    validationErrors: jest.Mock
    updateForm: jest.Mock
    next: jest.Mock
    commonViewData: jest.Mock
    paths: jest.Mock
    offenderHeading: jest.Mock
  }

  beforeEach(() => {
    jest.resetAllMocks()

    mockPageInstance = {
      validationErrors: jest.fn().mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] }),
      updateForm: jest.fn(),
      next: jest.fn().mockReturnValue('/next'),
      commonViewData: jest.fn().mockReturnValue({ common: 'value' }),
      paths: jest.fn().mockReturnValue({ backLink: '/back', updatePath: '/update', form: formId }),
      offenderHeading: jest.fn().mockReturnValue({ title: 'title', caption: 'caption' }),
    }

    chooseRegionPageMock.mockReturnValue(mockPageInstance)

    controller = new ChooseRegionController(
      appointmentService,
      appointmentFormService,
      sessionService,
      offenderService,
      providerService,
    )

    providerService.getProviders.mockResolvedValue(providers)
    jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(providerItems)
    getAppointmentOrSessionMock.mockResolvedValue({ appointment: appointmentFactory.build() })
  })

  describe('show', () => {
    it('renders the page with provider items selected from the form when the body has no provider', async () => {
      const form = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { appointmentId: '1', projectCode: '2' },
        method: 'GET',
        query: { form: formId },
        body: {},
        user: { username },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(providerService.getProviders).toHaveBeenCalledWith(username)
      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        providers,
        'name',
        'code',
        'Choose region',
        form.provider.code,
      )
      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseRegion', {
        common: 'value',
        providerItems,
      })
    })

    it('renders the page with provider items selected from the request body when present', async () => {
      const form = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { appointmentId: '1', projectCode: '2' },
        method: 'GET',
        query: { form: formId },
        body: { provider: 'BODY-PROVIDER' },
        user: { username },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        providers,
        'name',
        'code',
        'Choose region',
        'BODY-PROVIDER',
      )
    })
  })

  describe('submitUpdate', () => {
    it('rerenders the page with errors when validation fails', async () => {
      const form = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)

      const validationErrors = {
        hasErrors: true,
        errors: { provider: { text: 'Choose a region' } },
        errorSummary: [{ text: 'Choose a region', href: '#provider' }],
      }
      mockPageInstance.validationErrors.mockReturnValue(validationErrors)

      const request = createMock<Request>({
        params: { appointmentId: '1', projectCode: '2' },
        query: { form: formId },
        body: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseRegion', {
        common: 'value',
        providerItems,
        errors: validationErrors.errors,
        errorSummary: validationErrors.errorSummary,
      })
      expect(appointmentFormService.saveForm).not.toHaveBeenCalled()
      expect(response.redirect).not.toHaveBeenCalled()
    })

    it('saves the form and redirects when validation passes', async () => {
      const form = appointmentOutcomeFormFactory.build()
      const updatedForm = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)
      mockPageInstance.updateForm.mockReturnValue(updatedForm)

      const request = createMock<Request>({
        params: { appointmentId: '1', projectCode: '2' },
        query: { form: formId },
        body: { provider: 'BODY-PROVIDER' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(appointmentFormService.saveForm).toHaveBeenCalledWith(formId, username, updatedForm)
      expect(response.redirect).toHaveBeenCalledWith('/next')
      expect(response.render).not.toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('renders the page for a new appointment', async () => {
      const form = createAppointmentFormFactory.build()
      const offenderSummary = caseDetailsSummaryFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(offenderSummary)

      const request = createMock<Request>({
        method: 'GET',
        query: { form: formId },
        body: {},
        user: { username },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.create()
      await requestHandler(request, response, next)

      expect(providerService.getProviders).toHaveBeenCalledWith(username)
      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(
        providers,
        'name',
        'code',
        'Choose region',
        form.provider.code,
      )
      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseRegion', {
        backLink: '/back',
        updatePath: '/update',
        form: formId,
        heading: { title: 'title', caption: 'caption' },
        providerItems,
      })
    })
  })

  describe('submitCreate', () => {
    it('rerenders the page with errors when validation fails', async () => {
      const form = createAppointmentFormFactory.build()
      const offenderSummary = caseDetailsSummaryFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(offenderSummary)

      const validationErrors = {
        hasErrors: true,
        errors: { provider: { text: 'Choose a region' } },
        errorSummary: [{ text: 'Choose a region', href: '#provider' }],
      }
      mockPageInstance.validationErrors.mockReturnValue(validationErrors)

      const request = createMock<Request>({
        query: { form: formId },
        body: {},
        user: { username },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitCreate()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/chooseRegion', {
        backLink: '/back',
        updatePath: '/update',
        form: formId,
        heading: { title: 'title', caption: 'caption' },
        providerItems,
        errors: validationErrors.errors,
        errorSummary: validationErrors.errorSummary,
      })
      expect(appointmentFormService.saveForm).not.toHaveBeenCalled()
      expect(response.redirect).not.toHaveBeenCalled()
    })

    it('saves the form and redirects when validation passes', async () => {
      const form = createAppointmentFormFactory.build()
      const updatedForm = createAppointmentFormFactory.build()
      const offenderSummary = caseDetailsSummaryFactory.build()
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(offenderSummary)
      mockPageInstance.updateForm.mockReturnValue(updatedForm)

      const request = createMock<Request>({
        query: { form: formId },
        body: { provider: 'BODY-PROVIDER' },
        user: { username },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitCreate()
      await requestHandler(request, response, next)

      expect(appointmentFormService.saveForm).toHaveBeenCalledWith(formId, username, updatedForm)
      expect(response.redirect).toHaveBeenCalledWith('/next')
      expect(response.render).not.toHaveBeenCalled()
    })
  })
})
