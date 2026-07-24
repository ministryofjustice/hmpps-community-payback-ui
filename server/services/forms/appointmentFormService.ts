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
   * The appointment version from Delius
   */
  deliusVersion?: string
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
  appointments?: Array<{ id: number; deliusVersion: string }>
  projectTeam: ProviderTeamSummaryDto
  project: {
    code: string
    name: string
  }
  date: string
} & BodyWithNotes

export type CreateAppointmentForm = Omit<AppointmentOutcomeForm, 'deliusVersion'> & {
  crn: string
  requirement: string
  date: string
  deliusEventNumber?: string
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
    date: string,
    username: string,
    query: Record<string, string>,
  ): Promise<Form<AppointmentOutcomeForm>> {
    const form = {
      key: this.getFormKey(randomUUID()),
      data: {
        ...this.projectData(project),
        originalSearch: query,
        projectTeam: { code: project.teamCode, name: project.teamName },
        project: { code: project.projectCode, name: project.projectName },
        date,
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }

  async createUpdateAppointmentForm(
    appointment: AppointmentDto,
    project: ProjectDto,
    username: string,
    query: Record<string, string>,
  ): Promise<Form<AppointmentOutcomeForm>> {
    const form = {
      key: this.getFormKey(randomUUID()),
      data: {
        ...this.projectData(project),
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
        date: appointment.date,
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }

  async createNewAppointmentForm(
    username: string,
    query: Record<string, string>,
    crn: string,
    requirement: string,
    project: ProjectDto,
    date: string,
  ): Promise<Form<CreateAppointmentForm>> {
    const form = {
      key: this.getFormKey(randomUUID()),
      data: {
        ...this.projectData(project),
        originalSearch: query,
        crn,
        requirement,
        date,
      },
    }

    await this.saveForm(form.key.id, username, form.data)

    return form
  }

  private projectData(project: ProjectDto): Pick<AppointmentOutcomeForm, 'project' | 'projectTeam'> {
    return {
      projectTeam: { code: project.teamCode, name: project.teamName },
      project: { code: project.projectCode, name: project.projectName },
    }
  }
}
