import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AttendanceOutcomeController from './attendanceOutcomeController'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionService from '../../services/sessionService'

jest.mock('../../pages/appointments/attendanceOutcomePage')

describe('AttendanceOutcomeController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const contactOutcomes = contactOutcomesFactory.build()

  const request = createMock<Request>({ params: { appointmentId }, query: {} })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const attendanceOutcomePageMock: jest.Mock = AttendanceOutcomePage as unknown as jest.Mock<AttendanceOutcomePage>
  const pageViewData = {
    someKey: 'some value',
  }

  let controller: AttendanceOutcomeController
  const appointmentService = createMock<AppointmentService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()

  let mockPageInstance: {
    validationErrors: jest.Mock
    headingViewData: jest.Mock
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
      headingViewData: jest.fn().mockReturnValue({ title: 'Test', caption: 'Test' }),
      paths: jest.fn().mockReturnValue({ backLink: '/back', updatePath: '/update' }),
      selectedPeopleCard: jest.fn().mockReturnValue(undefined),
      viewData: jest.fn().mockReturnValue(pageViewData),
      next: jest.fn(),
      updateForm: jest.fn(),
    }

    attendanceOutcomePageMock.mockReturnValue(mockPageInstance)

    controller = new AttendanceOutcomeController(appointmentService, referenceDataService, formService, sessionService)
  })

  describe('show', () => {
    it('should render the attendance outcome page', async () => {
      const appointment = appointmentFactory.build()

      appointmentService.getAppointment.mockResolvedValue(appointment)
      referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomes)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/attendanceOutcome',
        expect.objectContaining(pageViewData),
      )
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the attendance outcome page with errors', async () => {
        const errors = { someKey: { text: 'some error' } }
        const errorSummary = [{ text: 'some error', href: '#someKey' }]

        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: true,
          errors,
          errorSummary,
        })

        const appointment = appointmentFactory.build()
        const form = appointmentOutcomeFormFactory.build()

        appointmentService.getAppointment.mockResolvedValue(appointment)
        referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomes)
        formService.getForm.mockResolvedValue(form)

        const requestHandler = controller.submit()
        const requestWithForm = createMock<Request>({
          ...request,
          body: { form: 'formId123' },
        })

        await requestHandler(requestWithForm, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/attendanceOutcome',
          expect.objectContaining({
            errors,
            errorSummary,
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/somePath'
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      const formId = 'formId123'

      beforeEach(() => {
        appointmentService.getAppointment.mockResolvedValue(appointmentFactory.build())
        referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomes)

        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: false,
          errors: {},
          errorSummary: [],
        })
        mockPageInstance.next.mockReturnValue(nextPath)
        mockPageInstance.updateForm.mockReturnValue(formToSave)
      })

      it('should redirect to the next page', async () => {
        const form = appointmentOutcomeFormFactory.build()
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
