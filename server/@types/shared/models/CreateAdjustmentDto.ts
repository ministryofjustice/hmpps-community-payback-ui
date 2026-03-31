/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateAdjustmentDto = {
    taskId: string;
    type: 'Positive' | 'Negative';
    minutes: number;
    dateOfAdjustment: string;
    adjustmentReasonId: string;
};

