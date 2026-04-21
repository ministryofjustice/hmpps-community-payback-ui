import {
  AppointmentDto,
  PagedModelAppointmentSummaryDto,
  PagedModelAppointmentTaskSummaryDto,
  UpdateAppointmentOutcomeDto,
} from '../@types/shared'
import AppointmentClient, { GetAppointmentsRequest } from '../data/appointmentClient'
import config from '../config'

import { AppointmentRequest, GetAppointmentTasksParams, GetProjectRequest } from '../@types/user-defined'
import DateTimeFormats from '../utils/dateTimeUtils'
import { PAGE_SIZE, apiPageNumber, uiPageNumber } from '../utils/paginationUtils'

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

  async getAppointmentTasks(request: GetAppointmentTasksParams): Promise<PagedModelAppointmentTaskSummaryDto> {
    const { page, sortBy, sortDirection, size, ...params } = request
    const sort = [`${sortBy ?? 'createdAt'},${sortDirection ?? 'asc'}`]

    const appointmentTasks = await this.appointmentClient.getAppointmentTasks({
      ...params,
      sort,
      page: apiPageNumber(page),
      size: size ?? PAGE_SIZE,
    })

    return {
      ...appointmentTasks,
      page: { ...appointmentTasks.page, number: uiPageNumber(appointmentTasks.page) },
    } as PagedModelAppointmentTaskSummaryDto
  }

  completeAppointmentTask(username: string, taskId: string): Promise<void> {
    return this.appointmentClient.completeAppointmentTask(username, taskId)
  }
}
