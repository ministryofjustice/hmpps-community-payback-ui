/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseCompletionCreditTimeDetailsDto } from './CourseCompletionCreditTimeDetailsDto';
export type CourseCompletionResolutionDto = {
    type: 'CREDIT_TIME' | 'COURSE_ALREADY_COMPLETED_WITHIN_THRESHOLD';
    crn?: string;
    /**
     * Must be provided if type is 'CREDIT_TIME'
     */
    creditTimeDetails?: CourseCompletionCreditTimeDetailsDto;
};

