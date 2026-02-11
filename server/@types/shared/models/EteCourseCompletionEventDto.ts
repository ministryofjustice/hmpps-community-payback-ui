/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EteCourseCompletionEventDto = {
    /**
     * Id
     */
    id: string;
    /**
     * First name of the PoP
     */
    firstName: string;
    /**
     * Last name of the PoP
     */
    lastName: string;
    /**
     * Date of birth
     */
    dateOfBirth: string;
    /**
     * Region where the course was completed
     */
    region: string;
    /**
     * Email address
     */
    email: string;
    /**
     * Name of the course
     */
    courseName: string;
    /**
     * Type of course
     */
    courseType: string;
    /**
     * Course provider name
     */
    provider: string;
    /**
     * Date the course was completed
     */
    completionDate: string;
    /**
     * Status of the course completion
     */
    status: 'COMPLETED' | 'FAILED';
    /**
     * Total time spent on the course in minutes
     */
    totalTimeMinutes: number;
    /**
     * Expected time for the course in minutes
     */
    expectedTimeMinutes: number;
    /**
     * Number of attempts made to complete the course. Will be > 0
     */
    attempts?: number;
    /**
     * External reference identifier
     */
    externalReference: string;
};

