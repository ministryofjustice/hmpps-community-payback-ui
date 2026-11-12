/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CourseCompletionCreditTimeDetailsDto = {
    alertActive?: boolean | null;
    /**
     * NDelius appointment ID to update
     */
    appointmentIdToUpdate?: number | null;
    contactOutcomeCode: string;
    date: string;
    deliusEventNumber: number;
    minutesToCredit: number;
    notes?: string | null;
    projectCode: string;
    sensitive?: boolean | null;
};

