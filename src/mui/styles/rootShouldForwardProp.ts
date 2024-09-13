import slotShouldForwardProp from './slotShouldForwardProp';

const rootShouldForwardProp = (prop: PropertyKey) => slotShouldForwardProp(prop) && prop !== 'classes';

export default rootShouldForwardProp;