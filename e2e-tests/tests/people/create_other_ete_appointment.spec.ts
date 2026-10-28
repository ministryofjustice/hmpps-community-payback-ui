import verifyTimeCredited from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/upw/verify-time-credited'
import { login as deliusLogin } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import test from '../../fixtures/test'
import PersonAppointmentsPage from '../../pages/people/personAppointmentsPage'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import recordOtherEteAppointment from '../../steps/recordOtherEteAppointment'

test(
  'Record an education, training and employment (ETE) appointment outside Community Campus',
  { tag: '@use-other-ete-placement-type' },
  async ({ page, deliusUser, team, project, personOnProbation }) => {
    const confirmPage = await recordOtherEteAppointment(page, { deliusUser, team, project, personOnProbation })

    await confirmPage.details.expect.toHaveItemWith('Region', team.provider)
    await confirmPage.details.expect.toHaveItemWith('Project team', team.name)
    await confirmPage.expect.toShowOutcome('Attended \u2013 complied')
    await confirmPage.expect.toShowComplianceAnswer()

    await confirmPage.confirmButtonLocator.click()

    const appointmentPage = new CheckAppointmentDetailsPage(page)

    await appointmentPage.expect.toBeOnThePage()
    await appointmentPage.clickBack()
    await new PersonAppointmentsPage(page, personOnProbation.getFullName()).expect.toBeOnThePage()

    await deliusLogin(page)
    await verifyTimeCredited(page, {
      crn: personOnProbation.crn,
      projectName: project.name,
      hoursCredited: `1:00`,
      outcome: 'Attended - Complied',
      date: new Date(),
    })
  },
)
