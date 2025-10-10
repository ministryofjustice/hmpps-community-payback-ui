/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendanceDataDto } from './AttendanceDataDto';
import type { ContactOutcomeDto } from './ContactOutcomeDto';
import type { EnforcementDto } from './EnforcementDto';
export type AppointmentDraftDto = {
    id: string;
    appointmentDeliusId: number;
    crn: string;
    projectName: string;
    projectCode: string;
    projectTypeId: string;
    projectTypeName?: string;
    projectTypeCode?: string;
    supervisingTeamCode?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    attendanceData?: AttendanceDataDto;
    contactOutcome?: ContactOutcomeDto;
    enforcementData?: EnforcementDto;
    notes?: string;
    deliusLastUpdatedAt: string;
    createdAt: string;
    updatedAt: string;
};

