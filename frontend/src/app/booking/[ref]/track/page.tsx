import React from 'react';
import BookingTrackClient from './BookingTrackClient';

export function generateStaticParams() {
    return [{ ref: 'example' }];
}

export default async function BookingTrackPage({ params }: { params: Promise<{ ref: string }> }) {
  const resolvedParams = await params;

    return <BookingTrackClient refId={resolvedParams.ref} />;
}
