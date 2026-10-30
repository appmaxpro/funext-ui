import React from 'react';
import { Loader } from '~/components';

//export {default as TrackingPage} from './tracking-page'

const TrackingPageLazy = React.lazy(() => import("./tracking-page"));

export const TrackingPage = ()=> React.createElement(
  React.Suspense,
  {
    name: 'TrackingPage',
    fallback: React.createElement(Loader),
    children: React.createElement(TrackingPageLazy)
  });