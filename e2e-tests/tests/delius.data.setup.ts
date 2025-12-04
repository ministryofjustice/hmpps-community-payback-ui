import test from '../test'
import { slow } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/common/common'
import { deliusPerson } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { login } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import { data } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/test-data/test-data'
import { createCommunityEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event'
import { createRequirementForEvent } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/requirement/create-requirement'
import { createUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/create-upw-project'
import { allocateCurrentCaseToUpwProject } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/allocate-current-case-to-upw-project'
import path from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { Page } from '@playwright/test'
import { DeliusTestData, UpwProject } from '../pages/utils/testData'

test('deliusData', async ({ page }) => {
  slow()
  await login(page)

  const project = await createUpwProject(page, {
    providerName: data.teams.unpaidWorkTestTeam.provider,
    teamName: data.teams.unpaidWorkTestTeam.name,
  })
  const deliusTestData: DeliusTestData = {
    project: project,
    crns: [],
  }

  const outDir = path.join(process.cwd(), 'tmp')
  const outFile = path.join(outDir, 'delius-data.json')

  for (let i = 0; i < 4; i++) {
    const crn = await createAndAllocatePerson(page, project)
    deliusTestData.crns.push(crn)
  }
  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, JSON.stringify(deliusTestData, null, 2), 'utf-8')
})

async function createAndAllocatePerson(page: Page, upwProject: UpwProject): Promise<string> {
  const person = deliusPerson()
  const crn: string = await createOffender(page, {
    person,
    providerName: data.teams.unpaidWorkTestTeam.provider,
  })

  await createCommunityEvent(page, { crn, allocation: { team: data.teams.unpaidWorkTestTeam } })

  await createRequirementForEvent(page, {
    crn,
    requirement: data.requirements.unpaidWork,
    team: data.teams.unpaidWorkTestTeam,
  })

  await page.locator('a', { hasText: 'Personal Details' }).click()

  await allocateCurrentCaseToUpwProject(page, {
    providerName: data.teams.unpaidWorkTestTeam.provider,
    teamName: data.teams.unpaidWorkTestTeam.name,
    projectName: upwProject.projectName,
  })
  return crn
}
