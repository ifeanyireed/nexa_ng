"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Save, Loader2, CheckCircle } from "lucide-react";

import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 8;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  const paddedHour = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
  return `${paddedHour}:00 ${period}`;
});

const defaultAvailability: Record<string, string[]> = {
  Sunday: [],
  Monday: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"],
  Tuesday: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"],
  Wednesday: ["09:00 AM", "10:00 AM", "11:00 AM"],
  Thursday: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"],
  Friday: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM"],
  Saturday: [],
};

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Record<string, string[]>>(defaultAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const data = await api.get("/pro/availability");
        if (data && Object.keys(data).length > 0) {
          const normalized: Record<string, string[]> = {};
          days.forEach((d) => {
            normalized[d] = data[d] || [];
          });
          setAvailability(normalized);
        } else {
          setAvailability(defaultAvailability);
        }
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const toggleTimeSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(time)) {
        return { ...prev, [day]: daySlots.filter((t) => t !== time) };
      } else {
        return { ...prev, [day]: [...daySlots, time] };
      }
    });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.put("/pro/availability", availability);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save availability:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-nexa-bg-surface rounded-[32px]" />
      <div className="h-96 bg-nexa-bg-surface rounded-3xl" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-display">Availability</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">Set your working hours for customer bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
              <CheckCircle className="w-4 h-4 animate-bounce" /> Saved successfully
            </div>
          )}
          <NexaButton 
            leftIcon={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
            className="px-8 shadow-xl shadow-nexa-brand/20"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </NexaButton>
        </div>
      </div>

      <NexaCard className="p-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b border-nexa-border w-24">
                  <Clock className="w-5 h-5 mx-auto text-nexa-text-faint" />
                </th>
                {days.map((day) => (
                  <th key={day} className="p-2 border-b border-nexa-border text-sm font-bold text-nexa-text-secondary">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="p-2 border-b border-nexa-border text-xs font-bold text-nexa-text-faint text-center">{time}</td>
                  {days.map((day) => {
                    const isAvailable = (availability[day] || []).includes(time);
                    return (
                      <td key={day} className="p-1 border-b border-nexa-border text-center">
                        <motion.button
                          onClick={() => toggleTimeSlot(day, time)}
                          className={cn(
                            "w-full h-8 rounded-lg transition-colors border",
                            isAvailable 
                              ? "bg-nexa-brand/20 border-nexa-brand/30 text-nexa-brand" 
                              : "bg-nexa-bg-surface border-transparent hover:bg-nexa-bg-base"
                          )}
                          whileTap={{ scale: 0.9 }}
                          title={`${day} at ${time}: ${isAvailable ? "Available" : "Unavailable"}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NexaCard>
    </div>
  );
}
