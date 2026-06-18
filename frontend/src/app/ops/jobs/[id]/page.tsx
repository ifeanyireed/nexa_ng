import React from 'react';
import OpsJobDetailsClient from './OpsJobDetailsClient';

export function generateStaticParams() {
    return [{ id: 'example' }];
}

export default function OpsJobDetailsPage({ params }: { params: { id: string } }) {
    return <OpsJobDetailsClient id={params.id} />;
}
