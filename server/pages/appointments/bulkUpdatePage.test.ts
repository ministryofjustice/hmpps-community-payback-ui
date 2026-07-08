import appointmentOutcomeFormFactory, {
  updateSessionFormFactory,
} from '../../testutils/factories/appointmentOutcomeFormFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentSummaryFactory from '../../testutils/factories/appointmentSummaryFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import offenderLimitedFactory from '../../testutils/factories/offenderLimitedFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import * as ErrorUtils from '../../utils/errorUtils'
import { pathWithQuery } from '../../utils/utils'
import BulkUpdatePage from './bulkUpdatePage'

describe('BulkUpdatePage', () => {
  describe('viewData', () => {
    it('should return backLink to session show path with original search query', () => {
      const page = new BulkUpdatePage()
      const formData = appointmentOutcomeFormFactory.build()
      const session = sessionFactory.build()
      const formId = 'form-id-1'

      const result = page.viewData({ formData, session, formId })

      const expectedBackLink = pathWithQuery(
        paths.sessions.show({ projectCode: session.projectCode, date: session.date }),
        formData.originalSearch,
      )

      expect(result.backLink).toBe(expectedBackLink)
    })

    it('should return updatePath to session bulk update path with form id query', () => {
      const page = new BulkUpdatePage()
      const formData = appointmentOutcomeFormFactory.build()
      const session = sessionFactory.build()
      const formId = 'form-id-1'

      const result = page.viewData({ formData, session, formId })

      const expectedUpdatePath = pathWithQuery(
        paths.sessions.update({ projectCode: session.projectCode, date: session.date, page: 'select-people' }),
        { form: formId },
      )

      expect(result.updatePath).toBe(expectedUpdatePath)
    })

    it('should return expected header object', () => {
      const page = new BulkUpdatePage()
      const session = sessionFactory.build({ projectName: 'Project A', date: '2026-06-12' })
      const formattedDate = '12 June 2026'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(formattedDate)

      const result = page.viewData({ formData: appointmentOutcomeFormFactory.build(), session, formId: 'form-id-1' })

      expect(result.heading).toEqual({
        title: 'Project A',
        caption: 'Bulk update',
        description: `Date: ${formattedDate}`,
      })
    })

    describe('items', () => {
      it('should include appointments without a contact outcome', () => {
        const page = new BulkUpdatePage()
        const formId = 'form-id-1'
        const options = [{ text: 'Option A', value: '101', checked: true }]
        const getOptionsSpy = jest.spyOn(GovUkCheckboxes, 'getOptions').mockReturnValue(options)

        const included = appointmentSummaryFactory.build({ id: 101, contactOutcome: null })
        const excluded = appointmentSummaryFactory.build()

        const session = sessionFactory.build({
          appointmentSummaries: [included, excluded],
        })
        const formData = updateSessionFormFactory.build({
          appointments: undefined,
        })

        const result = page.viewData({ formData, session, formId })

        expect(getOptionsSpy).toHaveBeenCalledWith(
          [
            {
              text: new Offender(included.offender).details.description,
              value: included.id,
            },
          ],
          'text',
          'value',
          undefined,
        )
        expect(result.options).toEqual(options)
      })

      it('should only include Full offenders when session contains Full, Limited and Not_Found offenders', () => {
        const page = new BulkUpdatePage()
        const formId = 'form-id-1'
        const options = [{ text: 'Option B', value: '201', checked: true }]
        const getOptionsSpy = jest.spyOn(GovUkCheckboxes, 'getOptions').mockReturnValue(options)

        const included = appointmentSummaryFactory.build({
          offender: offenderFullFactory.build(),
          contactOutcome: null,
        })
        const limited = appointmentSummaryFactory.build({
          offender: offenderLimitedFactory.build(),
          contactOutcome: null,
        })
        const notFound = appointmentSummaryFactory.build({
          offender: { objectType: 'Not_Found', crn: 'X22348' },
          contactOutcome: null,
        })

        const session = sessionFactory.build({
          appointmentSummaries: [included, limited, notFound],
        })
        const formData = updateSessionFormFactory.build({
          appointments: undefined,
        })

        const result = page.viewData({ formData, session, formId })

        expect(getOptionsSpy).toHaveBeenCalledWith(
          [
            {
              text: new Offender(included.offender).details.description,
              value: included.id,
            },
          ],
          'text',
          'value',
          undefined,
        )
        expect(result.options).toEqual(options)
      })

      it('should include appointments without a contact outcome', () => {
        const page = new BulkUpdatePage()
        const formId = 'form-id-1'
        const options = [{ text: 'Option A', value: '101', checked: true }]
        const getOptionsSpy = jest.spyOn(GovUkCheckboxes, 'getOptions').mockReturnValue(options)

        const session = sessionFactory.build({
          appointmentSummaries: appointmentSummaryFactory.buildList(1, { contactOutcome: null }),
        })
        const formData = updateSessionFormFactory.build({
          appointments: [{ id: session.appointmentSummaries[0].id, deliusVersion: '2' }],
        })

        const result = page.viewData({ formData, session, formId })

        expect(getOptionsSpy).toHaveBeenCalledWith(
          [
            {
              text: new Offender(session.appointmentSummaries[0].offender).details.description,
              value: { id: session.appointmentSummaries[0].id, deliusVersion: '2' }.id,
            },
          ],
          'text',
          'value',
          [session.appointmentSummaries[0].id.toString()],
        )
        expect(result.options).toEqual(options)
      })
    })
  })

  describe('validationErrors', () => {
    it('returns error details when no appointments are selected', () => {
      const page = new BulkUpdatePage()
      const errorSummary = [{ text: 'Select people with the same outcome', href: '#appointments', attributes: {} }]
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const result = page.validationErrors({ appointments: '' })

      expect(result.hasErrors).toBe(true)
      expect(result.errors).toEqual({
        appointments: { text: 'Select people with the same outcome' },
      })
      expect(result.errorSummary).toEqual(errorSummary)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({
        appointments: { text: 'Select people with the same outcome' },
      })
    })

    it.each([{ appointments: '1' }, { appointments: ['1', '2'] }])(
      'returns no validation errors when one or more appointments are selected',
      query => {
        const page = new BulkUpdatePage()
        const errorSummary: [] = []
        jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

        const result = page.validationErrors(query)

        expect(result.hasErrors).toBe(false)
        expect(result.errors).toEqual({})
        expect(result.errorSummary).toEqual([])
        expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({})
      },
    )
  })

  describe('next', () => {
    it('returns choose-supervisor session update path with form query', () => {
      const page = new BulkUpdatePage()
      const formId = 'form-id-1'
      const projectCode = 'P123'
      const date = '2026-06-12'

      const result = page.next(formId, projectCode, date)

      const expectedPath = pathWithQuery(
        paths.sessions.update({
          projectCode,
          date,
          page: 'choose-supervisor',
        }),
        { form: formId },
      )

      expect(result).toBe(expectedPath)
    })
  })

  describe('selected', () => {
    it('returns an array containing one value when appointments is a single string', () => {
      const page = new BulkUpdatePage()

      const result = page.selectedAppointments({ appointments: '123' })

      expect(result).toEqual(['123'])
    })

    it('returns the same array when appointments is an array of strings', () => {
      const page = new BulkUpdatePage()

      const result = page.selectedAppointments({ appointments: ['123', '456'] })

      expect(result).toEqual(['123', '456'])
    })
  })

  describe('getFormData', () => {
    it('returns form data with appointments mapped to id and deliusVersion', () => {
      const page = new BulkUpdatePage()
      const form = updateSessionFormFactory.build({ notes: 'existing notes', appointments: undefined })
      const appointments = [
        appointmentFactory.build({ id: 101, version: '4' }),
        appointmentFactory.build({ id: 202, version: '7' }),
      ]

      const result = page.getFormData(form, appointments)

      expect(result).toEqual({
        ...form,
        appointments: [
          { id: 101, deliusVersion: '4' },
          { id: 202, deliusVersion: '7' },
        ],
      })
    })
  })
})
