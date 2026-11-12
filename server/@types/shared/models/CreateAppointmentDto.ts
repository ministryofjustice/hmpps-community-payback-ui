/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendanceDataDto } from './AttendanceDataDto';
export type CreateAppointmentDto = {
    /**
     * If the corresponding delius contact should be alerted
     */
    alertActive?: boolean | null;
    allocationId?: number | null;
    attendanceData?: (AttendanceDataDto | null);
    contactOutcomeCode?: string | null;
    crn: string;
    date: string;
    deliusEventNumber: number;
    /**
     * The end local time of the appointment
     */
    endTime: string;
    notes?: string | null;
    pickUpLocationCode?: string | null;
    pickUpTime?: string | null;
    projectCode: string;
    /**
     * If the corresponding delius contact should be marked as sensitive
     */
    sensitive?: boolean | null;
    /**
     * The start local time of the appointment
     */
    startTime: string;
    /**
     * Will default to the unallocated supervisor for the project's team if not defined
     */
    supervisorOfficerCode?: string | null;
};

