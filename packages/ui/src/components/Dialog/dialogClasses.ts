import {
  generateUtilityClass,
  generateUtilityClasses
} from "../../styles";


export interface DialogClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the container element if `scroll="panel"`. */
  scrollPanel: string;
  /** Styles applied to the container element if `scroll="body"`. */
  scrollBody: string;
  /** Styles applied to the container element. */
  container: string;
  /** Styles applied to the Panel component. */
  panel: string;
  /** Styles applied to the Panel component if `scroll="panel"`. */
  panelScrollPanel: string;
  /** Styles applied to the Panel component if `scroll="body"`. */
  panelScrollBody: string;
  panelScrollHidden: string;
  /** Styles applied to the Panel component if `maxWidth=false`. */
  panelSizeFalse: string;
  /** Styles applied to the Panel component if `maxWidth="xs"`. */
  panelSizeXs: string;
  /** Styles applied to the Panel component if `maxWidth="sm"`. */
  panelSizeSm: string;
  /** Styles applied to the Panel component if `maxWidth="md"`. */
  panelSizeMd: string;
  /** Styles applied to the Panel component if `maxWidth="lg"`. */
  panelSizeLg: string;
  /** Styles applied to the Panel component if `maxWidth="xl"`. */
  panelSizeXl: string;
  /** Styles applied to the Panel component if `fullWidth={true}`. */
  panelFullWidth: string;
  /** Styles applied to the Panel component if `fullScreen={true}`. */
  panelFullScreen: string;

  dialogBody: string;
  dialogHeader: string;
  dialogFooter: string;
}

export type DialogClassKey = keyof DialogClasses;

export function getDialogUtilityClass(slot: string): string {
  return generateUtilityClass("MuxDialog", slot);
}

const dialogClasses: DialogClasses = generateUtilityClasses("MuxDialog", [
  "root",
  "scrollPanel",
  "scrollBody",
  "container",
  "panel",
  "panelScrollPanel",
  "panelScrollBody",
  "panelScrollHidden",
  "panelSizeFalse",
  "panelSizeXs",
  "panelSizeSm",
  "panelSizeMd",
  "panelSizeLg",
  "panelSizeXl",
  "panelFullWidth",
  "panelFullScreen",
  "dialogBody",
  "dialogHeader",
  "dialogFooter"
]);

export { dialogClasses };
