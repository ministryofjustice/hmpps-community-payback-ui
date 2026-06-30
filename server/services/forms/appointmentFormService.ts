import { randomUUID } from 'crypto'
import { AppointmentDto, ContactOutcomeDto, ProviderTeamSummaryDto, SupervisorSummaryDto } from '../../@types/shared'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import FormClient, { FormKey } from '../../data/formClient'
import BaseFormService from './baseFormService'

export const APPOINTMENT_UPDATE_FORM_TYPE = 'APPOINTMENT_UPDATE_ADMIN'

export interface Form {
  key: FormKey
  data: AppointmentOutcomeForm
}

export default class AppointmentFormService extends BaseFormService<AppointmentOutcomeForm> {
  constructor(formClient: FormClient) {
    super(formClient, APPOINTMENT_UPDATE_FORM_TYPE)
  }

  async createBulkForm(username: string, query: Record<string, string>): Promise<Form> {
    const form = {
      key: this.getFormKey(randomUUID()),
      data: {
        originalSearch: query,
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }

  async createForm(appointment: AppointmentDto, username: string, query: Record<string, string>): Promise<Form> {
    const form = {
      key: this.getFormKey(randomUUID()),
      data: {
        deliusVersion: appointment.version,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        contactOutcome: {
          code: appointment.contactOutcomeCode,
        } as ContactOutcomeDto,
        attendanceData: appointment.attendanceData,
        team: {
          code: appointment.supervisingTeamCode,
        } as ProviderTeamSummaryDto,
        supervisor: {
          code: appointment.supervisorOfficerCode,
        } as SupervisorSummaryDto,
        sensitive: appointment.sensitive,
        originalSearch: query,
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }
}
