import PersonOnProbation from '../delius/personOnProbation'
import Project from '../delius/project'

export interface TestOptions {
  eteExternalApiClient: {
    enabled: boolean
    apiKey: string
    certBase64: string
    privateKeyBase64: string
    url: string
  }
  deliusUser: {
    username: string
    password: string
  }
  team: Team
  isLoggedInToDelius: boolean
  personOnProbation: PersonOnProbation
  groupSession: { peopleOnProbation: Array<PersonOnProbation>; date: Date }
  groupSessionCount: number
  project: Project
  placementType: PlacementType
  appointment: { date: Date }
  e2eProjects: Array<string>
}

export type PlacementType = 'group' | 'individual' | 'ete'

export interface Team {
  name: string
  provider: string
  supervisor: string
  pdu: string
}
