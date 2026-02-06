import { AppointmentDto, PagedModelAppointmentSummaryDto, UpdateAppointmentOutcomeDto } from '../@types/shared'
import AppointmentClient from '../data/appointmentClient'

import { AppointmentRequest, GetProjectRequest } from '../@types/user-defined'
import DateTimeFormats from '../utils/dateTimeUtils'

export default class AppointmentService {
  constructor(private readonly appointmentClient: AppointmentClient) {}

  async getAppointment({ projectCode, appointmentId, username }: AppointmentRequest): Promise<AppointmentDto> {
    const appointment = await this.appointmentClient.find(username, projectCode, appointmentId)

    return appointment
  }

  async saveAppointment(
    projectCode: string,
    appointmentData: UpdateAppointmentOutcomeDto,
    username: string,
  ): Promise<void> {
    return this.appointmentClient.save(username, projectCode, appointmentData)
  }

  async getProjectAppointmentsWithMissingOutcomes({
    projectCode,
    username,
  }: GetProjectRequest): Promise<PagedModelAppointmentSummaryDto> {
    const today = DateTimeFormats.dateObjToIsoString(new Date())
    return this.appointmentClient.getAppointments(username, {
      projectCodes: [projectCode],
      outcomeCodes: ['NO_OUTCOME'],
      // Assumes an outcome is 'missing' from today
      toDate: today,
    })
  }
}
