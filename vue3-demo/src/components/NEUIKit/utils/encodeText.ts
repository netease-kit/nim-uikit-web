export default (data: string): string => {
  let text = ''
  for (let i = 0; i < data.length; i++) {
    switch (data.charCodeAt(i)) {
      case 34: // "
        text += '&quot;'
        break
      case 38: // &
        text += '&amp;'
        break
      case 39: // '
        text += '&#x27;' // modified from escape-html; used to be '&#39'
        break
      case 60: // <
        text += '&lt;'
        break
      case 62: // >
        text += '&gt;'
        break
      default:
        text += data[i]
        break
    }
  }
  return text
}
