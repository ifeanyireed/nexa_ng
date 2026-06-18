import React from 'react';
import JobDetailsClient from './JobDetailsClient';

export function generateStaticParams() {
    return [{ id: 'example' }];
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
    return <JobDetailsClient id={params.id} />;
}
