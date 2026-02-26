import { AppointmentTestData } from '../delius/deliusTestData'

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
}

export interface Team {
  name: string
  provider: string
  supervisor: string
}
