import React from "react";
import CityClient from "./CityClient";

export function generateStaticParams() {
  return [
    { city: "lagos" },
    { city: "abuja" },
    { city: "port-harcourt" },
  ];
}

export default function CityPage() {
  return <CityClient />;
}
