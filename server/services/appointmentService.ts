import { AppointmentDto, UpdateAppointmentOutcomeDto } from '../@types/shared'
import AppointmentClient from '../data/appointmentClient'

import { AppointmentRequest } from '../@types/user-defined'

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
}
