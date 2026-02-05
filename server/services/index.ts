import { dataAccess } from '../data'
import AuditService from './auditService'
import ProviderService from './providerService'
import SessionService from './sessionService'
import ReferenceDataService from './referenceDataService'
import AppointmentService from './appointmentService'
import AppointmentFormService from './appointmentFormService'
import ProjectService from './projectService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    projectClient,
    providerClient,
    sessionClient,
    referenceDataClient,
    appointmentClient,
    formClient,
  } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    providerService: new ProviderService(providerClient),
    projectService: new ProjectService(projectClient),
    sessionService: new SessionService(sessionClient),
    referenceDataService: new ReferenceDataService(referenceDataClient),
    appointmentService: new AppointmentService(appointmentClient),
    appointmentFormService: new AppointmentFormService(formClient),
  }
}

export type Services = ReturnType<typeof services>
