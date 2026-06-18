import React from 'react';
import ConfirmationClient from './ConfirmationClient';

export function generateStaticParams() {
  return [{ ref: 'example' }];
}

export default function ConfirmationPage({ params }: { params: { ref: string } }) {
  return <ConfirmationClient refId={params.ref} />;
}
