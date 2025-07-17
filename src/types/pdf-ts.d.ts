declare module "pdf-ts" {
  function pdfToText(dataBuffer: Buffer): Promise<string>;
  export { pdfToText };
}
