import React from 'react';
import BookingReviewClient from './BookingReviewClient';

export function generateStaticParams() {
    return [{ ref: 'example' }];
}

export default async function BookingReviewPage({ params }: { params: Promise<{ ref: string }> }) {
  const resolvedParams = await params;

    return <BookingReviewClient refId={resolvedParams.ref} />;
}
