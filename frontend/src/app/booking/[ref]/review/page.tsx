import React from 'react';
import BookingReviewClient from './BookingReviewClient';

export function generateStaticParams() {
    return [{ ref: 'example' }];
}

export default function BookingReviewPage({ params }: { params: { ref: string } }) {
    return <BookingReviewClient refId={params.ref} />;
}
