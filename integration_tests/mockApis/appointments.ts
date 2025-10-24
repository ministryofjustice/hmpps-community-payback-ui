import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { AppointmentDto, OffenderFullDto } from '../../server/@types/shared'

export default {
  stubFindAppointment: (
    {
      appointmentId = '1001',
      appointment = mockAppointment,
    }: { appointmentId: string; appointment: AppointmentDto } = { appointmentId: '1001', appointment: mockAppointment },
  ): SuperAgentRequest => {
    const pattern = paths.appointments.singleAppointment({ appointmentId })
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...appointment,
        },
      },
    })
  },
}
export const mockOffender: OffenderFullDto = {
  forename: 'John',
  surname: 'Smith',
  crn: 'CRN123',
  objectType: 'Full',
  dateOfBirth: '01-02-1973',
  middleNames: [],
}

export const mockAppointment: AppointmentDto = {
  id: 1001,
  version: '7ED29882-6A7E-4B7D-8B37-571852D6E5B7',
  projectName: 'Park cleaning',
  projectCode: 'XCT12',
  projectTypeName: 'MAINTENANCE',
  projectTypeCode: 'MAINT',
  supervisingTeam: 'Team Lincoln',
  date: '2025-01-02',
  startTime: '11:00',
  endTime: '12:00',
  offender: mockOffender,
  providerCode: 'TR123',
  supervisingTeamCode: 'PN123',
}
