import { test as base, Page } from '@playwright/test'
import { createUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/create-upw-project'
import { login } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import DateTimeUtils from '../utils/DateTimeUtils'
import { PlacementType, Team } from './testOptions'
import Project from '../delius/project'
import getProjectType from '../delius/projectType'

interface ProjectFixtureSetup {
  page: Page
  team: Team
  placementType: PlacementType
}

interface ProjectCache {
  group?: Project
  individual?: Project
  ete?: Project
}

/*
 * Create a cache for storing the retrieved project from Delius
 */
const projectCache: ProjectCache = {}

export default async ({ page, team, placementType }: ProjectFixtureSetup): Promise<Project> => {
  const projectFixture = await base.step(`Creating UPW ${placementType} placement project`, async () => {
    await login(page)

    const startDate = new Date()
    // allow incomplete appointments to be rescheduled a week later
    const endDate = DateTimeUtils.plusDays(startDate, 8)

    if (projectCache[placementType]) {
      /*
       * If a project has been created for this run of tests
       * return the test from memory
       *
       * This works by declaring a variable in the outer scope
       * As module variables are cached per process in node
       * our playwright tests will have access to the same value
       * saved from the previous test
       */

      return base.step(`Using project from cache: ${projectCache[placementType].name}`, async () => {
        return projectCache[placementType]
      })
    }
    const project = await base.step(`Creating fresh project`, async () => {
      return createUpwProject(page, {
        providerName: team.provider,
        teamName: team.name,
        endDate,
        projectAvailability: {
          startDate,
          endDate,
        },
        ...getProjectType(placementType),
      })
    })

    await base.step(`Caching project: ${project.projectName}`, async () => {
      projectCache[placementType] = {
        name: project.projectName,
        code: project.projectCode,
        availability: {
          startTime: project.projectAvailability.startTime,
          endTime: project.projectAvailability.endTime,
        },
      }
    })

    return projectCache[placementType]
  })

  return projectFixture
}
