/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProjectAvailabilityDto = {
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    endDateExclusive?: string | null;
    endTime?: string | null;
    frequency?: 'ONCE' | 'WEEKLY' | 'FORTNIGHTLY';
    startDateInclusive?: string | null;
    startTime?: string | null;
};

