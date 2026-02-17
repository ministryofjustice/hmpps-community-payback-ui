import PersonOnProbation from '../../delius/personOnProbation'
import Project from '../../delius/project'
import test from '../../fixtures/test'
import ConfirmPage from '../../pages/appointments/confirmPage'
import ProjectPage from '../../pages/projects/projectPage'
import clickUpdateAnAppointment from '../../steps/clickUpdateAnAppointment'
import { completeAttendedCompliedOutcome } from '../../steps/completeAttendanceOutcome'
import completeCheckProjectDetails from '../../steps/completeCheckProjectDetails'
import completeCompliance from '../../steps/completeCompliance'
import signIn from '../../steps/signIn'

test('Update an individual placement appointment with attended complied', async ({ page, deliusUser }) => {
  const supervisor = 'Unallocated Unallocated'
  const project = new Project('Cancer Research UK', 'TEST01')
  const person = new PersonOnProbation('Lena', 'Leonard', 'CRN0002')
  const appointmentTimes = { startTime: '09:00', endTime: '17:00' }
  const projectPage = new ProjectPage(page, project.name)

  await signIn(page, deliusUser)
  await projectPage.goto(project.code)
  await projectPage.expect.toSeeAppointmentForCrn(person.crn)

  const checkProjectDetailsPage = await clickUpdateAnAppointment(page, projectPage, person.crn)
  const attendanceOutcomePage = await completeCheckProjectDetails(page, checkProjectDetailsPage, supervisor)

  const logHoursPage = await completeAttendedCompliedOutcome(page, attendanceOutcomePage)
  await logHoursPage.enterPenaltyHours()
  await logHoursPage.continue()

  await completeCompliance(page)

  const confirmPage = new ConfirmPage(page)
  await confirmPage.expect.toBeOnThePage()

  await confirmPage.expect.toShowAnswers(supervisor, appointmentTimes)
  await confirmPage.expect.toShowAttendanceAnswer('Attended - Complied')
  await confirmPage.expect.toShowPenaltyHoursAnswerWithHoursApplied()
  await confirmPage.expect.toShowComplianceAnswer()

  await confirmPage.confirmButtonLocator.click()

  await projectPage.expect.toBeOnThePage()
})
