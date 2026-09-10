/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonalCircumstancesCodeDto } from './PersonalCircumstancesCodeDto';
export type PersonalCircumstancesDto = {
    type: PersonalCircumstancesCodeDto;
    subType?: (PersonalCircumstancesCodeDto | null);
    startDate: string;
    endDate?: string | null;
    verified?: boolean | null;
    notes?: string | null;
};

