import React from 'react';
import SupportDisputeClient from './SupportDisputeClient';

export function generateStaticParams() {
  return [{ ref: 'example' }];
}

export default function SupportDisputePage({ params }: { params: { ref: string } }) {
  return <SupportDisputeClient refId={params.ref} />;
}
