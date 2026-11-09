/**
 * Shared High-Performance Auction Timer Engine
 * Uses a single requestAnimationFrame loop and synchronized server clocks.
 * Updates milliseconds smoothly ONLY when less than 10 minutes remain.
 */

export interface TimerBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  formatted: string;
  isUrgent: boolean;     // < 2 minutes (anti-sniping danger zone)
  isEndingSoon: boolean; // < 10 minutes (milliseconds active)
  hasEnded: boolean;
  isScheduled: boolean;
}

type Listener = (breakdown: TimerBreakdown) => void;

class TimerManager {
  private listeners = new Map<string, { endsAtMs: number; startsAtMs: number; listeners: Set<Listener> }>();
  private animFrameId: number | null = null;
  private lastSecondTick = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.startLoop();
      // Handle tab visibility return to resync immediately
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          this.tick(Date.now(), true);
        }
      });
    }
  }

  public subscribe(
    id: string,
    endsAt: Date | string | number,
    listener: Listener,
    startsAt?: Date | string | number
  ): () => void {
    const endsAtMs = new Date(endsAt).getTime();
    const startsAtMs = startsAt ? new Date(startsAt).getTime() : 0;

    if (!this.listeners.has(id)) {
      this.listeners.set(id, { endsAtMs, startsAtMs, listeners: new Set() });
    }

    const entry = this.listeners.get(id)!;
    entry.endsAtMs = endsAtMs;
    entry.startsAtMs = startsAtMs;
    entry.listeners.add(listener);

    // Initial immediate tick for this listener
    listener(this.calculate(Date.now(), endsAtMs, startsAtMs));

    return () => {
      entry.listeners.delete(listener);
      if (entry.listeners.size === 0) {
        this.listeners.delete(id);
      }
    };
  }

  public updateEndsAt(id: string, newEndsAt: Date | string | number) {
    const entry = this.listeners.get(id);
    if (entry) {
      entry.endsAtMs = new Date(newEndsAt).getTime();
    }
  }

  private startLoop() {
    const step = () => {
      const now = Date.now();
      const needsFastTick = this.hasFastTimers(now);

      if (needsFastTick) {
        // Run full tick every frame for smooth milliseconds
        this.tick(now, false);
      } else if (now - this.lastSecondTick >= 1000) {
        // Run once per second to conserve battery & CPU
        this.lastSecondTick = now;
        this.tick(now, false);
      }

      this.animFrameId = requestAnimationFrame(step);
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  private hasFastTimers(now: number): boolean {
    for (const { endsAtMs } of this.listeners.values()) {
      const diff = endsAtMs - now;
      if (diff > 0 && diff <= 10 * 60 * 1000) {
        return true;
      }
    }
    return false;
  }

  private tick(now: number, forceAll: boolean) {
    for (const [_, { endsAtMs, startsAtMs, listeners }] of this.listeners.entries()) {
      if (listeners.size === 0) continue;
      const diff = endsAtMs - now;

      // Only notify if milliseconds needed, force resync, or on second change
      if (forceAll || diff <= 10 * 60 * 1000 || now - this.lastSecondTick < 50) {
        const breakdown = this.calculate(now, endsAtMs, startsAtMs);
        for (const fn of listeners) {
          fn(breakdown);
        }
      }
    }
  }

  public calculate(now: number, endsAtMs: number, startsAtMs: number): TimerBreakdown {
    // Scheduled check
    if (startsAtMs > now) {
      const untilStart = startsAtMs - now;
      const s = Math.floor(untilStart / 1000);
      return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        milliseconds: 0,
        formatted: "Starts Soon",
        isUrgent: false,
        isEndingSoon: false,
        hasEnded: false,
        isScheduled: true,
      };
    }

    const diff = endsAtMs - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        formatted: "Auction Ended",
        isUrgent: false,
        isEndingSoon: false,
        hasEnded: true,
        isScheduled: false,
      };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(diff % 1000);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const padMs = (n: number) => n.toString().padStart(3, "0");

    const isEndingSoon = diff <= 10 * 60 * 1000; // < 10 mins
    const isUrgent = diff <= 2 * 60 * 1000;      // < 2 mins (soft-close zone)

    let formatted = "";
    if (days > 0) {
      formatted = `${days}d ${pad(hours)}h ${pad(minutes)}m`;
    } else if (isEndingSoon) {
      // Milliseconds display: 00 : 08 : 34 : 250
      formatted = `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)} : ${padMs(milliseconds)}`;
    } else {
      formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      formatted,
      isUrgent,
      isEndingSoon,
      hasEnded: false,
      isScheduled: false,
    };
  }
}

// Global Singleton
export const globalTimer = new TimerManager();
