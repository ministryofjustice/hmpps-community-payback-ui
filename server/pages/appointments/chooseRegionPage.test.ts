import paths from '../../paths'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'
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
    it('returns the original form object when the provider has not changed', () => {
      const provider = providerSummaryFactory.build({ code: 'PROVIDER-1' })
      const form = appointmentOutcomeFormFactory.build({ provider })

      const result = page.updateForm(form, { provider: 'PROVIDER-1' }, { providers: [provider] })

      expect(result).toBe(form)
    })

    it('sets the provider from the query and resets the dependent fields when the provider has changed', () => {
      const form = appointmentOutcomeFormFactory.build()
      const provider = providerSummaryFactory.build({ code: 'NEW-PROVIDER' })

      const result = page.updateForm(form, { provider: 'NEW-PROVIDER' }, { providers: [provider] })

      expect(result).toEqual({
        ...form,
        provider,
        supervisingTeam: undefined,
        supervisor: undefined,
        projectTeam: undefined,
        project: undefined,
      })
    })

    it('throws an error when no matching provider is found', () => {
      const form = appointmentOutcomeFormFactory.build()

      expect(() =>
        page.updateForm(form, { provider: 'UNKNOWN-PROVIDER' }, { providers: providerSummaryFactory.buildList(1) }),
      ).toThrow('Provider with code UNKNOWN-PROVIDER not found')
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
