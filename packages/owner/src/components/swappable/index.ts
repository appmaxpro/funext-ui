//https://react-swipeable-views.com/demos/demos/#virtualize
//https://github.com/oliviertassinari/react-swipeable-views
export { default as checkIndexBounds } from './checkIndexBounds';
export { default as computeIndex } from './computeIndex';
export { default as getDisplaySameSlide } from './getDisplaySameSlide';
declare const codegen: { require: (path: string) => any }
const SwappableViews = codegen.require('./swappable_views')

export default SwappableViews;
