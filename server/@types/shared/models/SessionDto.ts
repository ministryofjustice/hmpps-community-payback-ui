/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentSummaryDto } from './AppointmentSummaryDto';
import type { ProjectLocationDto } from './ProjectLocationDto';
export type SessionDto = {
    projectName: string;
    projectCode: string;
    /**
     * Deprecated, use the structured location instead
     * @deprecated
     */
    projectLocation: string;
    location: ProjectLocationDto;
    date: string;
    startTime: string;
    endTime: string;
    appointmentSummaries: Array<AppointmentSummaryDto>;
};

