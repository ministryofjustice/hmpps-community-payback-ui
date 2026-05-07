import { YesOrNo } from '../@types/user-defined'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import courseCompletionFormFactory from '../testutils/factories/courseCompletionFormFactory'
import NotesUtils from './notesUtils'

describe('NotesUtils', () => {
  describe('questionItems', () => {
    describe('notes', () => {
      it.each(['some note', ''])('should contain query value if any value', (notes: string) => {
        const form = courseCompletionFormFactory.build()
        const result = NotesUtils.questionItems({ notes }, form)

        expect(result.notes).toBe(notes)
      })

      it.each(['some note', ''])(
        'should contain form value if any value and query has no notes value',
        (notes: string) => {
          const form = courseCompletionFormFactory.build({ notes })
          const result = NotesUtils.questionItems({}, form)

          expect(result.notes).toBe(notes)
        },
      )

      it('should be undefined value if notes is undefined on query and form', () => {
        const form = courseCompletionFormFactory.build({ notes: undefined })
        const result = NotesUtils.questionItems({}, form)

        expect(result.notes).toBe(undefined)
      })
    })

    describe('isSensitiveItems', () => {
      it('Yes should be checked if form `sensitive` property is yes', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: 'yes',
        })

        const result = NotesUtils.questionItems({}, form)

        const expectedSensitiveItems = [
          { checked: true, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: false, text: 'No, they are not sensitive', value: 'no' },
        ]

        expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
      })

      it('No should be checked if form `sensitive` property is no', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: 'no',
        })

        const result = NotesUtils.questionItems({}, form)

        const expectedSensitiveItems = [
          { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: true, text: 'No, they are not sensitive', value: 'no' },
        ]

        expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
      })

      it.each([null, undefined])(
        'Neither value should be checked if form `sensitive` property is null or undefined',
        (isSensitive?: YesOrNo) => {
          const form = courseCompletionFormFactory.build({
            isSensitive,
          })

          const result = NotesUtils.questionItems({}, form)

          const expectedSensitiveItems = [
            { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
            { checked: false, text: 'No, they are not sensitive', value: 'no' },
          ]

          expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
        },
      )

      it('populates view data with query value if defined', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: undefined,
        })

        const query = { isSensitive: 'yes' as YesOrNo }

        const result = NotesUtils.questionItems(query, form)

        const expectedSensitiveItems = [
          { checked: true, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: false, text: 'No, they are not sensitive', value: 'no' },
        ]

        expect(result.isSensitiveItems).toEqual(expectedSensitiveItems)
      })
    })

    describe('with appointment parameter', () => {
      it('should return only showIsSensitiveQuestion false when appointment is sensitive', () => {
        const form = courseCompletionFormFactory.build()
        const appointment = appointmentFactory.build({ sensitive: true })

        const result = NotesUtils.questionItems({}, form, appointment)

        expect(result.showIsSensitiveQuestion).toBe(false)
        expect(result.isSensitiveItems).toBeUndefined()
      })

      it('should return isSensitiveItems when appointment is not sensitive', () => {
        const query = courseCompletionFormFactory.build({ isSensitive: undefined })
        const form = courseCompletionFormFactory.build({ isSensitive: undefined })
        const appointment = appointmentFactory.build({ sensitive: false })

        const result = NotesUtils.questionItems(query, form, appointment)

        expect(result.showIsSensitiveQuestion).toBe(true)
        expect(result.isSensitiveItems).toEqual([
          { checked: false, text: 'Yes, they include sensitive information', value: 'yes' },
          { checked: true, text: 'No, they are not sensitive', value: 'no' },
        ])
      })
    })
  })

  describe('checkYourAnswersRows', () => {
    const changePath = '/change-notes'

    it('should return notes row with defined value', () => {
      const notesValue = 'Some important notes'
      const form = courseCompletionFormFactory.build({ notes: notesValue })

      const result = NotesUtils.checkYourAnswersRows(form, changePath)

      expect(result[0]).toEqual({
        key: {
          text: 'Notes',
        },
        value: {
          text: notesValue,
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'notes',
            },
          ],
        },
      })
    })

    it('should return notes row with undefined value', () => {
      const form = courseCompletionFormFactory.build({ notes: undefined })

      const result = NotesUtils.checkYourAnswersRows(form, changePath)

      expect(result[0]).toEqual({
        key: {
          text: 'Notes',
        },
        value: {
          text: undefined,
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'notes',
            },
          ],
        },
      })
    })

    it("should return sensitive row displaying 'Yes' when isSensitive is 'yes'", () => {
      const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })

      const result = NotesUtils.checkYourAnswersRows(form, changePath)

      expect(result[1]).toEqual({
        key: {
          text: 'Sensitive',
        },
        value: {
          text: 'Yes',
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'sensitivity',
            },
          ],
        },
      })
    })

    it("should return sensitive row displaying 'No' when isSensitive is 'no'", () => {
      const form = courseCompletionFormFactory.build({ isSensitive: 'no' })

      const result = NotesUtils.checkYourAnswersRows(form, changePath)

      expect(result[1]).toEqual({
        key: {
          text: 'Sensitive',
        },
        value: {
          text: 'No',
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'sensitivity',
            },
          ],
        },
      })
    })

    it("should return sensitive row displaying 'Not entered' when isSensitive is undefined", () => {
      const form = courseCompletionFormFactory.build({ isSensitive: undefined })

      const result = NotesUtils.checkYourAnswersRows(form, changePath)

      expect(result[1]).toEqual({
        key: {
          text: 'Sensitive',
        },
        value: {
          text: 'Not entered',
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'sensitivity',
            },
          ],
        },
      })
    })

    it('should return sensitive row with empty actions when appointment is sensitive', () => {
      const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })
      const appointment = appointmentFactory.build({ sensitive: true })

      const result = NotesUtils.checkYourAnswersRows(form, changePath, appointment)

      expect(result[1]).toEqual({
        key: {
          text: 'Sensitive',
        },
        value: {
          text: 'Yes',
        },
        actions: {
          items: [],
        },
      })
    })

    it('should return sensitive row with action items when appointment is not sensitive', () => {
      const form = courseCompletionFormFactory.build({ isSensitive: 'no' })
      const appointment = appointmentFactory.build({ sensitive: false })

      const result = NotesUtils.checkYourAnswersRows(form, changePath, appointment)

      expect(result[1]).toEqual({
        key: {
          text: 'Sensitive',
        },
        value: {
          text: 'No',
        },
        actions: {
          items: [
            {
              href: changePath,
              text: 'Change',
              visuallyHiddenText: 'sensitivity',
            },
          ],
        },
      })
    })

    it("should return sensitive row displaying 'Yes' when appointment is sensitive true", () => {
      const form = courseCompletionFormFactory.build({ isSensitive: 'no' })
      const appointment = appointmentFactory.build({ sensitive: true })

      const result = NotesUtils.checkYourAnswersRows(form, changePath, appointment)

      expect(result[1].value).toEqual({
        text: 'Yes',
      })
    })

    it("should return sensitive row displaying 'Yes' when appointment is not sensitive and form is 'yes'", () => {
      const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })
      const appointment = appointmentFactory.build({ sensitive: false })

      const result = NotesUtils.checkYourAnswersRows(form, changePath, appointment)

      expect(result[1].value).toEqual({
        text: 'Yes',
      })
    })
  })

  describe('formData', () => {
    it('should return isSensitive and notes values as yes when appointment is sensitive', () => {
      const query = { notes: 'test notes', isSensitive: 'yes' as YesOrNo }

      const result = NotesUtils.formData(query)

      expect(result).toEqual({
        notes: 'test notes',
        isSensitive: 'yes',
      })
    })
  })

  describe('requestBody', () => {
    it('should include sensitive value of true if appointment sensitive value is true', () => {
      const form = courseCompletionFormFactory.build()
      const result = NotesUtils.requestBody(form, true)
      expect(result.sensitive).toBe(true)
    })

    it.each([false, undefined, null])(
      'should include form sensitive value if appointment sensitive value is not true',
      (appointmentIsSensitive?: boolean) => {
        const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })
        const result = NotesUtils.requestBody(form, appointmentIsSensitive)
        expect(result.sensitive).toBe(true)
      },
    )

    it('should include form notes value', () => {
      const form = courseCompletionFormFactory.build()
      const result = NotesUtils.requestBody(form, true)
      expect(result.notes).toBe(form.notes)
    })
  })
})
