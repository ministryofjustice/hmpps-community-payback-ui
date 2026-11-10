/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocationDto } from './LocationDto';
export type ProjectOutcomeSummaryDto = {
    /**
     * Project location
     */
    location: LocationDto;
    /**
     * Number of appointments overdue
     */
    numberOfAppointmentsOverdue: number;
    /**
     * Oldest overdue appointment (in days)
     */
    oldestOverdueAppointmentInDays: number;
    /**
     * Project code
     */
    projectCode: string;
    /**
     * Project name
     */
    projectName: string;
};

