import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AttendanceOutcomeController from './attendanceOutcomeController'
import AppointmentService from '../../services/appointmentService'
import paths from '../../paths'
import Offender from '../../models/offender'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'

jest.mock('../../models/offender')

describe('attendanceOutcomeController', () => {
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })
  const contactOutcomes = contactOutcomesFactory.build()

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
  const offender = {
    name: 'Sam Smith',
    crn: 'CRN123',
    isLimited: false,
  }

  let attendanceOutcomeController: AttendanceOutcomeController
  const appointmentService = createMock<AppointmentService>()
  const referenceDataService = createMock<ReferenceDataService>()

  beforeEach(() => {
    jest.resetAllMocks()
    attendanceOutcomeController = new AttendanceOutcomeController(appointmentService, referenceDataService)
    offenderMock.mockImplementation(() => {
      return offender
    })
  })

  describe('show', () => {
    it('should render the attendance outcome page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)
      referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

      const requestHandler = attendanceOutcomeController.show()
      await requestHandler(request, response, next)

      const expectedItems = [
        {
          text: contactOutcomes.contactOutcomes[0].name,
          value: contactOutcomes.contactOutcomes[0].id,
        },
        {
          text: contactOutcomes.contactOutcomes[1].name,
          value: contactOutcomes.contactOutcomes[1].id,
        },
        {
          text: contactOutcomes.contactOutcomes[2].name,
          value: contactOutcomes.contactOutcomes[2].id,
        },
      ]

      expect(response.render).toHaveBeenCalledWith('appointments/update/attendanceOutcome', {
        offender,
        items: expectedItems,
        updatePath: paths.appointments.attendanceOutcome({ appointmentId: appointment.id.toString() }),
        backLink: paths.appointments.projectDetails({ appointmentId: appointment.id.toString() }),
      })
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the attendance outcome page with errors', async () => {
        const requestWithoutFormData = createMock<Request>({
          ...request,
          body: { attendanceOutcome: '' },
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

        const requestHandler = attendanceOutcomeController.submit()
        await requestHandler(requestWithoutFormData, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/attendanceOutcome',
          expect.objectContaining({
            errorSummary: [
              {
                text: 'Select an attendance outcome',
                href: '#attendanceOutcome',
                attributes: { 'data-cy-error-attendanceOutcome': 'Select an attendance outcome' },
              },
            ],
            errors: { attendanceOutcome: { text: 'Select an attendance outcome' } },
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      it('should the next page', async () => {
        const requestWithFormData = createMock<Request>({
          ...request,
          body: { attendanceOutcome: 'outcome-id' },
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

        const requestHandler = attendanceOutcomeController.submit()
        await requestHandler(requestWithFormData, response, next)

        expect(response.render).toHaveBeenCalledWith('appointments/update/logTime', {
          offender,
        })
      })
    })
  })
})
