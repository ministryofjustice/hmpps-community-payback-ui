/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeneficiaryDetailsDto } from './BeneficiaryDetailsDto';
import type { LocationDto } from './LocationDto';
import type { ProjectAvailabilityDto } from './ProjectAvailabilityDto';
import type { ProjectTypeDto } from './ProjectTypeDto';
export type ProjectDto = {
    projectName: string;
    projectCode: string;
    projectType: ProjectTypeDto;
    providerName: string;
    providerCode: string;
    teamName: string;
    teamCode: string;
    location: LocationDto;
    hiVisRequired: boolean;
    beneficiaryDetails: BeneficiaryDetailsDto;
    expectedEndDateExclusive?: string | null;
    actualEndDateExclusive?: string | null;
    availability: Array<ProjectAvailabilityDto>;
};

