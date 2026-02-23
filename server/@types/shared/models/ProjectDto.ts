/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeneficiaryDetailsDto } from './BeneficiaryDetailsDto';
import type { LocationDto } from './LocationDto';
import type { ProjectTypeDto } from './ProjectTypeDto';
export type ProjectDto = {
    projectName: string;
    projectCode: string;
    projectType: ProjectTypeDto;
    providerCode: string;
    teamCode: string;
    location: LocationDto;
    hiVisRequired: boolean;
    beneficiaryDetails: BeneficiaryDetailsDto;
    expectedEndDateExclusive?: string;
    actualEndDateExclusive?: string;
};

