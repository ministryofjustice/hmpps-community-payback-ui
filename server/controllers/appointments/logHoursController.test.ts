import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import LogHoursController from './logHoursController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionService from '../../services/sessionService'

jest.mock('../../pages/appointments/logHoursPage')

describe('logHoursController', () => {
  const userName = 'user'
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const logHoursPage: jest.Mock = LogHoursPage as unknown as jest.Mock<LogHoursPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let logHoursController: LogHoursController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()

  let mockPageInstance: {
    validationErrors: jest.Mock
    next: jest.Mock
    updateForm: jest.Mock
    headingViewData: jest.Mock
    paths: jest.Mock
    selectedPeopleCard: jest.Mock
    viewData: jest.Mock
  }

  const heading = { title: 'Test', caption: 'Test' }
  const paths = { backLink: '/back', updatePath: '/update' }

  beforeEach(() => {
    jest.resetAllMocks()

    // Create a mock page instance with the methods that BaseAppointmentController needs
    mockPageInstance = {
      validationErrors: jest.fn().mockReturnValue({
        hasErrors: false,
        errors: {},
        errorSummary: [],
      }),
      headingViewData: jest.fn().mockReturnValue(heading),
      paths: jest.fn().mockReturnValue(paths),
      selectedPeopleCard: jest.fn().mockReturnValue(undefined),
      viewData: jest.fn().mockReturnValue(pageViewData),
      next: jest.fn(),
      updateForm: jest.fn(),
    }

    // Configure the mock class to return our mock instance
    logHoursPage.mockReturnValue(mockPageInstance)

    logHoursController = new LogHoursController(appointmentService, formService, sessionService)
  })

  describe('showSingle', () => {
    it('should render the log hours page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)
      formService.getForm.mockResolvedValue(appointmentOutcomeFormFactory.build())

      const form = 'formId123'
      const requestWithForm = createMock<Request>({
        ...request,
        query: { form },
      })

      const requestHandler = logHoursController.showSingle()
      await requestHandler(requestWithForm, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/logHours', {
        ...pageViewData,
        ...paths,
        heading,
        form,
      })
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the log hours page with errors', async () => {
        const errors = { someKey: { text: 'some error' } }
        const errorSummary = [{ text: 'errors', href: '#link' }]
        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: true,
          errors,
          errorSummary,
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        formService.getForm.mockResolvedValue(appointmentOutcomeFormFactory.build())

        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: 'formId123' },
        })

        const requestHandler = logHoursController.submit()
        await requestHandler(requestWithForm, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/logHours',
          expect.objectContaining({
            someKey: 'some value', // from heading, paths and viewData methods
            errors,
            errorSummary,
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/next'
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      const formIdForTest = 'formId123'

      beforeEach(() => {
        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: false,
          errors: {},
          errorSummary: [],
        })
        mockPageInstance.next.mockReturnValue(nextPath)
        mockPageInstance.updateForm.mockReturnValue(formToSave)

        appointmentService.getAppointment.mockResolvedValue(appointment)
        formService.getForm.mockClear()
        formService.getForm.mockResolvedValue(appointmentOutcomeFormFactory.build())
      })

      it('should redirect to the next page', async () => {
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: formIdForTest },
        })

        const requestHandler = logHoursController.submit()
        await requestHandler(requestWithForm, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = appointmentOutcomeFormFactory.build({ startTime: '09:00' })
        formService.getForm.mockResolvedValue(existingForm)

        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: formIdForTest },
          query: {},
        })

        const requestHandler = logHoursController.submit()
        await requestHandler(requestWithForm, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formIdForTest, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formIdForTest, userName, formToSave)
      })
    })
  })
})
