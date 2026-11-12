/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeneficiaryDetailsDto } from './BeneficiaryDetailsDto';
import type { LocationDto } from './LocationDto';
import type { ProjectAvailabilityDto } from './ProjectAvailabilityDto';
import type { ProjectTypeDto } from './ProjectTypeDto';
export type ProjectDto = {
    actualEndDateExclusive?: string | null;
    availability: Array<ProjectAvailabilityDto>;
    beneficiaryDetails: BeneficiaryDetailsDto;
    expectedEndDateExclusive?: string | null;
    hiVisRequired: boolean;
    location: LocationDto;
    projectCode: string;
    projectName: string;
    projectType: ProjectTypeDto;
    providerCode: string;
    providerName: string;
    teamCode: string;
    teamName: string;
};

