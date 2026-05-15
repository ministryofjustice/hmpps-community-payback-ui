/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OffenderFullDto } from './OffenderFullDto'
import type { OffenderLimitedDto } from './OffenderLimitedDto'
import type { OffenderNotFoundDto } from './OffenderNotFoundDto'
export type AppointmentTaskSummaryDto = {
  /**
   * The unique identifier for the appointment task
   */
  taskId: string
  /**
   * The id of the appointment in Delius.
   */
  deliusAppointmentId: number
  /**
   * The project code for the appointment.
   */
  projectCode: string
  /**
   * The offender details for the appointment.
   */
  offender: OffenderFullDto | OffenderLimitedDto | OffenderNotFoundDto
  /**
   * The date of the appointment.
   */
  date?: string | null
  /**
   * The name of the project attended in this appointment.
   */
  projectTypeName?: string | null
}
