/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateAdjustmentDto = {
    /**
     * Deprecated: use `appointmentId` instead
     * @deprecated
     */
    taskId?: string | null;
    /**
     * Positive will increase minutes required. Negative will reduce minutes required.
     */
    type: 'Positive' | 'Negative';
    /**
     * Adjustment minutes, must be greater than 0
     */
    minutes: number;
    adjustmentReasonId: string;
    /**
     * The date that should be recorded for the adjustment (e.g. the date of the appointment, or the current date).
     */
    adjustmentDate?: string | null;
    appointmentId?: string | null;
};

