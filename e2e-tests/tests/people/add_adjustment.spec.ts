import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import verifyAdjustment from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-adjustment'
import test from '../../fixtures/test'
import FindAPersonPage from '../../pages/findAPersonPage'
import AdjustHoursPage from '../../pages/people/adjustHoursPage'
import PersonAppointmentsPage from '../../pages/people/personAppointmentsPage'
import signIn from '../../steps/signIn'
import AdjustHoursConfirmPage from '../../pages/people/adjustHoursConfirmPage'

test('Add an adjustment', { tag: '@use-group-placement-type' }, async ({ page, deliusUser, personOnProbation }) => {
  const homePage = await signIn(page, deliusUser)

  await homePage.findAPersonLinkLocator.click()

  const findAPersonPage = new FindAPersonPage(page)
  await findAPersonPage.expect.toBeOnThePage()
  await findAPersonPage.search.enterSearchTerm(personOnProbation.crn)
  await findAPersonPage.search.submitForm()
  await findAPersonPage.people.clickPersonLink(personOnProbation.crn)

  const personAppointmentsPage = new PersonAppointmentsPage(page, personOnProbation.getFullName())
  await personAppointmentsPage.expect.toBeOnThePage()
  await personAppointmentsPage.clickAdjustHours()

  const adjustHoursPage = new AdjustHoursPage(page, personOnProbation.getFullName())
  await adjustHoursPage.expect.toBeOnThePage()
  await adjustHoursPage.datePickerComponent.openDatePicker()
  await adjustHoursPage.datePickerComponent.selectTodaysDate()
  await adjustHoursPage.setReason(1)
  await adjustHoursPage.hoursAndMinutesComponent.enterHours('1', '00')
  await adjustHoursPage.continue()

  const adjustHoursConfirmPage = new AdjustHoursConfirmPage(page, personOnProbation.getFullName())
  await adjustHoursConfirmPage.expect.toBeOnThePage()
  await adjustHoursConfirmPage.submit()

  await deliusLogin(page)
  await verifyAdjustment(page, {
    crn: personOnProbation.crn,
    hoursCredited: '-1:00',
    reason: 'Engagement completed, hours credited',
  })
})
