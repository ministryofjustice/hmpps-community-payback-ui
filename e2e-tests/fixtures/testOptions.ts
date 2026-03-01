import { AppointmentTestData } from '../delius/deliusTestData'
import PersonOnProbation from '../delius/personOnProbation'
import Project from '../delius/project'

export interface AppointmentTestOptions {
  testData: AppointmentTestData
}

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
  testCount: number
  personOnProbation: PersonOnProbation
  project: Project
  placementType: 'group' | 'individual'
}

export interface Team {
  name: string
  provider: string
  supervisor: string
}
