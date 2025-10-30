/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GradeDto } from './GradeDto';
import type { NameDto } from './NameDto';
export type SupervisorSummaryDto = {
    /**
     * Supervisor code
     */
    code: string;
    name: NameDto;
    /**
     * Supervisor name and grade. Deprecated, instead use individual elements in 'name' and 'grade'
     * @deprecated
     */
    fullName: string;
    grade?: GradeDto;
};

