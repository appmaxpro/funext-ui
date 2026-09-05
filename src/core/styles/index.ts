export * from "./space";
export * from "./theme";

export const slotShouldForwardProp = (prop: string) => prop !== 'ownerState' && prop !== 'theme' && prop !== 'sx' && prop !== 'as';

export const rootShouldForwardProp = (prop: string) => slotShouldForwardProp(prop) && prop !== 'classes';

