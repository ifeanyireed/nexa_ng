import React from 'react';
import ConfirmationClient from './ConfirmationClient';

export function generateStaticParams() {
  return [{ ref: 'example' }];
}

export default async function ConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
  const resolvedParams = await params;

  return <ConfirmationClient refId={resolvedParams.ref} />;
}
