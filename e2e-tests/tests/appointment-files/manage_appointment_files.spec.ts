import { readFile } from 'fs/promises'
import { expect } from '@playwright/test'
import test from '../../fixtures/test'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import DeleteFilePage from '../../pages/appointments/deleteFilePage'
import UploadFilePage from '../../pages/appointments/uploadFilePage'
import recordOtherEteAppointment from '../../steps/recordOtherEteAppointment'

test(
  'Upload, download and delete an evidence file on an Other ETE appointment',
  { tag: '@use-other-ete-placement-type' },
  async ({ page, deliusUser, team, project, personOnProbation }) => {
    const filename = `evidence-${personOnProbation.crn}.txt`
    const contents = `Evidence for ${personOnProbation.crn}`

    const confirmPage = await recordOtherEteAppointment(page, { deliusUser, team, project, personOnProbation })
    await confirmPage.confirmButtonLocator.click()

    const appointmentPage = new CheckAppointmentDetailsPage(page)
    await appointmentPage.expect.toBeOnThePage()
    await appointmentPage.expect.toShowMissingEvidenceWarning()
    await appointmentPage.expect.toShowNoFiles()

    await test.step('Upload a file', async () => {
      await appointmentPage.clickUploadFile()

      const uploadFilePage = new UploadFilePage(page)
      await uploadFilePage.expect.toBeOnThePage()
      await uploadFilePage.chooseFile(filename, contents)
      await uploadFilePage.continue()

      await appointmentPage.expect.toBeOnThePage()
      await appointmentPage.expect.toShowSuccessMessage('File uploaded')
      await appointmentPage.expect.toShowFile(filename)
      await appointmentPage.expect.notToShowMissingEvidenceWarning()
    })

    await test.step('Download the file', async () => {
      const download = await appointmentPage.downloadFile(filename)

      expect(download.suggestedFilename()).toEqual(filename)
      expect(await readFile(await download.path(), 'utf8')).toEqual(contents)
    })

    const deleteFilePage = new DeleteFilePage(page)

    await test.step('Cancel deleting the file', async () => {
      await appointmentPage.clickDeleteFile(filename)
      await deleteFilePage.expect.toBeOnThePage()
      await deleteFilePage.expect.toShowFile(filename)
      await deleteFilePage.clickCancel()

      await appointmentPage.expect.toBeOnThePage()
      await appointmentPage.expect.toShowFile(filename)
    })

    await test.step('Delete the file', async () => {
      await appointmentPage.clickDeleteFile(filename)
      await deleteFilePage.expect.toBeOnThePage()
      await deleteFilePage.continue()

      await appointmentPage.expect.toBeOnThePage()
      await appointmentPage.expect.toShowSuccessMessage('File deleted')
      await appointmentPage.expect.toShowNoFiles()
      await appointmentPage.expect.toShowMissingEvidenceWarning()
    })
  },
)
