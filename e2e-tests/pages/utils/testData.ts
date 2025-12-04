import path from 'path'
import { readFile } from 'node:fs/promises'

export interface DeliusTestData {
  project: UpwProject
  crns: string[]
}

export interface UpwProject {
  projectName: string
  projectCode: string
}

export async function readDeliusData(): Promise<DeliusTestData> {
  const outDir = path.join(process.cwd(), 'tmp')
  const outFile = path.join(outDir, 'delius-data.json')

  const raw = await readFile(outFile, 'utf-8')
  return JSON.parse(raw) as DeliusTestData
}
