/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateAdjustmentDto = {
    /**
     * The date that should be recorded for the adjustment (e.g. the date of the appointment, or the current date).
     */
    adjustmentDate?: string | null;
    adjustmentReasonId: string;
    appointmentId?: string | null;
    /**
     * Adjustment minutes, must be greater than 0
     */
    minutes: number;
    /**
     * Deprecated: use `appointmentId` instead
     * @deprecated
     */
    taskId?: string | null;
    /**
     * Positive will increase minutes required. Negative will reduce minutes required.
     */
    type: 'Positive' | 'Negative';
};

