/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OffenderFullDto } from './OffenderFullDto';
import type { OffenderLimitedDto } from './OffenderLimitedDto';
import type { OffenderNotFoundDto } from './OffenderNotFoundDto';
export type AppointmentTaskSummaryDto = {
    /**
     * The date of the appointment.
     */
    date?: string | null;
    /**
     * The id of the appointment in Delius.
     */
    deliusAppointmentId: number;
    offender: (OffenderFullDto | OffenderLimitedDto | OffenderNotFoundDto);
    /**
     * The project code of the appointment.
     */
    projectCode: string;
    /**
     * The name of the project attended in this appointment.
     */
    projectTypeName?: string | null;
    /**
     * The unique identifier for the appointment task
     */
    taskId: string;
};

