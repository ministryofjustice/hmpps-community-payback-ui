import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../services/appointmentService'
import AppointmentsController from './appointmentsController'
import { ContactOutcomesDto } from '../@types/shared'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'
import ReferenceDataService from '../services/referenceDataService'
import paths from '../paths'
import SessionUtils from '../utils/sessionUtils'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import ProviderService from '../services/providerService'
import GovUkSelectInput from '../forms/GovUkSelectInput'
import supervisorSummaryFactory from '../testutils/factories/supervisorSummaryFactory'

jest.mock('../models/offender')

describe('AppointmentsController', () => {
  const appointmentId = '1'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId } })
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
  const providerDataService = createMock<ProviderService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new AppointmentsController(appointmentService, referenceDataService, providerDataService)
    offenderMock.mockImplementation(() => {
      return offender
    })
  })

  describe('projectDetails', () => {
    const updatePath = '/project-details'
    beforeEach(() => {
      jest.spyOn(paths.appointments, 'projectDetails').mockReturnValue(updatePath)
    })

    it('should render the check project details page', async () => {
      const appointment = appointmentFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const dateAndTime = '1 January 2025, 09:00 - 17:00'
      jest.spyOn(DateTimeFormats, 'dateAndTimePeriod').mockReturnValue(dateAndTime)

      const requestHandler = appointmentsController.projectDetails()
      await requestHandler(request, response, next)

      const project = {
        name: appointment.projectName,
        type: appointment.projectTypeName,
        supervisingTeam: appointment.supervisingTeam,
        dateAndTime,
      }

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          project,
          offender,
        }),
      )
    })

    it('should return an object containing a back link to the session page', async () => {
      const appointment = appointmentFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const backLink = '/session/1'
      jest.spyOn(SessionUtils, 'getSessionPath').mockReturnValue(backLink)

      const requestHandler = appointmentsController.projectDetails()
      await requestHandler(request, response, next)

      expect(SessionUtils.getSessionPath).toHaveBeenCalledWith(appointment)
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          backLink,
        }),
      )
    })

    it('should return an object containing an update link for the form', async () => {
      const appointment = appointmentFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = appointmentsController.projectDetails()
      await requestHandler(request, response, next)

      expect(paths.appointments.projectDetails).toHaveBeenCalledWith({ appointmentId })

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          updatePath,
        }),
      )
    })

    it('should return an object containing supervisorItems', async () => {
      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const supervisorItems = [
        { text: 'Gwen', value: '1 ' },
        { text: 'Harry', value: '2' },
      ]
      jest.spyOn(GovUkSelectInput, 'getOptions').mockReturnValue(supervisorItems)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.projectDetails()
      await requestHandler(request, response, next)

      expect(GovUkSelectInput.getOptions).toHaveBeenCalledWith(supervisors, 'name', 'id', 'Choose supervisor')

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          supervisorItems,
        }),
      )
    })
  })

  describe('attendanceOutcome', () => {
    it('should render the attendance outcome page', async () => {
      const appointment = appointmentFactory.build()
      const contactOutcomes: ContactOutcomesDto = {
        contactOutcomes: [
          { name: 'Attended', id: 'outcome-id-1', code: 'CO1', enforceable: true },
          { name: 'Did not attend', id: 'outcome-id-2', code: 'CO2', enforceable: false },
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
