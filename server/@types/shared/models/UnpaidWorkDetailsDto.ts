/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourtDto } from './CourtDto';
import type { MainOffenceDto } from './MainOffenceDto';
export type UnpaidWorkDetailsDto = {
    adjustments: number;
    /**
     * The total number of minutes that can be credited to ETE appointments
     */
    allowedEteMinutes: number;
    /**
     * The total number of minutes credited to ETE appointments
     */
    completedEteMinutes: number;
    completedMinutes: number;
    convictionDate?: string | null;
    court?: (CourtDto | null);
    eventNumber: number;
    eventOutcome: string;
    mainOffence: MainOffenceDto;
    referralDate: string;
    /**
     * The total number of remaining minutes that can be credited to ETE appointments
     */
    remainingEteMinutes: number;
    requiredMinutes: number;
    sentenceDate: string;
    upwStatus?: string | null;
};

