import paths from '../../paths'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import MojDateInput from '../../forms/mojDateInput'
import DateTimeFormats from '../../utils/dateTimeUtils'
import DatePage from './datePage'

jest.mock('../../forms/mojDateInput')
jest.mock('../../utils/dateTimeUtils')

describe('DatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('viewData', () => {
    it('should return the date from the body when present', () => {
      const page = new DatePage()
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })

      const result = page.viewData(form, { date: '02/02/2026' })

      expect(result).toEqual({ date: '02/02/2026' })
    })

    it('should return the date from the form when the body value is not present', () => {
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue('01/01/2026')
      const page = new DatePage()
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })

      const result = page.viewData(form, {})

      expect(DateTimeFormats.isoDateToUIDate).toHaveBeenCalledWith('2026-01-01', { format: 'short' })
      expect(result).toEqual({ date: '01/01/2026' })
    })
  })

  describe('paths', () => {
    it('should return a project exit link as the back link', () => {
      const page = new DatePage()
      const form = appointmentOutcomeFormFactory.build()

      const result = page.paths({
        pathData: { projectCode: 'P123', appointmentId: '1' },
        form,
      })

      expect(result.backLink).toBe(paths.projects.show({ projectCode: 'P123' }))
    })

    it('should return the date page as the update path', () => {
      const page = new DatePage()
      const form = appointmentOutcomeFormFactory.build()

      const result = page.paths({
        pathData: { projectCode: 'P123', appointmentId: '1' },
        form,
      })

      expect(result.updatePath).toBe(
        paths.appointments.update({ projectCode: 'P123', appointmentId: '1', page: 'date' }),
      )
    })

    it('should include the formId in the update path when provided', () => {
      const page = new DatePage()
      const form = appointmentOutcomeFormFactory.build()

      const result = page.paths({
        pathData: { projectCode: 'P123', appointmentId: '1' },
        form,
        formId: 'form-1',
      })

      expect(result.updatePath).toBe(
        `${paths.appointments.update({ projectCode: 'P123', appointmentId: '1', page: 'date' })}?form=form-1`,
      )
    })
  })

  describe('next', () => {
    it('should return the choose supervisor page path', () => {
      const page = new DatePage()

      const result = page.next({ projectCode: 'P123', appointmentId: '1' })

      expect(result).toBe(
        paths.appointments.update({ projectCode: 'P123', appointmentId: '1', page: 'choose-supervisor' }),
      )
    })

    it('should include the formId in the path when provided', () => {
      const page = new DatePage()

      const result = page.next({ projectCode: 'P123', appointmentId: '1', formId: 'form-1' })

      expect(result).toBe(
        `${paths.appointments.update({ projectCode: 'P123', appointmentId: '1', page: 'choose-supervisor' })}?form=form-1`,
      )
    })
  })

  describe('validationErrors', () => {
    it('should return no errors when the date is valid', () => {
      jest.spyOn(MojDateInput, 'validate').mockReturnValue(undefined)
      const page = new DatePage()

      const { hasErrors, errors, errorSummary } = page.validationErrors({ date: '02/02/2026' })

      expect(MojDateInput.validate).toHaveBeenCalledWith('02/02/2026')
      expect(hasErrors).toBe(false)
      expect(errors).toEqual({})
      expect(errorSummary).toEqual([])
    })

    it('should return an error when the date is invalid', () => {
      const dateError = { text: 'Enter a real date in the correct format. For example, 17/5/2024' }
      jest.spyOn(MojDateInput, 'validate').mockReturnValue(dateError)
      const page = new DatePage()

      const { hasErrors, errors, errorSummary } = page.validationErrors({ date: 'invalid' })

      expect(hasErrors).toBe(true)
      expect(errors).toEqual({ date: dateError })
      expect(errorSummary).toEqual([
        { text: dateError.text, href: '#date', attributes: { 'data-cy-error-date': dateError.text } },
      ])
    })
  })

  describe('updateForm', () => {
    it('should return the form with the latest date', () => {
      jest.spyOn(MojDateInput, 'toIsoDate').mockReturnValue('2026-02-02')
      const page = new DatePage()
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })

      const result = page.getForm(form, { date: '02/02/2026' })

      expect(MojDateInput.toIsoDate).toHaveBeenCalledWith('02/02/2026')
      expect(result).toEqual({ ...form, date: '2026-02-02' })
    })
  })
})
