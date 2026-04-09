/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseCompletionCreditTimeDetailsDto } from './CourseCompletionCreditTimeDetailsDto';
import type { CourseCompletionDontCreditTimeDetailsDto } from './CourseCompletionDontCreditTimeDetailsDto';
export type CourseCompletionResolutionDto = {
    type: 'CREDIT_TIME' | 'DONT_CREDIT_TIME';
    crn?: string;
    /**
     * Must be provided if type is 'CREDIT_TIME'
     */
    creditTimeDetails?: CourseCompletionCreditTimeDetailsDto;
    /**
     * Must be provided if type is 'DONT_CREDIT_TIME'
     */
    dontCreditTimeDetails?: CourseCompletionDontCreditTimeDetailsDto;
};

