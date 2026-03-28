import React from "react";

const useLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export {useLayoutEffect}