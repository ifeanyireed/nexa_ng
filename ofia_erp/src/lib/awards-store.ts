"use client";

import { useState, useEffect, useCallback } from "react";
import { extractSubdomainOrParam } from "./tenant-context";

export interface AwardNominee {
  id: string;
  categoryId: string;
  eventId: string;
  tenantSlug: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  avatarUrl: string;
  nominationPitch: string;
  displayOrder: number;
  isActive: boolean;
}

export interface AwardCategory {
  id: string;
  eventId: string;
  tenantSlug: string;
  name: string;
  slug: string;
  description: string;
  criteria: string;
  iconName: string;
  imageUrl?: string;
  maxWinners: number;
  minSelections: number;
  sortOrder: number;
  eligibleDepartments?: string[];
  nominees?: AwardNominee[];
}

export interface TurnoutStats {
  totalEligibleStaff: number;
  totalBallotsCast: number;
  turnoutPercentage: number;
  activeCategories: number;
  daysRemaining: number;
  isVotingOpen: boolean;
  departmentTurnout?: {
    department: string;
    totalStaff: number;
    votedCount: number;
    percentage: number;
  }[];
}

export interface AwardEvent {
  id: string;
  tenantSlug: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  awardYear: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "FINALIZED" | "PUBLISHED";
  isAnonymous: boolean;
  allowVoteEditing: boolean;
  isPublicVisible: boolean;
  publicSlug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  categories?: AwardCategory[];
  stats?: TurnoutStats;
}

export interface AwardBallot {
  id: string;
  eventId: string;
  tenantSlug: string;
  employeeId: string;
  receiptHash: string;
  isSealed: boolean;
  categoriesVotedCount: number;
  submittedAt: string;
}

export interface AwardWinner {
  id: string;
  eventId: string;
  categoryId: string;
  nomineeId: string;
  tenantSlug: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  avatarUrl: string;
  rank: number;
  totalVotesReceived: number;
  citation: string;
  certificateNumber: string;
  publishedAt: string;
  categoryName?: string;
  eventTitle?: string;
  awardYear?: number;
}

export interface StaffCandidate {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  avatar: string;
  role: string;
}

