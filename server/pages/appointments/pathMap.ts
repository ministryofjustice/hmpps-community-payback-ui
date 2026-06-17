export type AppointmentFormPage =
  | 'choose-supervisor'
  | 'attendance-outcome'
  | 'log-hours'
  | 'log-compliance'
  | 'confirm-details'
  // Keeping these in the same type because it's easier to add route guards than type checks
  | 'appointment-details'
  | 'select-people'
