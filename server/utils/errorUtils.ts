type ValidationError = {
  [key: string]: { text: string }
}

export default function generateErrorSummary<T extends ValidationError>(validationErrors: T) {
  return Object.keys(validationErrors).map(k => ({
    text: validationErrors[k].text,
    href: `#${k}`,
    attributes: {
      [`data-cy-error-${k}`]: validationErrors[k].text,
    },
  }))
}
