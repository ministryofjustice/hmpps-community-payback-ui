import { AppointmentTestData } from '../delius/deliusTestData'
import PersonOnProbation from '../delius/personOnProbation'

export interface AppointmentTestOptions {
  testData: AppointmentTestData
}

export interface TestOptions {
  deliusUser: {
    username: string
    password: string
  }
  team: Team
  testCount: number
  canCreateNewPops: boolean
  existingPops: Array<PersonOnProbation>
}

export interface Team {
  name: string
  provider: string
  supervisor: string
}
