import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { AppointmentDto } from '../@types/shared/models/AppointmentDto'
import { PagedModelAppointmentSummaryDto, UpdateAppointmentOutcomeDto } from '../@types/shared'
import { PagedRequest, ProjectTypeGroup } from '../@types/user-defined'
import { createQueryString } from '../utils/utils'

export type GetAppointmentsRequest = {
  crn?: string
  projectCodes?: Array<string>
  fromDate?: string
  toDate?: string
  outcomeCodes?: Array<AppointmentFilterOutcomeCode>
  projectTypeGroup?: ProjectTypeGroup
} & PagedRequest

// This can also be a valid contact outcome code
// but at the moment we are only searching for NO_OUTCOME
type AppointmentFilterOutcomeCode = 'NO_OUTCOME'

export default class AppointmentClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('sessionAllocationClient', config.apis.communityPaybackApi, logger, authenticationClient)
  }

  async getAppointments(username: string, params: GetAppointmentsRequest): Promise<PagedModelAppointmentSummaryDto> {
    const query = createQueryString(params)

    const path = paths.appointments.filter.pattern
    return (await this.get({ path, query }, asSystem(username))) as PagedModelAppointmentSummaryDto
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
