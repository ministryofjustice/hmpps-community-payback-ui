import appointmentFactory from '../../testutils/factories/appointmentFactory'
import courseCompletionFormFactory from '../../testutils/factories/courseCompletionFormFactory'
import NotesUtils from './notesUtils'

describe('NotesUtils', () => {
  describe('questionItems', () => {
    const isSensitiveItem = {
      checked: true,
      text: 'This is information that you believe must be recorded but not shared with a person on probation. If they make a request for their record, the Data Protection Team will decide whether the information can be shared.',
      value: 'yes',
      label: { classes: 'govuk-!-padding-top-0' },
    }

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

    describe('isSensitiveItem', () => {
      it('Yes should be checked if form `sensitive` property is yes', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: 'yes',
        })

        const result = NotesUtils.questionItems({}, form)

        const expectedSensitiveItems = [isSensitiveItem]

        expect(result.isSensitiveItem).toEqual(expectedSensitiveItems)
      })

      it('should be unchecked if form `sensitive` property is undefined', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: undefined,
        })

        const result = NotesUtils.questionItems({}, form)

        const expectedSensitiveItems = [{ ...isSensitiveItem, checked: false }]

        expect(result.isSensitiveItem).toEqual(expectedSensitiveItems)
      })

      it.each([null, undefined])(
        'should be unchecked if form `sensitive` property is null or undefined',
        (isSensitive?: 'yes') => {
          const form = courseCompletionFormFactory.build({
            isSensitive,
          })

          const result = NotesUtils.questionItems({}, form)

          const expectedSensitiveItems = [{ ...isSensitiveItem, checked: false }]

          expect(result.isSensitiveItem).toEqual(expectedSensitiveItems)
        },
      )

      it('populates view data with query value if defined', () => {
        const form = courseCompletionFormFactory.build({
          isSensitive: undefined,
        })

        const query = { isSensitive: 'yes' as const }

        const result = NotesUtils.questionItems(query, form)

        const expectedSensitiveItems = [isSensitiveItem]

        expect(result.isSensitiveItem).toEqual(expectedSensitiveItems)
      })
    })

    describe('with appointment parameter', () => {
      it('should return sensitive info text and no sensitive items when appointment is sensitive', () => {
        const form = courseCompletionFormFactory.build()
        const appointment = appointmentFactory.build({ sensitive: true })

        const result = NotesUtils.questionItems({}, form, appointment)

        expect(result.sensitiveInfoContent).toEqual(NotesUtils.sensitiveInfoContentMarkedAsSensitive)
        expect(result.isSensitiveItem).toBeUndefined()
      })

      it('should return isSensitiveItems when appointment is not sensitive', () => {
        const query = courseCompletionFormFactory.build({ isSensitive: undefined })
        const form = courseCompletionFormFactory.build({ isSensitive: undefined })
        const appointment = appointmentFactory.build({ sensitive: false })

        const result = NotesUtils.questionItems(query, form, appointment)

        expect(result.sensitiveInfoContent).toBeUndefined()
        expect(result.isSensitiveItem).toEqual([{ ...isSensitiveItem, checked: false }])
      })

      describe('includeIsSensitiveQuestion', () => {
        it('shows sensitive question when appointment is present and includeIsSensitiveQuestion is true', () => {
          const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })
          const appointment = appointmentFactory.build({ sensitive: false })

          const result = NotesUtils.questionItems({}, form, appointment, true)

          expect(result.sensitiveInfoContent).toBeUndefined()
          expect(result.isSensitiveItem).toEqual([isSensitiveItem])
        })

        it('does not show sensitive question when appointment is present and includeIsSensitiveQuestion is false', () => {
          const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })
          const appointment = appointmentFactory.build({ sensitive: false })

          const result = NotesUtils.questionItems({}, form, appointment, false)

          expect(result.sensitiveInfoContent).toEqual(NotesUtils.sensitiveInfoContentDontInclude)
          expect(result.isSensitiveItem).toBeUndefined()
        })

        it('shows sensitive question when appointment is undefined and includeIsSensitiveQuestion is true', () => {
          const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })

          const result = NotesUtils.questionItems({}, form, undefined, true)

          expect(result.sensitiveInfoContent).toBeUndefined()
          expect(result.isSensitiveItem).toEqual([isSensitiveItem])
        })
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
      const form = courseCompletionFormFactory.build({ isSensitive: undefined })
      const appointment = appointmentFactory.build({ sensitive: false })

      const result = NotesUtils.checkYourAnswersRows(form, changePath, appointment)

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

    it("should return sensitive row displaying 'Yes' when appointment is sensitive true", () => {
      const form = courseCompletionFormFactory.build({ isSensitive: undefined })
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

    describe('includeIsSensitiveQuestion', () => {
      it('includes sensitive row when includeIsSensitiveQuestion is true', () => {
        const form = courseCompletionFormFactory.build({ notes: 'Some important notes', isSensitive: 'yes' })

        const result = NotesUtils.checkYourAnswersRows(form, changePath, undefined, true)

        expect(result).toHaveLength(2)
        expect(result[1]).toEqual(
          expect.objectContaining({
            key: { text: 'Sensitive' },
          }),
        )
      })

      it('does not include sensitive row when includeIsSensitiveQuestion is false', () => {
        const form = courseCompletionFormFactory.build({ notes: 'Some important notes', isSensitive: 'yes' })

        const result = NotesUtils.checkYourAnswersRows(form, changePath, undefined, false)

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(
          expect.objectContaining({
            key: { text: 'Notes' },
          }),
        )
      })
    })
  })

  describe('formData', () => {
    it('should return isSensitive and notes values as yes when appointment is sensitive', () => {
      const query = { notes: 'test notes', isSensitive: 'yes' as const }

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

    it.each([true, false, undefined])(
      'should always return appointment sensitive value when sensitive updates are not allowed',
      (appointmentIsSensitive?: boolean) => {
        const form = courseCompletionFormFactory.build({ isSensitive: 'yes' })

        const result = NotesUtils.requestBody(form, appointmentIsSensitive, false)

        expect(result.sensitive).toBe(appointmentIsSensitive)
      },
    )

    it('should use form sensitive value when sensitive updates are explicitly allowed', () => {
      const form = courseCompletionFormFactory.build({ isSensitive: undefined })

      const result = NotesUtils.requestBody(form, undefined, true)

      expect(result.sensitive).toBe(null)
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
