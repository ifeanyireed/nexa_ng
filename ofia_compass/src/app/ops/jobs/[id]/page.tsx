import React from 'react';
import OpsJobDetailsClient from './OpsJobDetailsClient';

export function generateStaticParams() {
    return [{ id: 'example' }];
}

export default async function OpsJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

    return <OpsJobDetailsClient id={resolvedParams.id} />;
}
