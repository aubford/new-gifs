declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module NodeJS {
  interface Global {
     logg: any
  }
}