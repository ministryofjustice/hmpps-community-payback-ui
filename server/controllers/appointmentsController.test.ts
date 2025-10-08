import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../services/appointmentService'
import AppointmentsController from './appointmentsController'
import { AppointmentDto, ContactOutcomesDto, OffenderFullDto } from '../@types/shared'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'
import ReferenceDataService from '../services/referenceDataService'
import paths from '../paths'

jest.mock('../models/offender')

describe('AppointmentsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
  const offender = {
    name: 'Sam Smith',
    crn: 'CRN123',
    isLimited: false,
  }

  let appointmentsController: AppointmentsController
  const appointmentService = createMock<AppointmentService>()
  const referenceDataService = createMock<ReferenceDataService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new AppointmentsController(appointmentService, referenceDataService)
    offenderMock.mockImplementation(() => {
      return offender
    })
  })

  describe('projectDetails', () => {
    it('should render the check project details page', async () => {
      const offenderResponse: OffenderFullDto = {
        crn: 'string',
        objectType: 'Full',
        forename: 'string',
        surname: 'string',
        middleNames: [],
      }
      const appointment: AppointmentDto = {
        id: 1001,
        projectName: 'Community Garden Maintenance',
        projectTypeName: 'Environmental Improvement',
        projectTypeCode: 'ENV',
        offender: offenderResponse,
        supervisingTeam: 'Team Lincoln',
        projectCode: 'XCT12',
        date: '2025-01-02',
        startTime: '11:00',
        endTime: '12:00',
      }

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const dateAndTime = '1 January 2025, 09:00 - 17:00'
      jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)

      const requestHandler = appointmentsController.projectDetails()
      await requestHandler(request, response, next)

      const project = {
        name: 'Community Garden Maintenance',
        type: 'Environmental Improvement',
        supervisingTeam: 'Team Lincoln',
        dateAndTime,
      }

      expect(response.render).toHaveBeenCalledWith('appointments/update/projectDetails', {
        project,
        offender,
      })
    })
  })

  describe('attendanceOutcome', () => {
    it('should render the attendance outcome page', async () => {
      const offenderResponse: OffenderFullDto = {
        crn: 'string',
        objectType: 'Full',
        forename: 'string',
        surname: 'string',
        middleNames: [],
      }
      const appointment: AppointmentDto = {
        id: 1001,
        projectName: 'Community Garden Maintenance',
        projectTypeName: 'Environmental Improvement',
        projectTypeCode: 'ENV',
        offender: offenderResponse,
        supervisingTeam: 'Team Lincoln',
        projectCode: 'XCT12',
        date: '2025-01-02',
        startTime: '11:00',
        endTime: '12:00',
      }
      const contactOutcomes: ContactOutcomesDto = {
        contactOutcomes: [
          { name: 'Attended', id: 'outcome-id-1', code: 'CO1' },
          { name: 'Did not attend', id: 'outcome-id-2', code: 'CO2' },
        ],
      }

      const response = createMock<Response>()
      const req = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })

      appointmentService.getAppointment.mockResolvedValue(appointment)
      referenceDataService.getContactOutcomes.mockResolvedValue(contactOutcomes)

      const requestHandler = appointmentsController.attendanceOutcome()
      await requestHandler(req, response, next)

      const expectedItems = [
        {
          text: 'Attended',
          value: 'outcome-id-1',
        },
        {
          text: 'Did not attend',
          value: 'outcome-id-2',
        },
      ]

      expect(response.render).toHaveBeenCalledWith('appointments/update/attendanceOutcome', {
        offender,
        items: expectedItems,
        updatePath: paths.appointments.update({ appointmentId: appointment.id.toString() }),
      })
    })
  })

  describe('update', () => {
    it.todo('should update the appointment')
  })
})
