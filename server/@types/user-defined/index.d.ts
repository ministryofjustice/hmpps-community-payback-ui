export interface BaseRequest {
  username: string
}

export interface GetSessionsRequest extends BaseRequest {
  teamCode: string
  startDate: string
  endDate: string
}

export interface GetSessionRequest extends BaseRequest {
  projectCode: string
  date: string
  startTime: string
  endTime: string
}

export type GovUkStatusTagColour = 'grey' | 'red' | 'yellow'

export type GovUKTableRow = { text: string } | { html: string }

export type ValidationErrors<T> = Partial<Record<keyof T, Record<'text', string>>>
