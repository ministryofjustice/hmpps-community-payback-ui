import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import LogComplianceController from './logComplianceController'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionService from '../../services/sessionService'

jest.mock('../../pages/appointments/logCompliancePage')

describe('LogComplianceController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const appointment = appointmentFactory.build()
  const form = appointmentOutcomeFormFactory.build()

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

  let mockPageInstance: {
    validationErrors: jest.Mock
    commonViewData: jest.Mock
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
      commonViewData: jest.fn().mockReturnValue(pageViewData),
      viewData: jest.fn().mockReturnValue(pageViewData),
      next: jest.fn(),
      updateForm: jest.fn(),
    }

    logCompliancePageMock.mockReturnValue(mockPageInstance)
    appointmentService.getAppointment.mockResolvedValue(appointment)
    formService.getForm.mockResolvedValue(form)

    controller = new LogComplianceController(appointmentService, formService, sessionService)
  })

  describe('show', () => {
    it('should render the log compliance page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = controller.show()
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
      const nextPath = '/nextPath'
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
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
