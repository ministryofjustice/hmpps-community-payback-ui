/* eslint no-console: "off" -- we want to print out the created events  */
/* eslint no-await-in-loop: "off" -- this is easier to read */

import test from '../../fixtures/test'
import loadSeedData, { SeedData } from '../../utils/seed_utils'
import sendCourseCompletionMessage from '../../steps/sendCourseCompletionMessage'

const seedDataPath = process.env.SEED_DATA_PATH

if (seedDataPath) {
  const seedData: SeedData = loadSeedData(seedDataPath)

  seedData.seed_data.forEach(regionData => {
    const courseCount = regionData.course_completions.length
    test(`Creating ${courseCount} course completions for offender in Region: ${regionData.region} - Team: ${regionData.team.name}`, async ({
      eteExternalApiClient,
      personOnProbation,
    }) => {
      console.log(`Course completion details:`)
      for (const projectName of regionData.course_completions) {
        await sendCourseCompletionMessage({ eteExternalApiClient, team: regionData.team, personOnProbation })
        console.log(`- ${projectName}`)
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
