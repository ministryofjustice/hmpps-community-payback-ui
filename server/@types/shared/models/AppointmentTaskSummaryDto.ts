/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentSummaryDto } from './AppointmentSummaryDto';
export type AppointmentTaskSummaryDto = {
    /**
     * The unique identifier for the appointment task
     */
    taskId: string;
    /**
     * Summary details of the appointment associated with this task
     */
    appointment: AppointmentSummaryDto;
};

