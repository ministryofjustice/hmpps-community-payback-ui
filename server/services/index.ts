import CaseSearchService from '@ministryofjustice/probation-search-frontend/service/caseSearchService'
import { dataAccess } from '../data'
import AuditService from './auditService'
import ProviderService from './providerService'
import SessionService from './sessionService'
import ReferenceDataService from './referenceDataService'
import AppointmentService from './appointmentService'
import AppointmentFormService from './forms/appointmentFormService'
import ProjectService from './projectService'
import CourseCompletionService from './courseCompletionService'
import CourseCompletionFormService from './forms/courseCompletionFormService'
import OffenderService from './offenderService'
import config from '../config'

export const services = () => {
  const {
    applicationInfo,
    auditClient,
    projectClient,
    providerClient,
    sessionClient,
    courseCompletionClient,
    referenceDataClient,
    appointmentClient,
    formClient,
    offenderClient,
    hmppsAuthClient,
  } = dataAccess()

  const referenceDataService = new ReferenceDataService(referenceDataClient)

  return {
    applicationInfo,
    auditService: new AuditService(auditClient),
    providerService: new ProviderService(providerClient),
    projectService: new ProjectService(projectClient),
    sessionService: new SessionService(sessionClient),
    courseCompletionService: new CourseCompletionService(courseCompletionClient),
    referenceDataService,
    appointmentService: new AppointmentService(appointmentClient),
    appointmentFormService: new AppointmentFormService(formClient),
    courseCompletionFormService: new CourseCompletionFormService(formClient),
    offenderService: new OffenderService(offenderClient, referenceDataService),
    personSearchService: new CaseSearchService({
      hmppsAuthClient,
      environment: {
        searchApi: {
          url: config.apis.probationOffenderSearchApi.url,
          timeout: config.apis.probationOffenderSearchApi.timeout.response,
        },
      },
    }),
  }
}

export type Services = ReturnType<typeof services>
