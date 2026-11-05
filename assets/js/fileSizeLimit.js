import { createAll, ErrorSummary } from 'govuk-frontend'

const config = {
  moduleName: 'cpb-file-size-limit',
  errorSummaryTemplateId: 'file-size-limit-error-summary',
  errorMessageTemplateId: 'file-size-limit-error-message',
  errorMessageId: 'file-error',
}

export default function initFileSizeLimit() {
  document.addEventListener('DOMContentLoaded', initFileSizeLimitModule)
}

function initFileSizeLimitModule() {
  const module = document.querySelector(`[data-module="${config.moduleName}"]`)
  if (!module) {
    return
  }

  const form = module.closest('form')
  const input = module.querySelector('input[type="file"]')
  const maxFileSizeBytes = Number(module.dataset.maxFileSizeBytes)

  form.addEventListener('submit', event => {
    const file = input.files[0]

    if (file && file.size > maxFileSizeBytes) {
      event.preventDefault()
      showInlineError(module, input)
      showErrorSummary()
    }
  })
}

function showInlineError(module, input) {
  const formGroup = module.querySelector('.govuk-form-group')
  const existingErrorMessage = formGroup.querySelector('.govuk-error-message')
  const errorMessage = cloneTemplate(config.errorMessageTemplateId)

  if (existingErrorMessage) {
    existingErrorMessage.replaceWith(errorMessage)
  } else {
    const wrapper = formGroup.querySelector('.govuk-file-upload-wrapper') || input
    wrapper.before(errorMessage)
  }

  formGroup.classList.add('govuk-form-group--error')
  input.classList.add('govuk-file-upload--error')

  const button = formGroup.querySelector('.govuk-file-upload-button')
  ;[input, button].filter(Boolean).forEach(addErrorMessageToDescribedBy)
}

function addErrorMessageToDescribedBy(element) {
  const describedBy = (element.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)

  if (!describedBy.includes(config.errorMessageId)) {
    element.setAttribute('aria-describedby', [...describedBy, config.errorMessageId].join(' '))
  }
}

function showErrorSummary() {
  document.querySelectorAll('.govuk-error-summary').forEach(existingSummary => existingSummary.remove())

  const main = document.getElementById('main-content')
  main.prepend(cloneTemplate(config.errorSummaryTemplateId))
  createAll(ErrorSummary, undefined, main)

  if (!document.title.startsWith('Error: ')) {
    document.title = `Error: ${document.title}`
  }
}

function cloneTemplate(templateId) {
  const template = document.getElementById(templateId)
  return document.importNode(template.content, true).firstElementChild
}
