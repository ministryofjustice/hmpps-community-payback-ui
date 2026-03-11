import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { createCommunityEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import {
  allocateCurrentCaseToUpwProject,
  setAllocationOutcome,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import { createUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/create-upw-project'
import fs from 'fs'
import path from 'path'
import test from '../fixtures/test'
import loadSeedData, { SeedData } from '../utils/seed_utils'

const seedDataPath = process.env.SEED_DATA_PATH
const timeout = process.env.TIMEOUT_INTERVAL || 3600000 // One hour (or ~50 offenders)
test.setTimeout(Number(timeout))

const outputFile = path.join(__dirname, '../test_results/offenders.csv')

if (seedDataPath) {
  if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  }
  fs.writeFileSync(outputFile, 'Region,Project,CRN,Rescheduled?,Pickup Location\n')

  const seedData: SeedData = loadSeedData(seedDataPath)

  seedData.seed_data.forEach(regionData => {
    test.describe(`Region: ${regionData.region} - Team: ${regionData.team.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await deliusLogin(page)
      })

      for (const project of regionData.projects) {
        test(`Processing ${project.projectName}`, async ({ page }) => {
          await test.step(`Creating project ${project.projectName}`, async () => {
            await createUpwProject(page, {
              projectName: project.projectName,
              providerName: regionData.team.provider,
              teamName: regionData.team.name,
              projectType: project.projectType,
              pickupPoint: project.pickupPoint,
              projectAvailability: {
                startTime: project.startTime,
                endTime: project.endTime,
              },
            })
          })
          for (let index = 0; index < project.allocations.count; index += 1) {
            // eslint-disable-next-line no-await-in-loop
            await test.step(`Offender ${index}`, async () => {
              const crn = await test.step(`Creating offender ${index}`, async () => {
                const person = deliusPerson()
                return createOffender(page, {
                  person,
                  providerName: regionData.region,
                })
              })
              await test.step(`Creating community event for ${crn} on ${regionData.team.name}`, async () => {
                await createCommunityEvent(page, { crn, allocation: { team: regionData.team } })
              })
              await test.step(`Creating requirement for ${crn}`, async () => {
                await createRequirementForEvent(page, {
                  crn,
                  requirement: {
                    category: 'Unpaid Work',
                    subCategory: 'Regular',
                    length: '4',
                  },
                  team: regionData.team,
                })
              })
              await page.locator('a', { hasText: 'Personal Details' }).click()
              const hasPickupPoint =
                Math.random() < project.allocations.percentage_with_pickup_specified ? project.pickupPoint : null
              await test.step(`Allocating ${crn} to ${project.projectName}`, async () => {
                await allocateCurrentCaseToUpwProject(page, {
                  crn,
                  providerName: regionData.team.provider,
                  projectName: project.projectName,
                  teamName: regionData.team.name,
                  startTime: project.startTime,
                  endTime: project.endTime,
                  pickupPoint: hasPickupPoint,
                  projectType: project.projectType,
                })
              })
              const isRescheduled = Math.random() < project.allocations.percentage_that_are_rescheduled
              if (isRescheduled) {
                await setAllocationOutcome(page, { crn, contactOutcome: 'Rescheduled - Service Request' })
              }
              fs.appendFileSync(
                outputFile,
                `${regionData.region},${project.projectName},${crn},${isRescheduled},${hasPickupPoint || ''}\n`,
              )
            })
          }
        })
      }
    })
  })
} else {
  test.describe('Seed Data', () => {
    test('Seed data from YAML (skipped)', async () => {
      test.skip(true, 'SEED_DATA_PATH environment variable is not configured')
    })
  })
}
