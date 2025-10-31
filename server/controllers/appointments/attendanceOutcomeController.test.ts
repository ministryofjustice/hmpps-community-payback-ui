import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AttendanceOutcomeController from './attendanceOutcomeController'
import AppointmentService from '../../services/appointmentService'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import AttendanceOutcomePage from '../../pages/appointments/attendanceOutcomePage'
import AppointmentFormService from '../../services/appointmentFormService'

jest.mock('../../pages/appointments/attendanceOutcomePage')

describe('attendanceOutcomeController', () => {
  const userName = 'user'
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const contactOutcomes = contactOutcomesFactory.build()

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>({ locals: { user: { name: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const attendanceOutcomePageMock: jest.Mock = AttendanceOutcomePage as unknown as jest.Mock<AttendanceOutcomePage>
  const pageViewData = {
    someKey: 'some value',
  }

  let attendanceOutcomeController: AttendanceOutcomeController
  const appointmentService = createMock<AppointmentService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const formService = createMock<AppointmentFormService>()

  beforeEach(() => {
    jest.resetAllMocks()
    attendanceOutcomeController = new AttendanceOutcomeController(appointmentService, referenceDataService, formService)
  })

  describe('show', () => {
    it('should render the attendance outcome page', async () => {
      attendanceOutcomePageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })
      appointmentService.getAppointment.mockResolvedValue(appointment)
      referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

      const requestHandler = attendanceOutcomeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/attendanceOutcome', pageViewData)
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the attendance outcome page with errors', async () => {
        const errors = { someKey: { text: 'some error' } }
        attendanceOutcomePageMock.mockImplementationOnce(() => ({
          viewData: () => pageViewData,
          validationErrors: () => errors,
        }))

        const errorSummary = [
          { attributes: { 'data-cy-error-someKey': 'some error' }, href: '#someKey', text: 'some error' },
        ]

        appointmentService.getAppointment.mockResolvedValue(appointment)
        referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

        const requestHandler = attendanceOutcomeController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/attendanceOutcome',
          expect.objectContaining({
            errors,
            errorSummary,
            ...pageViewData,
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/somePath'
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      const formId = '123'

      beforeEach(() => {
        appointmentService.getAppointment.mockResolvedValue(appointment)
        referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

        attendanceOutcomePageMock.mockImplementationOnce(() => ({
          formId,
          viewData: () => pageViewData,
          validationErrors: () => ({}),
          next: () => nextPath,
          form: () => formToSave,
        }))
      })

      it('should redirect to the next page', async () => {
        const requestHandler = attendanceOutcomeController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = { startTime: '09:00' }

        formService.getForm.mockResolvedValue(existingForm)

        const requestHandler = attendanceOutcomeController.submit()
        await requestHandler(request, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
