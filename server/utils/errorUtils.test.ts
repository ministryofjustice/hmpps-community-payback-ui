/* eslint-disable */

import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { HTTPError } from 'superagent'
import { createMock } from '@golevelup/ts-jest'
import { errorHasStatus, generateErrorSummary, generateErrorTextList, getErrorStatus } from './errorUtils'

describe('errorUtils', () => {
  describe('generateErrorSummary', () => {
    it('generates an error summary', () => {
      const validationErrors = {
        selectField: {
          text: 'Select an answer',
        },
        inputField: {
          text: 'Provide an answer',
        },
      }

      expect(generateErrorSummary(validationErrors)).toEqual([
        {
          text: 'Select an answer',
          href: '#selectField',
          attributes: {
            'data-cy-error-selectField': 'Select an answer',
          },
        },
        {
          text: 'Provide an answer',
          href: '#inputField',
          attributes: {
            'data-cy-error-inputField': 'Provide an answer',
          },
        },
      ])
    })
  })

  describe('generateErrorTextList', () => {
    it('returns a list of GOV.UK error summary text errors if any errors', () => {
      const errors = ['Error 1', 'Error 2']
      const result = generateErrorTextList(errors)

      expect(result).toEqual([{ text: 'Error 1' }, { text: 'Error 2' }])
    })

    it('returns undefined if errors are empty', () => {
      const result = generateErrorTextList([])

      expect(result).toBeUndefined()
    })

    it.each([null, undefined])('returns undefined if passed null or undefined', (list?: Array<string>) => {
      const result = generateErrorTextList(list)
      expect(result).toBeUndefined()
    })
  })

  const errorWithStatus: HTTPError = createMock<HTTPError>({
    status: 404,
  })

  const errorWithResponseStatus: SanitisedError = createMock<SanitisedError>({
    responseStatus: 500,
  })

  const errorWithNeither = {}

  describe('getErrorStatus', () => {
    it.each([
      ['Error with status', errorWithStatus, 404],
      ['Error with responseStatus', errorWithResponseStatus, 500],
      ['Error with neither', errorWithNeither, undefined],
    ])('Gets the correct error code: %s', (_, err, expected) => {
      expect(getErrorStatus(err as any)).toEqual(expected)
    })
  })

  describe('errorHasStatus', () => {
    it.each([
      ['Error with status: true', errorWithStatus, 404, true],
      ['Error with status: false', errorWithStatus, 500, false],
      ['Error with responseStatus: true', errorWithResponseStatus, 500, true],
      ['Error with responseStatus: false', errorWithResponseStatus, 404, false],
      ['Error with neither', errorWithNeither, 400, false],
    ])('Returns true/false depending on whether error has a status: %s', (_, err, status, expected) => {
      expect(errorHasStatus(err as any, status)).toEqual(expected)
    })
  })
})
