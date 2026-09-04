import { AdjustmentDto, AppointmentDto, AppointmentSummaryDto } from '../@types/shared'

export default class AdjustmentUtils {
  static getTravelTimeAdjustmentFromAppointment(
    appointment: AppointmentDto | AppointmentSummaryDto,
  ): AdjustmentDto | null {
    return appointment.adjustments.filter(adj => adj.reasonCode === 'TTX')[0] ?? null
  }

  static getTravelTimeAdjustmentText(adjustment?: AdjustmentDto): string | null {
    if (!adjustment || adjustment.reasonCode !== 'TTX') {
      return null
    }

    if (adjustment.amount === 'PT-1H') {
      return '1 hour'
    }

    return '2 hours'
  }
}
