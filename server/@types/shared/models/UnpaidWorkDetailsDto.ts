/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourtDto } from './CourtDto';
import type { MainOffenceDto } from './MainOffenceDto';
export type UnpaidWorkDetailsDto = {
    eventNumber: number;
    sentenceDate: string;
    requiredMinutes: number;
    completedMinutes: number;
    adjustments: number;
    /**
     * The total number of minutes that can be credited to ETE appointments
     */
    allowedEteMinutes: number;
    /**
     * The total number of minutes credited to ETE appointments
     */
    completedEteMinutes: number;
    /**
     * The total number of remaining minutes that can be credited to ETE appointments
     */
    remainingEteMinutes: number;
    eventOutcome: string;
    upwStatus?: string;
    referralDate: string;
    convictionDate: string;
    court: CourtDto;
    mainOffence: MainOffenceDto;
};

