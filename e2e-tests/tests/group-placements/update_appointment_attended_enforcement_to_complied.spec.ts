import checkDeliusAppointmentDetails from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/check-appointment-details'
import checkDeliusEnforcementDiary from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/check-enforcement-diary'
import verifyDeliusTimeCredited from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-time-credited'
import checkDeliusWorksheetSummaryAttendance from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/check-worksheet-summary-attendance'
import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import {
  completeAttendedEnforceableOutcome,
  completeAttendedCompliedOutcome,
} from '../../steps/completeAttendanceOutcome'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import completeChooseProject from '../../steps/completeChooseProject'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import completeCompliance from '../../steps/completeCompliance'
import { checkAppointmentOnDelius } from '../../steps/delius'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import signIn from '../../steps/signIn'
import viewAppointmentFromList from '../../steps/viewAppointmentFromList'

test('Update a session appointment: failed to comply => complied', async ({
  page,
  deliusUser,
  team,
  project,
  personOnProbation,
  appointment,
}) => {
  const homePage = await signIn(page, deliusUser)
  const groupSessionPage = await searchForASession(page, homePage, team, appointment.date)

  await groupSessionPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, groupSessionPage, project.name)

  await sessionPage.expect.toSeeAppointments()

  let checkAppointmentDetailsPage = await viewAppointmentFromList(page, sessionPage, personOnProbation.crn)
  let chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)

  let chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  let attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

  let logHoursPage = await completeAttendedEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.continue()

  await completeCompliance(page)

  let confirmPage = new ConfirmPage(page)

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowOutcome('Attended \u2013 failed to comply')
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  checkAppointmentDetailsPage = await viewAppointmentFromList(page, sessionPage, personOnProbation.crn)
  chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)

  chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

  logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)

  await logHoursPage.continue()

  await completeCompliance(page)

  confirmPage = new ConfirmPage(page)

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowOutcome('Attended \u2013 complied')
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  const contactOutcome = {
    outcome: 'Attended - Complied',
    startTime: project.availability.startTime,
    endTime: project.availability.endTime,
  }

  await test.step('Check appointment exists on the UPW Project Diary in Delius', async () => {
    await checkAppointmentOnDelius({
      page,
      team,
      person: personOnProbation,
      project,
      contactOutcome,
      hoursCredited: '4:00',
      outStanding: '0:00',
    })
  })

  await test.step('Check appointment exists on the UPW Worksheet Summary in Delius', async () => {
    await verifyDeliusTimeCredited(page, {
      crn: personOnProbation.crn,
      projectName: project.name,
      hoursCredited: '4:00',
      hoursOffered: '4:00',
      outcome: contactOutcome.outcome,
      date: new Date(),
    })
    await checkDeliusWorksheetSummaryAttendance(page, {
      crn: personOnProbation.crn,
      appointmentsOffered: 1,
      appointmentsComplied: 1,
      appointmentsNotComplied: 0,
    })
  })

  await test.step('Check appointment details on the UPW Appointment Details page in Delius are correct', async () => {
    await checkDeliusAppointmentDetails(page, {
      projectName: project.name,
      startTime: contactOutcome.startTime,
      endTime: contactOutcome.endTime,
      contactOutcome: contactOutcome.outcome,
      hoursWorked: '4:00',
      hoursCredited: '4:00',
      enforcementAction: null,
    })
  })

  await test.step('Check enforcement action does not exist on the Enforcement Contacts in Delius', async () => {
    await checkDeliusEnforcementDiary(page, {
      region: 'East of England',
      team: 'Unallocated Team(N56)',
      personFullName: personOnProbation.getFullName(true),
      exists: false,
    })
  })
})
