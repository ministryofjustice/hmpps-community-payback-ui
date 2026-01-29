export default class DateTimeUtils {
  static plusDays(date: Date, daysToAdd: number) {
    return new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * daysToAdd)
  }
}
