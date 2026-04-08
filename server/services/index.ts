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

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    projectClient,
    providerClient,
    sessionClient,
    courseCompletionClient,
    referenceDataClient,
    appointmentClient,
    formClient,
    offenderClient,
  } = dataAccess()

  const referenceDataService = new ReferenceDataService(referenceDataClient)

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    providerService: new ProviderService(providerClient),
    projectService: new ProjectService(projectClient),
    sessionService: new SessionService(sessionClient),
    courseCompletionService: new CourseCompletionService(courseCompletionClient),
    referenceDataService,
    appointmentService: new AppointmentService(appointmentClient),
    appointmentFormService: new AppointmentFormService(formClient),
    courseCompletionFormService: new CourseCompletionFormService(formClient),
    offenderService: new OffenderService(offenderClient, referenceDataService),
  }
}

export type Services = ReturnType<typeof services>
