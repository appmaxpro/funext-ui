export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const IS_NEXT_APP = !!BASE_URL;
export const FUNEXT_API_SERVER = process.env.FUNEXT_API_SERVER;
export const IS_BROWSER = typeof window !== "undefined";


export const snackBarDurationShortMs = 1500;
export const snackBarDurationLongMs = 2750;


export const Dimensions = {
  sidebarMiniWidth: 84,
  sidebarWidth: '28%',
  sidebarWidthTablet: '52px',
  drawerWidthDesktop: '360px',
  drawerWidthTablet: '320px',
  drawerHeightPhone: '250px',
  filterFormWidth: '160px',
  eventsDrawerWidth: '320px',
  bottomBarHeight: 56,
  popupMapOffset: 300,
  popupMaxWidth: 288,
  popupImageHeight: 144,
  cardContentMaxHeight: '40vh',
};