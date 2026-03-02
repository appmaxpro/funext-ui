import { Route, Routes, useLocation } from "react-router";
import { useNavContext } from "~/context";
import { createNavRoute } from "./navigation-provider";

//example: https://github.com/remix-run/react-router/blob/main/examples/modal/src/App.tsx
function RouteRoot() {
  let location = useLocation();
  const navigation = useNavContext();

  // The `backgroundLocation` state is the location that we were at when one of
  // the gallery links was clicked. If it's there, use it as the location for
  // the <Routes> so we show the gallery in the background, behind the modal.
  let state = location.state as { backgroundLocation?: Location };
  const routes = (navigation || []).map(createNavRoute).filter(Boolean);

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>{routes}</Routes>

      {/* Show the modal when a `backgroundLocation` is set */}
      {state?.backgroundLocation && <PopupRoutes />}
    </>
  );
}

function PopupRoutes() {
  let location = useLocation();
  return (
    <>
      <Routes>
        {/*
        <Route path="/img/:id" element={<Modal />} />
        */}
      </Routes>
    </>
  );
}
