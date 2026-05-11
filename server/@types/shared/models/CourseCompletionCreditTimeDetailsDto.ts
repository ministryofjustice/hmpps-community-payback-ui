/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CourseCompletionCreditTimeDetailsDto = {
    deliusEventNumber: number;
    /**
     * NDelius appointment ID to update
     */
    appointmentIdToUpdate?: number | null;
    date: string;
    minutesToCredit: number;
    contactOutcomeCode: string;
    projectCode: string;
    notes?: string | null;
    alertActive?: boolean | null;
    sensitive?: boolean | null;
};

