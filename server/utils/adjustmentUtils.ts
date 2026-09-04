import { AdjustmentDto, AppointmentDto, AppointmentSummaryDto } from '../@types/shared'

export default class AdjustmentUtils {
  static readonly travelTimeReasonCode = 'TTX'

  static readonly intervals: Record<string, { duration: string; description: string }> = {
    'PT-1H': { duration: 'PT-1H', description: '1 hour' },
    'PT-2H': { duration: 'PT-2H', description: '2 hours' },
  }

  static getTravelTimeAdjustmentFromAppointment(
    appointment: AppointmentDto | AppointmentSummaryDto,
  ): AdjustmentDto | null {
    return appointment.adjustments.filter(adj => adj.reasonCode === AdjustmentUtils.travelTimeReasonCode)[0] ?? null
  }

  static getTravelTimeAdjustmentText(adjustment?: AdjustmentDto): string | null {
    if (!adjustment || adjustment.reasonCode !== AdjustmentUtils.travelTimeReasonCode) {
      return null
    }

    const interval = AdjustmentUtils.intervals[adjustment.amount]
    if (!interval) {
      throw new Error(`duration of ${adjustment.amount} not handled`)
    }

    return interval.description
  }
}
