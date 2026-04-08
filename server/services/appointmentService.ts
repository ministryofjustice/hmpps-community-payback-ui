import {
  AppointmentDto,
  PagedModelAppointmentSummaryDto,
  PagedModelAppointmentTaskSummaryDto,
  UpdateAppointmentOutcomeDto,
} from '../@types/shared'
import AppointmentClient, { GetAppointmentsRequest, GetAppointmentTasksRequest } from '../data/appointmentClient'
import config from '../config'

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
    const fromDate = DateTimeFormats.getTodaysDatePlusDays(-config.individualPlacementsOverdueDays).formattedDate
    return this.appointmentClient.getAppointments(username, {
      projectCodes: [projectCode],
      outcomeCodes: ['NO_OUTCOME'],
      toDate: today,
      fromDate,
    })
  }

  getAppointments(username: string, params: GetAppointmentsRequest): Promise<PagedModelAppointmentSummaryDto> {
    return this.appointmentClient.getAppointments(username, params)
  }

  getAppointmentTasks(
    username: string,
    params: GetAppointmentTasksRequest,
  ): Promise<PagedModelAppointmentTaskSummaryDto> {
    return this.appointmentClient.getAppointmentTasks(username, params)
  }
}
