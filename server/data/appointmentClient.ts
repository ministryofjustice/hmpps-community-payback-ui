import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { AppointmentDto } from '../@types/shared/models/AppointmentDto'
import { UpdateAppointmentOutcomeDto } from '../@types/shared'

export default class AppointmentClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('sessionAllocationClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async find(username: string, projectCode: string, appointmentId: string): Promise<AppointmentDto> {
    const path = paths.appointments.singleAppointment({ projectCode, appointmentId })
    return (await this.get({ path }, asSystem(username))) as AppointmentDto
  }

  async save(username: string, projectCode: string, data: UpdateAppointmentOutcomeDto): Promise<void> {
    const path = paths.appointments.outcome({ projectCode, appointmentId: data.deliusId.toString() })
    return this.post({ path, data }, asSystem(username))
  }
}
