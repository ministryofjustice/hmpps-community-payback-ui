import path from 'path'
import { readFile } from 'node:fs/promises'
import { mkdir, writeFile } from 'fs/promises'
import Project from './project'
import PersonOnProbation from './personOnProbation'

const DELIUS_DATA_FILE_NAME = 'delius-data.json'
const DELIUS_DATA_DIRECTORY = 'tmp'

export interface AppointmentTestData {
  project: Project
  person: PersonOnProbation
}

export default class DeliusTestData {
  project: Project

  pops: PersonOnProbation[]

  constructor(project: Project, pops: PersonOnProbation[]) {
    this.project = project
    this.pops = pops
  }
}

export async function readDeliusData(index: number): Promise<AppointmentTestData> {
  const outDir = path.join(process.cwd(), DELIUS_DATA_DIRECTORY)
  const outFile = path.join(outDir, DELIUS_DATA_FILE_NAME)

  const raw = await readFile(outFile, 'utf-8')
  const deliusTestData = JSON.parse(raw) as DeliusTestData
  const pop = deliusTestData.pops[index]
  const person = new PersonOnProbation(pop.firstName, pop.lastName, pop.crn)
  return { project: deliusTestData.project, person }
}

export async function writeDeliusData(deliusTestData: DeliusTestData) {
  const outDir = path.join(process.cwd(), DELIUS_DATA_DIRECTORY)
  const outFile = path.join(outDir, DELIUS_DATA_FILE_NAME)
  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, JSON.stringify(deliusTestData, null, 2), 'utf-8')
}
