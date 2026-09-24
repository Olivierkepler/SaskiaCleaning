import { NextResponse } from "next/server";
import {
  listWeeklyAvailability,
  upsertWeeklyAvailability,
} from "@/app/lib/scheduling";
import { parseBookingTime } from "@/app/lib/scheduling-pure";
import {
  getSchedulingBufferSettings,
  updateJobBufferMinutes,
} from "@/app/lib/booking-buffer";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertDashboardKey(req: Request): boolean {
  const url = new URL(req.url);
  return url.searchParams.get("key") === process.env.DASHBOARD_KEY;
}

export async function GET(req: Request) {
  if (!assertDashboardKey(req)) return unauthorized();

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const [days, bufferSettings] = await Promise.all([
      listWeeklyAvailability(),
      getSchedulingBufferSettings(),
    ]);

    if (date) {
      const { getCapacityAwareSlotsForDate } = await import(
        "@/app/lib/staff-capacity"
      );
      const { isValidBookingDateOnly } = await import(
        "@/app/lib/scheduling-pure"
      );
      const { resolveDurationForBooking } = await import(
        "@/app/lib/booking-duration"
      );
      if (!isValidBookingDateOnly(date)) {
        return NextResponse.json(
          { error: "Invalid date. Use YYYY-MM-DD." },
          { status: 400 },
        );
      }
      const service = url.searchParams.get("service") || "Standard";
      const duration = await resolveDurationForBooking({ service });
      if (!duration.ok) {
        return NextResponse.json({ error: duration.error }, { status: 400 });
      }
      const slots = await getCapacityAwareSlotsForDate(date, {
        durationMinutes: duration.minutes,
        bufferMinutes: bufferSettings.jobBufferMinutes,
      });
      return NextResponse.json({
        days,
        jobBufferMinutes: bufferSettings.jobBufferMinutes,
        date,
        estimatedDurationMinutes: duration.minutes,
        slots: slots.map((s) => ({
          time: s.time,
          label: s.label,
          capacity: s.capacity,
          booked: s.booked,
          remaining: s.remaining,
          available: s.available,
        })),
      });
    }

    return NextResponse.json({
      days,
      jobBufferMinutes: bufferSettings.jobBufferMinutes,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load availability." },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  if (!assertDashboardKey(req)) return unauthorized();

  try {
    const body = await req.json();

    if (body?.jobBufferMinutes != null && body?.days == null) {
      const updated = await updateJobBufferMinutes(body.jobBufferMinutes);
      if (!updated.ok) {
        return NextResponse.json({ error: updated.error }, { status: 400 });
      }
      return NextResponse.json({
        jobBufferMinutes: updated.jobBufferMinutes,
      });
    }

    const days = Array.isArray(body?.days) ? body.days : null;
    if (!days) {
      return NextResponse.json({ error: "days array required." }, { status: 400 });
    }

    const normalized = days.map(
      (day: {
        dayOfWeek?: unknown;
        startTime?: unknown;
        endTime?: unknown;
        slotIntervalMinutes?: unknown;
        isActive?: unknown;
      }) => {
        const dayOfWeek = Number(day.dayOfWeek);
        const startTime = parseBookingTime(
          typeof day.startTime === "string" ? day.startTime : null,
        );
        const endTime = parseBookingTime(
          typeof day.endTime === "string" ? day.endTime : null,
        );
        const slotIntervalMinutes = Number(day.slotIntervalMinutes) || 60;
        if (
          !Number.isInteger(dayOfWeek) ||
          dayOfWeek < 0 ||
          dayOfWeek > 6 ||
          !startTime ||
          !endTime ||
          startTime >= endTime ||
          ![15, 30, 60].includes(slotIntervalMinutes)
        ) {
          throw new Error("Invalid day row.");
        }
        return {
          dayOfWeek,
          startTime,
          endTime,
          slotIntervalMinutes,
          isActive: Boolean(day.isActive),
        };
      },
    );

    const updated = await upsertWeeklyAvailability(normalized);

    let jobBufferMinutes: number | undefined;
    if (body?.jobBufferMinutes != null) {
      const bufferResult = await updateJobBufferMinutes(body.jobBufferMinutes);
      if (!bufferResult.ok) {
        return NextResponse.json({ error: bufferResult.error }, { status: 400 });
      }
      jobBufferMinutes = bufferResult.jobBufferMinutes;
    } else {
      const settings = await getSchedulingBufferSettings();
      jobBufferMinutes = settings.jobBufferMinutes;
    }

    return NextResponse.json({ days: updated, jobBufferMinutes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save availability." },
      { status: 400 },
    );
  }
}
