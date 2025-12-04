import test from '../test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'
import clickUpdateAnAppointment from '../steps/clickUpdateAnAppointment'
import completeCheckProjectDetails from '../steps/completeCheckProjectDetails'
import EnforcementPage from '../pages/appointments/enforcementPage'
import completeEnforcement from '../steps/completeEnforcement'
import { completeAttendedEnforceableOutcome } from '../steps/completeAttendanceOutcome'
import completeCompliance from '../steps/completeCompliance'
import PersonOnProbation from '../delius/personOnProbation'
import { readDeliusData } from '../delius/deliusTestData'

test('Update a session appointment with an attended but enforceable outcome', async ({ page, deliusUser }) => {
  const deliusTestData = await readDeliusData()
  const person = deliusTestData.pops[2] as PersonOnProbation

  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage, deliusTestData.project.name)

  await sessionPage.expect.toSeeAppointments()

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, sessionPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage)

  const logHoursPage = await completeAttendedEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.enterHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const enforcementPage = new EnforcementPage(page)
  await enforcementPage.expect.toBeOnThePage()

  const confirmPage = await completeEnforcement(page, enforcementPage)
  await confirmPage.expect.toShowEnforcementAction()

  await confirmPage.expect.toShowAnswers()
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Failed to Comply')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithNoHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()
})
