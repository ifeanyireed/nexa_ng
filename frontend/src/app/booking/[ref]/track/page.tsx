import React from 'react';
import BookingTrackClient from './BookingTrackClient';

export function generateStaticParams() {
    return [{ ref: 'example' }];
}

export default function BookingTrackPage({ params }: { params: { ref: string } }) {
    return <BookingTrackClient refId={params.ref} />;
}
