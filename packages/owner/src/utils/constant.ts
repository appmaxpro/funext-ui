export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const IS_NEXT_APP = !!BASE_URL;
export const FUNEXT_API_SERVER = process.env.FUNEXT_API_SERVER;
export const IS_BROWSER = typeof window !== "undefined";

export const snackBarDurationShortMs = 1500;
export const snackBarDurationLongMs = 2750;
export const CONTEXT_PATH = process.env.CONTEXT_PATH || "";

export const Dimensions = {
  sidebarMiniWidth: 84,
  sidebarWidth: "28%",
  sidebarWidthTablet: "52px",
  drawerWidthDesktop: "360px",
  drawerWidthTablet: "320px",
  drawerHeightPhone: "250px",
  filterFormWidth: "160px",
  eventsDrawerWidth: "320px",
  bottomBarHeight: 56,
  popupMapOffset: 300,
  popupMaxWidth: 288,
  popupImageHeight: 144,
  cardContentMaxHeight: "40vh",
};

export const EMPTY_ARRAY: readonly any[] = Object.freeze([]);

export const EMPTY_RECORD = Object.freeze({}) as Record<string | symbol, any>;
export const EMPTY_OBJECT = EMPTY_RECORD as Record<string, any>;
// Default number of records to display per page
export const DEFAULT_PAGE_SIZE = 40;
// Default max number of records per page
export const DEFAULT_MAX_PER_PAGE = 500;
// Default number of records to display per kanban column
export const DEFAULT_KANBAN_PAGE_SIZE = 20;
// Default number of records to fetch on search view
export const DEFAULT_SEARCH_PAGE_SIZE = 80;
// Default number of messages to display
export const DEFAULT_MESSAGE_PAGE_SIZE = 80;
// Default number of items to display on completion
export const DEFAULT_COMPLETION_PAGE_SIZE = 10;
// Default polling interval in seconds
export const DEFAULT_POLLING_INTERVAL = 10;

export const APP_THEME_MODE = "app-theme-mode";

export const DATE_RANGES = {
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
  this_quarter: "This Quarter",
  this_year: "This Year",

  last_day: "Yesterday",
  last_week: "This Week",
  last_month: "This Month",
  last_quarter: "This Quarter",
  last_year: "This Year",

  next_day: "Tomorrow",
  next_week: "Next Week",
  next_month: "Next Month",
  next_quarter: "Next Quarter",
  next_year: "Next Year",
};

export const RESISTANCE_COEF = 0.6;

// This value is closed to what browsers are using internally to
// trigger a native scroll.
export const UNCERTAINTY_THRESHOLD = 3; // px

export const TIP_HOVER_PROPS = {
  delay: {
    open: 1000,
    close: 0,
  },
};

export const DEFAULT_SCALE = 2;

const MIN_SCALE = 0;
const MAX_SCALE = 20;

export function limitScale(value?: number) {
  if (value == null) {
    return value;
  }

  if (value < MIN_SCALE) {
    return MIN_SCALE;
  }

  if (value > MAX_SCALE) {
    return MAX_SCALE;
  }

  return value;
}


export const NODE_ENV = process.env.NODE_ENV;


export const isDevelopment = NODE_ENV !== 'production'

export const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";


export const ANIMATIONS_DISABLED = false;