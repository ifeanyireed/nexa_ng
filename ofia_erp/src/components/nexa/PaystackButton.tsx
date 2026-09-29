"use client";

import React, { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Lock } from "lucide-react";

interface PaystackButtonProps {
  config: any;
  onSuccess: (reference: any) => void;
  onClose: () => void;
  text: string;
  className?: string;
  disabled?: boolean;
}

export default function PaystackButton({ config, onSuccess, onClose, text, className, disabled }: PaystackButtonProps) {
  const initializePayment = usePaystackPayment(config);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <NexaButton 
      size="lg" 
      className={className} 
      leftIcon={<Lock className="w-5 h-5" />}
      disabled={disabled}
      isLoading={isSubmitting}
      onClick={() => {
        setIsSubmitting(true);
        initializePayment({
          onSuccess: (ref) => {
            setIsSubmitting(false);
            onSuccess(ref);
          },
          onClose: () => {
            setIsSubmitting(false);
            onClose();
          }
        });
      }}
    >
      {text}
    </NexaButton>
  );
}
