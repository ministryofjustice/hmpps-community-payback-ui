import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import LogComplianceController from './logComplianceController'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'

jest.mock('../../pages/appointments/logCompliancePage')

describe('LogComplianceController', () => {
  const userName = 'user'
  const appointmentId = '1'

  const request = createMock<Request>({ params: { appointmentId }, query: {} })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const logCompliancePageMock: jest.Mock = LogCompliancePage as unknown as jest.Mock<LogCompliancePage>
  const pageViewData = {
    someKey: 'some value',
  }

  let controller: LogComplianceController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()
  const offenderService = createMock<OffenderService>()

  let mockPageInstance: {
    validationErrors: jest.Mock
    offenderHeading: jest.Mock
    paths: jest.Mock
    selectedPeopleCard: jest.Mock
    viewData: jest.Mock
    next: jest.Mock
    updateForm: jest.Mock
  }

  beforeEach(() => {
    jest.resetAllMocks()

    mockPageInstance = {
      validationErrors: jest.fn().mockReturnValue({
        hasErrors: false,
        errors: {},
        errorSummary: [],
      }),
      offenderHeading: jest.fn().mockReturnValue({ title: 'Test', caption: 'Test' }),
      paths: jest.fn().mockReturnValue({ backLink: '/back', updatePath: '/update' }),
      selectedPeopleCard: jest.fn().mockReturnValue(undefined),
      viewData: jest.fn().mockReturnValue(pageViewData),
      next: jest.fn(),
      updateForm: jest.fn(),
    }

    logCompliancePageMock.mockReturnValue(mockPageInstance)

    controller = new LogComplianceController(appointmentService, formService, sessionService, offenderService)
  })

  describe('showSingle', () => {
    it('should render the log compliance page', async () => {
      const appointment = appointmentFactory.build()

      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = controller.showSingle()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/logCompliance',
        expect.objectContaining(pageViewData),
      )
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the log compliance page with errors', async () => {
        const errors = { field: { text: 'Enter a value for field' } }
        const errorSummary = [{ text: 'Enter a value for field', href: '#field' }]

        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: true,
          errors,
          errorSummary,
        })

        const appointment = appointmentFactory.build()
        const form = appointmentOutcomeFormFactory.build()

        appointmentService.getAppointment.mockResolvedValue(appointment)
        formService.getForm.mockResolvedValue(form)

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: 'formId123' },
        })

        await requestHandler(requestWithForm, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/logCompliance',
          expect.objectContaining({
            errors,
            errorSummary,
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/next'
      const formToSave = { workQuality: 'GOOD', behaviour: 'SATISFACTORY' }
      const formId = 'formId123'

      beforeEach(() => {
        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: false,
          errors: {},
          errorSummary: [],
        })
        mockPageInstance.next.mockReturnValue(nextPath)
        mockPageInstance.updateForm.mockReturnValue(formToSave)
      })

      it('should redirect to the next page', async () => {
        const appointment = appointmentFactory.build()
        const form = appointmentOutcomeFormFactory.build()

        appointmentService.getAppointment.mockResolvedValue(appointment)
        formService.getForm.mockResolvedValue(form)

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: formId },
        })

        await requestHandler(requestWithForm, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = appointmentOutcomeFormFactory.build()
        const appointment = appointmentFactory.build()

        appointmentService.getAppointment.mockResolvedValue(appointment)
        formService.getForm.mockResolvedValue(existingForm)

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: formId },
        })

        await requestHandler(requestWithForm, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
