import { CommonUnpaidWorkDetailsDto } from '../../../server/@types/shared'
import SummaryListComponent from './summaryListComponent'
import UnpaidWorkUtils from '../../../server/utils/unpaidWorkUtils'

export default class UnpaidWorkHoursCardsComponent {
  shouldShowFormattedHoursDetails(unpaidWorkDetails: CommonUnpaidWorkDetailsDto) {
    const formattedHours = UnpaidWorkUtils.unpaidWorkHoursDetails(unpaidWorkDetails)
    const hoursOrderedCard = new SummaryListComponent('Hours ordered')
    hoursOrderedCard.shouldContainText(formattedHours.totalHoursOrdered)

    const hoursCompletedCard = new SummaryListComponent('Hours completed')
    hoursCompletedCard.shouldContainText(formattedHours.totalHoursCompleted)

    const hoursRemainingCard = new SummaryListComponent('Hours remaining')
    hoursRemainingCard.shouldContainText(formattedHours.totalHoursRemaining)
  }
}
