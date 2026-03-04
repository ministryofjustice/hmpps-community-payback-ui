/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProjectAvailabilityDto = {
    frequency?: 'ONCE' | 'WEEKLY' | 'FORTNIGHTLY';
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startDateInclusive?: string;
    endDateExclusive?: string;
};

