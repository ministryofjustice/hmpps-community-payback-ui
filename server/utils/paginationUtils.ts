import type { Request } from 'express'
import { createQueryString } from './utils'
import { SortDirection } from '../@types/user-defined'
import { PageMetadata } from '../@types/shared'

export type PaginationPreviousOrNext = {
  href: string
  text?: string
  attributes?: Record<string, string>
}

export type PaginationItem =
  | {
      number: number
      href: string
      current?: boolean
      attributes?: Record<string, string>
    }
  | {
      ellipsis: true
    }

export type Pagination = {
  previous?: PaginationPreviousOrNext
  items?: Array<PaginationItem>
  next?: PaginationPreviousOrNext
  landmarkLabel?: string
  results?: {
    count: number
    from: number
    to: number
    text: string
  }
}

/**
 * Produces parameters for the MOJ Pagination component macro
 * NB: `page` starts at 1
 *
 * Accessibility notes:
 * - set `landmarkLabel` on the returned object otherwise the navigation box is announced as "results"
 * - set `previous.attributes.aria-label` and `next.attributes.aria-label` on the returned object if "Previous" and "Next" are not clear enough
 */
export const paginationComponentParams = (
  currentPage: number,
  pageCount: number,
  totalElements: number,
  pageSize: number,
  hrefPrefix: string,
): Pagination => {
  const params: Pagination = {}

  if (!pageCount || pageCount <= 1) {
    return params
  }

  if (currentPage !== 1) {
    params.previous = {
      href: `${hrefPrefix}page=${currentPage - 1}#search-results`,
    }
  }
  if (currentPage < pageCount) {
    params.next = {
      href: `${hrefPrefix}page=${currentPage + 1}#search-results`,
    }
  }

  let pages: Array<number | null>
  if (currentPage >= 5) {
    pages = [1, 2, null, currentPage - 1, currentPage]
  } else {
    pages = [1, 2, 3, 4].slice(0, currentPage)
  }
  const maxPage = Math.max(currentPage, pages.at(-1))
  if (maxPage === pageCount - 1) {
    pages.push(pageCount)
  } else if (maxPage === pageCount - 2) {
    pages.push(pageCount - 1, pageCount)
  } else if (maxPage === pageCount - 3) {
    pages.push(maxPage + 1, pageCount - 1, pageCount)
  } else if (maxPage <= pageCount - 4) {
    pages.push(maxPage + 1, null, pageCount - 1, pageCount)
  }

  params.items = pages.map((somePage: number | null): PaginationItem => {
    if (somePage) {
      const item: PaginationItem = {
        number: somePage,
        href: `${hrefPrefix}page=${somePage}#search-results`,
        attributes: { 'data-testid': 'pagination-page-number-link' },
      }
      if (somePage === currentPage) {
        item.current = true
      }
      return item
    }
    return { ellipsis: true }
  })

  params.results = {
    count: totalElements,
    from: (currentPage - 1) * pageSize + 1,
    to: Math.min(currentPage * pageSize, totalElements),
    text: 'results',
  }

  return params
}

export const getPaginationRequestParams = <T>(
  request: Request,
  basePath: string,
  defaultSort: { by: T; direction?: SortDirection },
  validSortFields: readonly string[] = [],
) => {
  const { page: uiPage, ...params } = request.query
  const page = uiPage ? apiPageNumber(Number(uiPage)) : 0

  const { sortBy, sortDirection, sort } = getSortParams<T>(validSortFields, request, defaultSort)

  const queryString = createQueryString(
    { ...params, sortBy, sortDirection },
    { addQueryPrefix: true, arrayFormat: 'repeat' },
  )
  const queryStringSuffix = queryString.length > 0 ? '&' : '?'
  const hrefPrefix = `${basePath}${queryString}${queryStringSuffix}`

  return { page, hrefPrefix, sortBy, sortDirection, sort, size: PAGE_SIZE }
}

export const PAGE_SIZE = 10

export const apiPageNumber = (page: number) => (page > 0 ? page - 1 : 0)

export const uiPageNumber = (pagedMetadata: PageMetadata) => (!pagedMetadata ? 0 : pagedMetadata.number + 1)

function getSortParams<T>(
  validSortFields: readonly string[],
  request: Request,
  defaultSort: { by: T; direction?: SortDirection },
) {
  const defaultSortParams = {
    sortBy: defaultSort.by,
    sortDirection: defaultSort.direction ?? 'asc',
    sort: [`${defaultSort.by},${defaultSort.direction ?? 'asc'}`],
  }
  const userProvidedSortBy = request.query.sortBy

  if (userProvidedSortBy) {
    let sortBy: T | T[] | undefined
    if (Array.isArray(userProvidedSortBy) && userProvidedSortBy.length > 0) {
      sortBy = userProvidedSortBy
        .map(s => (typeof s === 'string' && validSortFields.includes(s) ? (s as T) : undefined))
        .filter(s => s !== undefined)
    } else {
      sortBy =
        typeof userProvidedSortBy === 'string' && validSortFields.includes(userProvidedSortBy)
          ? (userProvidedSortBy as T)
          : undefined
    }

    const userProvidedSortDirection = request.query.sortDirection
    const sortDirection: SortDirection | undefined =
      userProvidedSortDirection === 'asc' || userProvidedSortDirection === 'desc'
        ? userProvidedSortDirection
        : undefined

    if ((Array.isArray(sortBy) && sortBy.length === 0) || sortBy === undefined) {
      return defaultSortParams
    }

    const sort =
      Array.isArray(sortBy) && sortBy.length > 0
        ? // If we have multiple items in sort by, split them up and follow them with the direction
          sortBy.map(sortItem => `${sortItem},${sortDirection ?? 'asc'}`)
        : [`${sortBy},${sortDirection ?? 'asc'}`]

    return { sortBy, sortDirection, sort }
  }

  return defaultSortParams
}
