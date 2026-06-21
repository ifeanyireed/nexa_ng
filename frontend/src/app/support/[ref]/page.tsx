import React from 'react';
import SupportDisputeClient from './SupportDisputeClient';

export function generateStaticParams() {
  return [{ ref: 'example' }];
}

export default async function SupportDisputePage({ params }: { params: Promise<{ ref: string }> }) {
  const resolvedParams = await params;

  return <SupportDisputeClient refId={resolvedParams.ref} />;
}
