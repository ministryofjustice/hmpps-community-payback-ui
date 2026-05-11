/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentSummaryDto } from './AppointmentSummaryDto';
import type { OffenderFullDto } from './OffenderFullDto';
import type { OffenderLimitedDto } from './OffenderLimitedDto';
import type { OffenderNotFoundDto } from './OffenderNotFoundDto';
export type AppointmentTaskSummaryDto = {
    /**
     * The unique identifier for the appointment task
     */
    taskId: string;
    /**
     * Deprecated: use top-level properties of this response instead.
     *
     * Summary details of the appointment associated with this task
     * @deprecated
     */
    appointment: AppointmentSummaryDto;
    offender: (OffenderFullDto | OffenderLimitedDto | OffenderNotFoundDto);
    /**
     * The date of the appointment.
     */
    date?: string | null;
    /**
     * The name of the project attended in this appointment.
     */
    projectTypeName?: string | null;
};