export function useAwardsStore() {
  const [activeEvent, setActiveEvent] = useState<AwardEvent | null>(null);
  const [eventsList, setEventsList] = useState<AwardEvent[]>([]);
  const [hallOfFame, setHallOfFame] = useState<AwardWinner[]>([]);
  const [turnoutStats, setTurnoutStats] = useState<TurnoutStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tenant helper
  const getTenantSlug = useCallback(() => {
    if (typeof window !== "undefined") {
      return extractSubdomainOrParam() || "nexa";
    }
    return "nexa";
  }, []);

  // Fetch active event (or a specific event by id)
  const fetchActiveEvent = useCallback(async (targetEventId?: string) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const url = targetEventId
        ? `/api/erp/awards/events?id=${encodeURIComponent(targetEventId)}&tenant=${tenant}`
        : `/api/erp/awards/events?active=true&tenant=${tenant}`;

      const res = await fetch(url, {
        headers: { "x-tenant-slug": tenant },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.event && data.event.id) {
          setActiveEvent(data.event);
          return data.event;
        } else {
          setActiveEvent(null);
          return null;
        }
      } else {
        setActiveEvent(null);
      }
    } catch (err: any) {
      console.warn("[awards-store] Error fetching active event:", err.message);
      setActiveEvent(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [getTenantSlug]);

  // Fetch all events for tenant
  const fetchEvents = useCallback(async () => {
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/events?tenant=${tenant}`, {
        headers: { "x-tenant-slug": tenant },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.events) ? data.events : [];
        setEventsList(list);
        return list;
      }
    } catch (err: any) {
      console.warn("[awards-store] Error fetching events list:", err.message);
    }
    setEventsList([]);
    return [];
  }, [getTenantSlug]);

  // Fetch Turnout
  const fetchTurnout = useCallback(async (eventId: string) => {
    if (!eventId) return null;
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/turnout?eventId=${encodeURIComponent(eventId)}&tenant=${tenant}`, {
        headers: { "x-tenant-slug": tenant },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.turnout) {
          setTurnoutStats(data.turnout);
          return data.turnout;
        }
      }
    } catch {}
    return null;
  }, [getTenantSlug]);

  // Fetch Hall of Fame
  const fetchHallOfFame = useCallback(async (year?: number) => {
    const tenant = getTenantSlug();
    const query = year ? `?year=${year}&tenant=${tenant}` : `?tenant=${tenant}`;
    try {
      const res = await fetch(`/api/erp/awards/hall-of-fame${query}`, {
        headers: { "x-tenant-slug": tenant },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.winners) ? data.winners : [];
        setHallOfFame(list);
        return list;
      }
    } catch {}
    setHallOfFame([]);
    return [];
  }, [getTenantSlug]);

  // Check Ballot Status for Employee
  const checkBallotStatus = useCallback(async (eventId: string, employeeId: string) => {
    if (!eventId || !employeeId) return { hasVoted: false, ballot: null };
    const tenant = getTenantSlug();

    // Check localStorage cache first
    if (typeof window !== "undefined") {
      const localReceipt = localStorage.getItem(`ofia_ballot_${eventId}_${employeeId}`);
      if (localReceipt) {
        try {
          const parsed = JSON.parse(localReceipt);
          return { hasVoted: true, ballot: parsed };
        } catch {}
      }
    }

    try {
      const res = await fetch(
        `/api/erp/awards/vote?eventId=${encodeURIComponent(eventId)}&employeeId=${encodeURIComponent(employeeId)}&tenant=${tenant}`,
        { headers: { "x-tenant-slug": tenant } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.hasVoted && data.ballot && typeof window !== "undefined") {
          localStorage.setItem(`ofia_ballot_${eventId}_${employeeId}`, JSON.stringify(data.ballot));
        }
        return data;
      }
    } catch {}

    return { hasVoted: false, ballot: null };
  }, [getTenantSlug]);

  // Submit Ballot
  const submitBallot = useCallback(async (
    eventId: string,
    employeeId: string,
    selections: { categoryId: string; nomineeId: string }[]
  ) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();

    // Client-side anti-self-vote pre-validation
    if (activeEvent?.categories) {
      for (const sel of selections) {
        const cat = activeEvent.categories.find(c => c.id === sel.categoryId);
        const nominee = cat?.nominees?.find(n => n.id === sel.nomineeId);
        if (nominee && nominee.employeeId.toLowerCase() === employeeId.toLowerCase()) {
          const errMsg = `Self-voting is strictly prohibited by HR integrity policy. You cannot vote for yourself in "${cat?.name}".`;
          setError(errMsg);
          setIsLoading(false);
          return { success: false, error: errMsg };
        }
      }
    }

    try {
      const res = await fetch(`/api/erp/awards/vote?tenant=${tenant}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify({
          eventId,
          employeeId,
          selections,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save sealed ballot receipt locally
        if (typeof window !== "undefined") {
          localStorage.setItem(`ofia_ballot_${eventId}_${employeeId}`, JSON.stringify({
            receiptHash: data.receiptHash,
            categoriesVotedCount: data.categoriesVotedCount,
            submittedAt: data.submittedAt || new Date().toISOString(),
            isSealed: true,
          }));
        }
        await fetchTurnout(eventId);
        setIsLoading(false);
        return data;
      } else {
        const err = data.error || "Failed to submit ballot";
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit ballot");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [activeEvent, fetchTurnout, getTenantSlug]);

  // Create Event
  const createEvent = useCallback(async (eventData: Partial<AwardEvent>) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/events?tenant=${tenant}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchEvents();
        if (data.eventId) {
          await fetchActiveEvent(data.eventId);
        }
        return data;
      } else {
        setError(data.error || "Failed to create event");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to create event");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveEvent, fetchEvents, getTenantSlug]);

  // Update Event
  const updateEvent = useCallback(async (eventId: string, eventData: Partial<AwardEvent>) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/events?tenant=${tenant}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify({ id: eventId, ...eventData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchEvents();
        await fetchActiveEvent(eventId);
        return data;
      } else {
        setError(data.error || "Failed to update event");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to update event");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveEvent, fetchEvents, getTenantSlug]);

  // Delete Event
  const deleteEvent = useCallback(async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/events?id=${encodeURIComponent(eventId)}&tenant=${tenant}`, {
        method: "DELETE",
        headers: { "x-tenant-slug": tenant },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const remaining = await fetchEvents();
        if (remaining.length > 0) {
          await fetchActiveEvent(remaining[0].id);
        } else {
          setActiveEvent(null);
          setTurnoutStats(null);
        }
        return data;
      } else {
        setError(data.error || "Failed to delete event");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveEvent, fetchEvents, getTenantSlug]);

  // Finalize Results
  const finalizeResults = useCallback(async (eventId: string) => {
    setIsLoading(true);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/finalize?tenant=${tenant}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchActiveEvent(eventId);
        return data;
      }
    } catch {} finally {
      setIsLoading(false);
    }
    return { success: false };
  }, [fetchActiveEvent, getTenantSlug]);

  // Publish Winners
  const publishWinners = useCallback(async (eventId: string) => {
    setIsLoading(true);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/publish?tenant=${tenant}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchActiveEvent(eventId);
        await fetchHallOfFame();
        return data;
      }
    } catch {} finally {
      setIsLoading(false);
    }
    return { success: false };
  }, [fetchActiveEvent, fetchHallOfFame, getTenantSlug]);

  // Create Category
  const createCategory = useCallback(async (catData: Partial<AwardCategory>) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/categories?tenant=${tenant}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify(catData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (catData.eventId) {
          await fetchActiveEvent(catData.eventId);
        } else {
          await fetchActiveEvent();
        }
        return data;
      } else {
        setError(data.error || "Failed to create category");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to create category");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveEvent, getTenantSlug]);

  // Update Category
  const updateCategory = useCallback(async (categoryId: string, catData: Partial<AwardCategory>) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/categories?tenant=${tenant}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify({ id: categoryId, ...catData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (activeEvent?.id) {
          await fetchActiveEvent(activeEvent.id);
        } else {
          await fetchActiveEvent();
        }
        return data;
      } else {
        setError(data.error || "Failed to update category");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to update category");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [activeEvent?.id, fetchActiveEvent, getTenantSlug]);

  // Delete Category
  const deleteCategory = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/categories?id=${encodeURIComponent(categoryId)}&tenant=${tenant}`, {
        method: "DELETE",
        headers: { "x-tenant-slug": tenant },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (activeEvent?.id) {
          await fetchActiveEvent(activeEvent.id);
        } else {
          await fetchActiveEvent();
        }
        return data;
      } else {
        setError(data.error || "Failed to delete category");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [activeEvent?.id, fetchActiveEvent, getTenantSlug]);

  // Create Nominee
  const createNominee = useCallback(async (nomineeData: {
    eventId: string;
    categoryId: string;
    employeeId: string;
    nominationPitch: string;
    employeeName?: string;
    department?: string;
    designation?: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/nominees?tenant=${tenant}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenant,
        },
        body: JSON.stringify(nomineeData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (nomineeData.eventId) {
          await fetchActiveEvent(nomineeData.eventId);
        } else {
          await fetchActiveEvent();
        }
        return data;
      } else {
        setError(data.error || "Failed to add nominee");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to add nominee");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveEvent, getTenantSlug]);

  // Delete Nominee
  const deleteNominee = useCallback(async (nomineeId: string) => {
    setIsLoading(true);
    setError(null);
    const tenant = getTenantSlug();
    try {
      const res = await fetch(`/api/erp/awards/nominees?id=${encodeURIComponent(nomineeId)}&tenant=${tenant}`, {
        method: "DELETE",
        headers: { "x-tenant-slug": tenant },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (activeEvent?.id) {
          await fetchActiveEvent(activeEvent.id);
        } else {
          await fetchActiveEvent();
        }
        return data;
      } else {
        setError(data.error || "Failed to remove nominee");
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove nominee");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [activeEvent?.id, fetchActiveEvent, getTenantSlug]);

  // Initial mount load
  useEffect(() => {
    fetchEvents().then((events) => {
      if (events && events.length > 0) {
        fetchActiveEvent(events[0].id);
      } else {
        fetchActiveEvent();
      }
    });
    fetchHallOfFame();
  }, [fetchEvents, fetchActiveEvent, fetchHallOfFame]);

  return {
    activeEvent,
    setActiveEvent,
    eventsList,
    hallOfFame,
    turnoutStats,
    isLoading,
    error,
    fetchActiveEvent,
    fetchEvents,
    fetchTurnout,
    fetchHallOfFame,
    checkBallotStatus,
    submitBallot,
    createEvent,
    updateEvent,
    deleteEvent,
    finalizeResults,
    publishWinners,
    createCategory,
    updateCategory,
    deleteCategory,
    createNominee,
    deleteNominee,
  };
}
