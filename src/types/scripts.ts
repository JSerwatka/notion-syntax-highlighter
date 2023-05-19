declare module '*?script&module' {
  /**
   * Script format is ESM. No loader and no HMR. Does not support frameworks
   * that use HMR. Import into a content script to inject via script tag into
   * the host page main world execution environment.
   *
   * Exports the file name of the output script file.
   *
   * If imported inside a content script, RPCE will include the file name in
   * `web_accessible_resources`.
   */
  const fileName: string;
  export default fileName;
}
