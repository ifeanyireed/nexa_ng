import React from 'react';
import JobDetailsClient from './JobDetailsClient';

export function generateStaticParams() {
    return [{ id: 'example' }];
}

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

    return <JobDetailsClient id={resolvedParams.id} />;
}
