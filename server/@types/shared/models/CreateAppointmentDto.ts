/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendanceDataDto } from './AttendanceDataDto';
export type CreateAppointmentDto = {
    crn: string;
    deliusEventNumber: number;
    allocationId?: number | null;
    projectCode: string;
    date: string;
    /**
     * The start local time of the appointment
     */
    startTime: string;
    /**
     * The end local time of the appointment
     */
    endTime: string;
    pickUpLocationCode?: string | null;
    pickUpTime?: string | null;
    contactOutcomeCode?: string | null;
    attendanceData?: (AttendanceDataDto | null);
    /**
     * Will default to the unallocated supervisor for the project's team if not defined
     */
    supervisorOfficerCode?: string | null;
    notes?: string | null;
    /**
     * If the corresponding delius contact should be alerted
     */
    alertActive?: boolean | null;
    /**
     * If the corresponding delius contact should be marked as sensitive
     */
    sensitive?: boolean | null;
};

