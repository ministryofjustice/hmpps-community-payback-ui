/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommunityCampusPduDto } from './CommunityCampusPduDto';
export type EteCourseCompletionEventDto = {
    /**
     * Number of attempts made to complete the course. Will be > 0
     */
    attempts?: number | null;
    /**
     * Date the course was completed
     */
    completionDateTime: string;
    /**
     * Name of the course
     */
    courseName: string;
    /**
     * Type of course
     */
    courseType: string;
    /**
     * Date of birth
     */
    dateOfBirth: string;
    /**
     * Email address
     */
    email: string;
    /**
     * Expected time for the course in minutes
     */
    expectedTimeMinutes: number;
    /**
     * External reference identifier
     */
    externalReference: string;
    /**
     * First name of the PoP
     */
    firstName: string;
    /**
     * Id
     */
    id: string;
    /**
     * The Date/Time that the record was imported into the CAS database
     */
    importedOn: string;
    /**
     * Last name of the PoP
     */
    lastName: string;
    /**
     * The office that the Person on Probation (PoP) is associated with
     */
    office: string;
    pdu: CommunityCampusPduDto;
    /**
     * Course provider name
     */
    provider: string;
    /**
     * Region where the course was completed
     */
    region: string;
    /**
     * If a resolution exists for this course completion
     */
    resolved: boolean;
    /**
     * Status of the course completion
     */
    status: 'Passed' | 'Failed';
    /**
     * Total time spent on the course in minutes
     */
    totalTimeMinutes: number;
};

