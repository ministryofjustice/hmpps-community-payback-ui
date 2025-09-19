import { dataAccess } from '../data'
import AuditService from './auditService'
import ProviderService from './providerService'
import ReferenceDataService from './referenceDataService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, providerClient, referenceDataClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    providerService: new ProviderService(providerClient),
    referenceDataService: new ReferenceDataService(referenceDataClient),
  }
}

export type Services = ReturnType<typeof services>
