const logg = (name, value) => console.log(
  '%c *** ' + name,
  'color: orange; font-weight: bold; font-size: 18px',
  value
)

declare global {
  interface Console {
    logg: any
  }
}

export default logg