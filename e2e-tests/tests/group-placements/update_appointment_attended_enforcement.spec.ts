import { verifyContacts } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/contact/find-contacts'
import checkDeliusAppointmentDetails from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/check-appointment-details'
import checkDeliusEnforcementDiary from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/check-enforcement-diary'
import verifyDeliusTimeCredited from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-time-credited'
import checkDeliusWorksheetSummaryAttendance from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/check-worksheet-summary-attendance'
import test from '../../fixtures/test'
import signIn from '../../steps/signIn'
import searchForASession from '../../steps/searchForASession'
import selectASession from '../../steps/selectASession'
import viewAppointmentFromList from '../../steps/viewAppointmentFromList'
import completeCheckAppointmentDetails from '../../steps/completeCheckAppointmentDetails'
import { completeAttendedEnforceableOutcome } from '../../steps/completeAttendanceOutcome'
import completeCompliance from '../../steps/completeCompliance'
import ConfirmPage from '../../pages/appointments/confirmPage'
import { checkAppointmentOnDelius } from '../../steps/delius'
import completeChooseSupervisor from '../../steps/completeChooseSupervisor'
import completeChooseProject from '../../steps/completeChooseProject'

test('Update a session appointment with an attended but enforceable outcome', async ({
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

  const checkAppointmentDetailsPage = await viewAppointmentFromList(page, sessionPage, personOnProbation.crn)
  const chooseSupervisorPage = await completeCheckAppointmentDetails(page, checkAppointmentDetailsPage)

  const chooseProjectPage = await completeChooseSupervisor(page, chooseSupervisorPage, team)
  const attendanceOutcomePage = await completeChooseProject(page, chooseProjectPage)

  const logHoursPage = await completeAttendedEnforceableOutcome(page, attendanceOutcomePage)

  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)

  await confirmPage.expect.toShowAnswers(team.supervisor, project.availability)
  await confirmPage.expect.toShowOutcome('Attended \u2013 failed to comply')
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.selectAlertPractitioner()

  await confirmPage.confirmButtonLocator.click()

  await sessionPage.expect.toBeOnThePage()

  const contactOutcome = {
    outcome: 'Attended - Failed to Comply',
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
      appointmentsComplied: 0,
      appointmentsNotComplied: 1,
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
      enforcementAction: 'Refer to Offender Manager',
    })
  })

  await test.step('Check contact exists on the Contact List in Delius', async () => {
    await verifyContacts(page, personOnProbation.crn, [
      {
        relatesTo: '1 - SA2020 Community Order',
        type: 'Refer to Offender Manager',
        instance: 0, // most recent
      },
    ])
  })

  await test.step('Check enforcement action exists on the Enforcement Contacts in Delius', async () => {
    await checkDeliusEnforcementDiary(page, {
      region: 'East of England',
      team: 'Unallocated Team(N56)',
      personFullName: personOnProbation.getFullName(true),
      exists: true,
    })
  })
})
