export function setInputList(container: HTMLElement) {
  function loop() {
    let ionInput = container.querySelector('ion-input[list]')
    if (!ionInput) {
      console.error('ion-input[list] not found')
      return
    }
    let input = container.querySelector<HTMLInputElement>('input')
    if (!input) {
      setTimeout(loop, 33)
      return
    }
    console.log('container:', container)
    console.log('ion-input:', ionInput)
    console.log('input:', input)
    input.setAttribute('list', ionInput.getAttribute('list')!)
  }
  setTimeout(loop)
}
