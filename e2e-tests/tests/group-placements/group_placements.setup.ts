import { writeDeliusData } from '../../delius/deliusTestData'
import test from '../../fixtures/test'
import setupDeliusForGroupPlacements from '../../fixtures/deliusDataSetup'

test('Setup Delius data for group placements', async ({ page, team, testCount }) => {
  const groupPlacementData = await setupDeliusForGroupPlacements({
    page,
    numberOfPopsToCreateAndAllocate: testCount,
    team,
    testContext: test,
  })
  await writeDeliusData(groupPlacementData)
})
