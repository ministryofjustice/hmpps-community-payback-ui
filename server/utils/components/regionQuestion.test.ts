import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import providerSummaryFactory from '../../testutils/factories/providerSummaryFactory'
import RegionQuestion from './regionQuestion'

describe('regionQuestion', () => {
  describe('validationErrors', () => {
    it('returns an error when no region is selected', () => {
      const result = RegionQuestion.validate({ provider: '' })

      expect(result).toEqual({ provider: { text: 'Choose a region' } })
    })

    it('returns no errors when a region is selected', () => {
      const result = RegionQuestion.validate({ provider: 'PROVIDER-1' })

      expect(result).toEqual({})
    })
  })

  describe('updateFormData', () => {
    it('returns the original form object when the provider has not changed', () => {
      const provider = providerSummaryFactory.build({ code: 'PROVIDER-1' })
      const form = appointmentOutcomeFormFactory.build({ provider })

      const result = RegionQuestion.updateFormData(form, { provider: 'PROVIDER-1' }, { providers: [provider] })

      expect(result).toBe(form)
    })

    it('sets the provider from the query and resets the dependent fields when the provider has changed', () => {
      const form = appointmentOutcomeFormFactory.build()
      const provider = providerSummaryFactory.build({ code: 'NEW-PROVIDER' })

      const result = RegionQuestion.updateFormData(form, { provider: 'NEW-PROVIDER' }, { providers: [provider] })

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
        RegionQuestion.updateFormData(
          form,
          { provider: 'UNKNOWN-PROVIDER' },
          { providers: providerSummaryFactory.buildList(1) },
        ),
      ).toThrow('Provider with code UNKNOWN-PROVIDER not found')
    })
  })

  describe('viewData', () => {
    it('selects the provider from the query when present', () => {
      const providers = providerSummaryFactory.buildList(2)
      const form = appointmentOutcomeFormFactory.build({ provider: providers[1] })

      const result = RegionQuestion.viewData(form, { providers }, { provider: providers[0].code })

      expect(result).toEqual({
        providerItems: [
          { text: 'Choose region', value: '', selected: false },
          { text: providers[0].name, value: providers[0].code, selected: true },
          { text: providers[1].name, value: providers[1].code, selected: false },
        ],
      })
    })

    it('falls back to the provider on the form when the query has none', () => {
      const providers = providerSummaryFactory.buildList(2)
      const form = appointmentOutcomeFormFactory.build({ provider: providers[1] })

      const result = RegionQuestion.viewData(form, { providers }, {})

      expect(result).toEqual({
        providerItems: [
          { text: 'Choose region', value: '', selected: false },
          { text: providers[0].name, value: providers[0].code, selected: false },
          { text: providers[1].name, value: providers[1].code, selected: true },
        ],
      })
    })
  })
})
