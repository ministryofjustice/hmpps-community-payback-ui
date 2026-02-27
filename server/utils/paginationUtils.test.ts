import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'
import { getPaginationRequestParams, type Pagination, paginationComponentParams } from './paginationUtils'

describe('pagination utils', () => {
  describe('paginationComponentParams', () => {
    const pageSize = 10
    const totalElements = 65

    it('should be empty when there are no pages', () => {
      expect(paginationComponentParams(1, 0, 2, pageSize, '?a=b&')).toEqual<Pagination>({})
    })

    it('should be empty when there’s only 1 page', () => {
      expect(paginationComponentParams(1, 1, 2, pageSize, '?a=b&')).toEqual<Pagination>({})
    })

    it('should work on page 1 of 2', () => {
      expect(paginationComponentParams(1, 2, 15, pageSize, '?a=b&')).toEqual<Pagination>({
        next: { href: '?a=b&page=2#search-results' },
        items: [
          {
            number: 1,
            href: '?a=b&page=1#search-results',
            current: true,
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
          {
            number: 2,
            href: '?a=b&page=2#search-results',
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
        ],
        results: {
          count: 15,
          from: 1,
          to: 10,
          text: 'results',
        },
      })
    })

    it('should work on page 2 of 2', () => {
      expect(paginationComponentParams(2, 2, 15, pageSize, '?a=b&')).toEqual<Pagination>({
        previous: { href: '?a=b&page=1#search-results' },
        items: [
          {
            number: 1,
            href: '?a=b&page=1#search-results',
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
          {
            number: 2,
            href: '?a=b&page=2#search-results',
            current: true,
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
        ],
        results: {
          count: 15,
          from: 11,
          to: 15,
          text: 'results',
        },
      })
    })

    it('should work on page 2 of 3', () => {
      expect(paginationComponentParams(2, 3, 25, pageSize, '?a=b&')).toEqual<Pagination>({
        previous: { href: '?a=b&page=1#search-results' },
        next: { href: '?a=b&page=3#search-results' },
        items: [
          {
            number: 1,
            href: '?a=b&page=1#search-results',
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
          {
            number: 2,
            href: '?a=b&page=2#search-results',
            current: true,
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
          {
            number: 3,
            href: '?a=b&page=3#search-results',
            attributes: { 'data-testid': 'pagination-page-number-link' },
          },
        ],
        results: {
          count: 25,
          from: 11,
          to: 20,
          text: 'results',
        },
      })
    })

    it('should work on page 1 of 7', () => {
      expect(paginationComponentParams(1, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        {
          number: 1,
          href: '?a=b&page=1#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
        { number: 2, href: '?a=b&page=2#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { ellipsis: true },
        { number: 6, href: '?a=b&page=6#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 7, href: '?a=b&page=7#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
      ])
    })

    it('should work on page 2 of 7', () => {
      expect(paginationComponentParams(2, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        { number: 1, href: '?a=b&page=1#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        {
          number: 2,
          href: '?a=b&page=2#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
        { number: 3, href: '?a=b&page=3#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { ellipsis: true },
        { number: 6, href: '?a=b&page=6#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 7, href: '?a=b&page=7#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
      ])
    })

    it('should work on page 3 of 7', () => {
      expect(paginationComponentParams(3, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        { number: 1, href: '?a=b&page=1#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 2, href: '?a=b&page=2#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        {
          number: 3,
          href: '?a=b&page=3#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
        { number: 4, href: '?a=b&page=4#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { ellipsis: true },
        { number: 6, href: '?a=b&page=6#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 7, href: '?a=b&page=7#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
      ])
    })

    it('should work on page 4 of 7', () => {
      expect(paginationComponentParams(4, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        { number: 1, href: '?a=b&page=1#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 2, href: '?a=b&page=2#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 3, href: '?a=b&page=3#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        {
          number: 4,
          href: '?a=b&page=4#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
        { number: 5, href: '?a=b&page=5#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 6, href: '?a=b&page=6#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 7, href: '?a=b&page=7#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
      ])
    })

    it('should work on page 5 of 7', () => {
      expect(paginationComponentParams(5, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        { number: 1, href: '?a=b&page=1#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 2, href: '?a=b&page=2#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { ellipsis: true },
        { number: 4, href: '?a=b&page=4#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        {
          number: 5,
          href: '?a=b&page=5#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
        { number: 6, href: '?a=b&page=6#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 7, href: '?a=b&page=7#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
      ])
    })

    it('should work on page 6 of 7', () => {
      expect(paginationComponentParams(6, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        { number: 1, href: '?a=b&page=1#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 2, href: '?a=b&page=2#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { ellipsis: true },
        { number: 5, href: '?a=b&page=5#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        {
          number: 6,
          href: '?a=b&page=6#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
        { number: 7, href: '?a=b&page=7#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
      ])
    })

    it('should work on page 7 of 7', () => {
      expect(paginationComponentParams(7, 7, totalElements, pageSize, '?a=b&')).toHaveProperty('items', [
        { number: 1, href: '?a=b&page=1#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { number: 2, href: '?a=b&page=2#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        { ellipsis: true },
        { number: 6, href: '?a=b&page=6#search-results', attributes: { 'data-testid': 'pagination-page-number-link' } },
        {
          number: 7,
          href: '?a=b&page=7#search-results',
          current: true,
          attributes: { 'data-testid': 'pagination-page-number-link' },
        },
      ])
    })
  })

  describe('getPaginationRequestParams', () => {
    const basePath = 'http://localhost/example'

    it('should return the hrefPrefix with a query string prefix if there are no query parameters', () => {
      const request = createMock<Request>({ query: {} })

      expect(getPaginationRequestParams(request, basePath)).toEqual({
        pageNumber: undefined,
        hrefPrefix: `${basePath}?`,
      })
    })

    it('should append additional parameters to the hrefPrefix', () => {
      const request = createMock<Request>({ query: { page: '1', sortBy: 'something', sortDirection: 'asc' } })

      expect(getPaginationRequestParams(request, basePath, { foo: 'bar' })).toEqual({
        pageNumber: 1,
        hrefPrefix: `${basePath}?foo=bar&`,
      })
    })
  })
})
