import paths from '../../paths'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'
import RegionQuestion from '../../utils/components/regionQuestion'
import { ErrorSummaryItem } from '../../utils/errorUtils'
import * as ErrorUtils from '../../utils/errorUtils'
import { pathWithQuery } from '../../utils/utils'
import ChooseRegionPage from './chooseRegionPage'

describe('ChooseRegionPage', () => {
  const page = new ChooseRegionPage()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateForm', () => {
    it('delegates to RegionQuestion.updateFormData', () => {
      const provider = providerSummaryFactory.build({ code: 'PROVIDER-1' })
      const form = appointmentOutcomeFormFactory.build()
      const updatedForm = { ...form, provider }
      const query = { provider: 'PROVIDER-1' }
      const viewData = { providers: [provider] }

      jest.spyOn(RegionQuestion, 'updateFormData').mockReturnValue(updatedForm)

      const result = page.updateForm(form, query, viewData)

      expect(RegionQuestion.updateFormData).toHaveBeenCalledWith(form, query, viewData)
      expect(result).toEqual(updatedForm)
    })
  })

  describe('paths', () => {
    it('returns date back link and the region update path', () => {
      const form = appointmentOutcomeFormFactory.build()

      const result = page.paths({
        pathData: { projectCode: 'P123', appointmentId: '456' },
        form,
        formId: 'form-1',
      })

      expect(result).toEqual({
        backLink: pathWithQuery(
          paths.appointments.update({ projectCode: 'P123', appointmentId: '456', page: 'date' }),
          { form: 'form-1' },
        ),
        updatePath: pathWithQuery(
          paths.appointments.update({ projectCode: 'P123', appointmentId: '456', page: 'region' }),
          { form: 'form-1' },
        ),
        form: 'form-1',
      })
    })
  })

  describe('next', () => {
    it('returns the choose supervisor page path', () => {
      const result = page.next({ pathData: { projectCode: 'P123', appointmentId: '456' } })

      expect(result).toBe(
        paths.appointments.update({ projectCode: 'P123', appointmentId: '456', page: 'choose-supervisor' }),
      )
    })
  })

  describe('validationErrors', () => {
    it('returns an error when no region is selected', () => {
      const errors = { provider: { text: 'Choose a region' } }
      const errorSummary = [{ text: 'Error summary', href: '#summary', attributes: {} }]
      jest.spyOn(RegionQuestion, 'validate').mockReturnValue(errors)
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const result = page.validationErrors({ provider: '' })

      expect(result).toEqual({
        errors,
        hasErrors: true,
        errorSummary,
      })
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(errors)
    })

    it('returns no errors when a region is selected', () => {
      const errors = {}
      const errorSummary: ErrorSummaryItem[] = []
      jest.spyOn(RegionQuestion, 'validate').mockReturnValue(errors)
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const result = page.validationErrors({ provider: 'PROVIDER-1' })

      expect(result).toEqual({
        errors,
        hasErrors: false,
        errorSummary,
      })
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(errors)
    })
  })
})
