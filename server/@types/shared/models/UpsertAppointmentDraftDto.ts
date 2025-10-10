/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendanceDataDto } from './AttendanceDataDto';
import type { EnforcementDto } from './EnforcementDto';
export type UpsertAppointmentDraftDto = {
    crn: string;
    projectName: string;
    projectCode: string;
    projectTypeId: string;
    supervisingTeamCode?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    attendanceData?: AttendanceDataDto;
    enforcementData?: EnforcementDto;
    notes?: string;
    deliusLastUpdatedAt: string;
};

