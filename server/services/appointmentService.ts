import {
  AppointmentDto,
  CreateAppointmentDto,
  PagedModelAppointmentSummaryDto,
  PagedModelAppointmentTaskSummaryDto,
  UpdateAppointmentDto,
  UpdateAppointmentsDto,
  UpdateAppointmentsOutcomesResultDto,
} from '../@types/shared'
import AppointmentClient, { GetAppointmentsRequest } from '../data/appointmentClient'
import config from '../config'

import { AppointmentRequest, GetAppointmentTasksRequest, GetProjectRequest } from '../@types/user-defined'
import DateTimeFormats from '../utils/dateTimeUtils'
import { uiPageNumber } from '../utils/paginationUtils'

export default class AppointmentService {
  constructor(private readonly appointmentClient: AppointmentClient) {}

  async getAppointment({ projectCode, appointmentId, username }: AppointmentRequest): Promise<AppointmentDto> {
    const appointment = await this.appointmentClient.find(username, projectCode, appointmentId)

    return appointment
  }

  async saveAppointment(projectCode: string, appointmentData: UpdateAppointmentDto, username: string): Promise<void> {
    return this.appointmentClient.save(username, projectCode, appointmentData)
  }

  saveAppointments(
    projectCode: string,
    appointmentsToUpdate: UpdateAppointmentsDto,
    username: string,
  ): Promise<UpdateAppointmentsOutcomesResultDto> {
    return this.appointmentClient.bulkUpdate(username, projectCode, appointmentsToUpdate)
  }

  createAppointment(appointmentData: CreateAppointmentDto, username: string): Promise<void> {
    return this.appointmentClient.create(username, appointmentData)
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

  async getAppointments(username: string, request: GetAppointmentsRequest): Promise<PagedModelAppointmentSummaryDto> {
    const appointmentResult = await this.appointmentClient.getAppointments(username, request)

    return {
      ...appointmentResult,
      page: { ...appointmentResult.page, number: uiPageNumber(appointmentResult.page) },
    }
  }

  async getAppointmentTasks(request: GetAppointmentTasksRequest): Promise<PagedModelAppointmentTaskSummaryDto> {
    const appointmentTasks = await this.appointmentClient.getAppointmentTasks(request)

    return {
      ...appointmentTasks,
      page: { ...appointmentTasks.page, number: uiPageNumber(appointmentTasks.page) },
    } as PagedModelAppointmentTaskSummaryDto
  }

  completeAppointmentTask(username: string, taskId: string): Promise<void> {
    return this.appointmentClient.completeAppointmentTask(username, taskId)
  }
}
