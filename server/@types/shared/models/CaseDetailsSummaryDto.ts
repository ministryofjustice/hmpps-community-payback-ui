/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OffenderFullDto } from './OffenderFullDto';
import type { OffenderLimitedDto } from './OffenderLimitedDto';
import type { OffenderNotFoundDto } from './OffenderNotFoundDto';
import type { UnpaidWorkDetailsDto } from './UnpaidWorkDetailsDto';
export type CaseDetailsSummaryDto = {
    offender: (OffenderFullDto | OffenderLimitedDto | OffenderNotFoundDto);
    unpaidWorkDetails: Array<UnpaidWorkDetailsDto>;
};

