import { OffenderDto, OffenderFullDto, OffenderNotFoundDto } from '../@types/shared'
import HtmlUtils from '../utils/htmlUtils'
import Offender from './offender'

describe('Offender', () => {
  describe('Full', () => {
    let offender: Offender
    let offenderDto: OffenderFullDto

    beforeEach(() => {
      offenderDto = {
        forename: 'Jane',
        surname: 'Smith',
        middleNames: ['Margaret'],
        crn: 'CRN123',
        dateOfBirth: '01-02-1973',
        objectType: 'Full',
      }

      offender = new Offender(offenderDto)
    })

    it('is not limited', () => {
      expect(offender.isLimited).toBe(false)
    })

    it('has crn matching OffenderDto', () => {
      expect(offender.crn).toBe(offenderDto.crn)
    })

    it('has name including forename and surname', () => {
      expect(offender.name).toBe('Jane Smith')
    })

    describe('getTableHtml', () => {
      it('returns html with name and break and crn', () => {
        jest.spyOn(HtmlUtils, 'getElementWithContent').mockReturnValue('<span>Name</span>')
        const result = offender.getTableHtml()

        expect(result).toBe('<span>Name</span><br />CRN123')
      })
    })
  })

  describe('Limited', () => {
    let offender: Offender
    let offenderDto: OffenderDto

    beforeEach(() => {
      offenderDto = {
        crn: 'CRN123',
        objectType: 'Limited',
      }

      offender = new Offender(offenderDto)
    })

    it('is limited', () => {
      expect(offender.isLimited).toBe(true)
    })

    it('has crn matching OffenderDto', () => {
      expect(offender.crn).toBe(offenderDto.crn)
    })

    it('has empty name', () => {
      expect(offender.name).toBe('')
    })

    describe('getTableHtml', () => {
      it('returns string with crn', () => {
        const result = offender.getTableHtml()

        expect(result).toBe(offender.crn)
      })
    })
  })

  describe('Not_Found', () => {
    let offender: Offender
    let offenderDto: OffenderNotFoundDto

    beforeEach(() => {
      offenderDto = {
        crn: 'CRN123',
        objectType: 'Not_Found',
      }

      offender = new Offender(offenderDto)
    })

    it('is limited', () => {
      expect(offender.isLimited).toBe(true)
    })

    it('has crn matching OffenderDto', () => {
      expect(offender.crn).toBe(offenderDto.crn)
    })

    it('has empty name', () => {
      expect(offender.name).toBe('')
    })

    describe('getTableHtml', () => {
      it('returns string with crn', () => {
        const result = offender.getTableHtml()

        expect(result).toBe(offender.crn)
      })
    })
  })
})
