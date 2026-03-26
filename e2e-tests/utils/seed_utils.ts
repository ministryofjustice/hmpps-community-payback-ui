import fs from 'fs'
import yaml from 'js-yaml'
import { Team } from '../fixtures/testOptions'

export interface SeedData {
  seed_data: RegionData[]
}
export interface RegionData {
  region: string
  team: Team
  projects: ProjectData[]
}

export interface ProjectData {
  projectName: string
  projectType: string
  pickupPoint: string
  startTime: string
  endTime: string
  allocations: AllocationData
}

export interface AllocationData {
  count: number
  percentage_with_pickup_specified: number
  percentage_that_are_rescheduled: number
}

export const uniqueProjectName = (projectNamePrefix: string) => {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${projectNamePrefix} ${year}${month}${day}-${hours}${minutes}`
}

// YAML loading function
const loadSeedData = (seedDataPath: string): SeedData => {
  if (!fs.existsSync(seedDataPath)) {
    throw new Error(`Seed data file not found at ${seedDataPath}`)
  }

  const fileContents = fs.readFileSync(seedDataPath, 'utf8')
  return yaml.load(fileContents) as SeedData
}

export default loadSeedData
