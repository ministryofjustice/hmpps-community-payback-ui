import LogHoursPage from '../pages/appointments/logHoursPage'

export default async (logHoursPage: LogHoursPage) => {
  await logHoursPage.enterHours()
  await logHoursPage.continue()
}
