import type { DialogHook } from "~/context/dialog";
import type { DeviceSelector } from "./types";
import evalHelpers from "./eval-helpers";

let deviceSelector:DeviceSelector|undefined ;
let dialogs:DialogHook|undefined;

type App = typeof evalHelpers & {
  deviceSelector:DeviceSelector ;
  dialogs:DialogHook;
}
const app = {
  deviceSelector,
  dialogs
} as App;

Object.defineProperties(app, Object.getOwnPropertyDescriptors(evalHelpers));

export default app