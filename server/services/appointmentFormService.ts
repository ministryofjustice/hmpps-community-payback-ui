import { randomUUID } from 'crypto'
import { AppointmentDto, ContactOutcomeDto, FormKeyDto, SupervisorSummaryDto } from '../@types/shared'
import { AppointmentOutcomeForm } from '../@types/user-defined'
import FormClient from '../data/formClient'

export const APPOINTMENT_UPDATE_FORM_TYPE = 'APPOINTMENT_UPDATE_ADMIN'

export interface Form {
  key: FormKeyDto
  data: AppointmentOutcomeForm
}

export default class AppointmentFormService {
  constructor(private readonly formClient: FormClient) {}

  getForm(formId: string, username: string): Promise<AppointmentOutcomeForm> {
    const formKey = this.getFormKey(formId)
    return this.formClient.find<AppointmentOutcomeForm>(formKey, username)
  }

  async saveForm(formId: string, username: string, data: AppointmentOutcomeForm) {
    const formKey = this.getFormKey(formId)

    return this.formClient.save(formKey, username, data)
  }

  createForm(appointment: AppointmentDto): Form {
    return {
      key: this.getFormKey(randomUUID()),
      data: {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        contactOutcome: {
          code: appointment.contactOutcomeCode,
        } as ContactOutcomeDto,
        attendanceData: appointment.attendanceData,
        supervisor: {
          code: appointment.supervisorOfficerCode,
        } as SupervisorSummaryDto,
      },
    }
  }

  getFormKey(id: string): FormKeyDto {
    return {
      id,
      type: APPOINTMENT_UPDATE_FORM_TYPE,
    }
  }
}
