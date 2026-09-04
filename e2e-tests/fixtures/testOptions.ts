import PersonOnProbation from '../delius/personOnProbation'
import Project from '../delius/project'
import DeliusUser from '../delius/deliusUser'
import Appointment from '../delius/appointment'

export interface TestOptions {
  eteExternalApiClient: {
    enabled: boolean
    apiKey: string
    certBase64: string
    privateKeyBase64: string
    url: string
  }
  deliusUser: DeliusUser
  team: Team
  isLoggedInToDelius: boolean
  personOnProbation: PersonOnProbation
  groupSession: { peopleOnProbation: Array<PersonOnProbation>; date: Date }
  groupSessionCount: number
  project: Project
  placementType: PlacementType
  appointment: Appointment
  placeholderAppointment: Appointment
  e2eProjects: Array<string>
}

export type PlacementType = 'group' | 'individual' | 'ete' | 'induction'

export interface Team {
  name: string
  provider: string
  supervisor: string
  pdu: string
}
