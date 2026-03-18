const config = {
  moduleName: 'cpb-pdu-filter',
  fallbackProviderFormId: 'filter-provider-no-js',
  pduRowId: 'filter-pdu-row',
  jsTemplateId: 'filter-provider-pdu-js',
  providerInputId: 'provider',
  pduInputId: 'pdu',
  defaultPduOption: { value: '', text: 'Choose a region' },
  redirectUrl: '/',
}

export default function initTeamFilter() {
  document.addEventListener('DOMContentLoaded', initFilterModule)
}

async function initFilterModule() {
  const module = document.querySelector(`[data-module="${config.moduleName}"]`)
  if (!module) {
    return
  }

  const providerForm = document.getElementById(config.fallbackProviderFormId)

  if (providerForm) {
    config.redirectUrl = providerForm.getAttribute('action') || config.redirectUrl
    replaceProviderForm(providerForm)

    const providerSelect = document.getElementById(config.providerInputId)

    providerSelect.addEventListener('change', async () => changePdus(providerSelect))
  }
}

async function changePdus(providerSelect) {
  const pduSelect = document.getElementById(config.pduInputId)
  const providerCode = providerSelect.options[providerSelect.selectedIndex].value

  if (providerCode !== '') {
    await populatePdusForRegion(providerCode, pduSelect)
  } else {
    pduSelect.setAttribute('disabled', 'disabled')
    const defaultOption = buildOption(config.defaultPduOption)
    pduSelect.replaceChildren(defaultOption)
  }
}

async function populatePdusForRegion(providerCode, pduSelect) {
  pduSelect.removeAttribute('disabled')
  if (window.pageData.pdus) {
    const pduItems = window.pageData.pdus.pdus
    const filteredPduItems = pduItems.filter(item => item.providerCode === providerCode)
    const pduOptions = filteredPduItems.map(buildOption)
    pduSelect.replaceChildren(buildOption({ id: '', name: 'Choose PDU' }), ...pduOptions)
  }
}

function buildOption(item) {
  const option = document.createElement('option')
  option.value = item.id
  option.text = item.name
  return option
}

function replaceProviderForm(fallbackProviderSelect) {
  const fallbackPduSelect = document.getElementById(config.pduRowId)
  const template = document.getElementById(config.jsTemplateId)
  const clone = document.importNode(template.content, true)
  fallbackProviderSelect.parentElement.removeChild(fallbackProviderSelect)
  fallbackPduSelect.replaceChildren(clone)
}
