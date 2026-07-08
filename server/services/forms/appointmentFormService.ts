import { randomUUID } from 'crypto'
import {
  AppointmentDto,
  AttendanceDataDto,
  ContactOutcomeDto,
  ProjectDto,
  ProviderTeamSummaryDto,
  SupervisorSummaryDto,
} from '../../@types/shared'
import { BodyWithNotes } from '../../@types/user-defined'
import FormClient, { FormKey } from '../../data/formClient'
import BaseFormService from './baseFormService'

export const APPOINTMENT_UPDATE_FORM_TYPE = 'APPOINTMENT_UPDATE_ADMIN'

export type AppointmentOutcomeForm = {
  /**
   * The start local time of the appointment
   */
  startTime?: string
  /**
   * The end local time of the appointment
   */
  endTime?: string
  contactOutcome?: ContactOutcomeDto
  supervisor?: SupervisorSummaryDto
  supervisingTeam?: ProviderTeamSummaryDto
  attendanceData?: AttendanceDataDto
  originalSearch: Record<string, string>
  projectTeam: ProviderTeamSummaryDto
  project: {
    code: string
    name: string
  }
} & BodyWithNotes

export type UpdateSessionForm = AppointmentOutcomeForm & {
  appointments?: Array<{ id: number; deliusVersion: string }>
}

export type UpdateAppointmentForm = AppointmentOutcomeForm & {
  /**
   * The appointment version from Delius
   */
  deliusVersion?: string
}

export interface Form<T extends AppointmentOutcomeForm> {
  key: FormKey
  data: T
}

export default class AppointmentFormService extends BaseFormService<AppointmentOutcomeForm> {
  constructor(formClient: FormClient) {
    super(formClient, APPOINTMENT_UPDATE_FORM_TYPE)
  }

  async createBulkForm(
    project: ProjectDto,
    username: string,
    query: Record<string, string>,
  ): Promise<Form<UpdateSessionForm>> {
    const form = {
      key: this.getFormKey(randomUUID()),
      data: {
        originalSearch: query,
        projectTeam: { code: project.teamCode, name: project.teamName },
        project: { code: project.projectCode, name: project.projectName },
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }

  async createForm(
    appointment: AppointmentDto,
    project: ProjectDto,
    username: string,
    query: Record<string, string>,
  ): Promise<Form<UpdateAppointmentForm>> {
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
        supervisingTeam: {
          code: appointment.supervisingTeamCode,
        } as ProviderTeamSummaryDto,
        supervisor: {
          code: appointment.supervisorOfficerCode,
        } as SupervisorSummaryDto,
        sensitive: appointment.sensitive,
        originalSearch: query,
        projectTeam: { code: project.teamCode, name: project.teamName },
        project: { code: project.projectCode, name: project.projectName },
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }
}
