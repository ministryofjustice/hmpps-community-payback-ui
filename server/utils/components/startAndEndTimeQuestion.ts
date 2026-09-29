import { ValidationErrors } from '../../@types/user-defined'
import DateTimeFormats from '../dateTimeUtils'
import HtmlUtils from '../htmlUtils'

export type StartAndEndTimeQuestionBody = {
  startTime?: string
  endTime?: string
}

export type StartAndEndTimeQuestionViewData = {
  startTime: string
  endTime: string
}

export default class StartAndEndTimeQuestion {
  static viewData(
    form: StartAndEndTimeQuestionBody,
    query: StartAndEndTimeQuestionBody = {},
  ): StartAndEndTimeQuestionViewData {
    return {
      startTime: query.startTime ?? (form.startTime ? DateTimeFormats.stripTime(form.startTime) : ''),
      endTime: query.endTime ?? (form.endTime ? DateTimeFormats.stripTime(form.endTime) : ''),
    }
  }

  static getAnswerSummary(form: StartAndEndTimeQuestionBody): string {
    const { startTime, endTime } = form
    const hours = DateTimeFormats.timeBetween(startTime, endTime)

    return HtmlUtils.getElementsWithContent(
      [DateTimeFormats.timePeriod(startTime, endTime), `Hours credited: ${hours}`],
      'p',
    )
  }

  static validate(query: StartAndEndTimeQuestionBody): ValidationErrors<StartAndEndTimeQuestionBody> {
    const errors: ValidationErrors<StartAndEndTimeQuestionBody> = {}

    if (!query.startTime) {
      errors.startTime = { text: 'Enter a start time' }
    } else if (!DateTimeFormats.isValidTime(query.startTime)) {
      errors.startTime = { text: 'Enter a valid start time, for example 09:00' }
    }

    if (!query.endTime) {
      errors.endTime = { text: 'Enter an end time' }
    } else if (!DateTimeFormats.isValidTime(query.endTime)) {
      errors.endTime = { text: 'Enter a valid end time, for example 17:00' }
    }

    if (!errors.startTime && !errors.endTime && !DateTimeFormats.timesAreOrdered(query.startTime, query.endTime)) {
      errors.startTime = { text: `Start time should be before ${query.endTime}` }
    }

    return errors
  }
}
