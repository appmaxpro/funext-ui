'use client'
import type { Route } from "./+types/home";
import { lazy, Suspense } from "react";
const OwlDemo = lazy(() => import("~/demo/owl-demo"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Owl App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Owl() {
  if(typeof window === 'undefined'){
    return <span>Loading ...</span>;
  }
  return (
    <Suspense fallback={<span>Loading ...</span>}>
      <OwlDemo />
    </Suspense>
  );
}
