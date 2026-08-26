"use client";

import * as React from "react";
import { Calendar, MapPin } from "lucide-react";
import type { ItineraryDayDto, PackageFlightDto, PackageHotelDto } from "@paxbook/types";
import { computeDayDate, formatDayDate } from "@/lib/itinerary-dates";

export function ItineraryDayList({
  itineraryDays,
  hotels,
  flights,
}: {
  itineraryDays: ItineraryDayDto[];
  hotels: PackageHotelDto[];
  flights: PackageFlightDto[];
}) {
  const [departureDate, setDepartureDate] = React.useState("");
  const parsedDate = departureDate ? new Date(`${departureDate}T00:00:00`) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-mist p-4">
        <Calendar className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
        <label className="text-sm font-semibold text-slate-700">
          Pick a departure date to see the exact calendar dates for this itinerary
        </label>
        <input
          type="date"
          min={new Date().toISOString().slice(0, 10)}
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-4">
        {itineraryDays.map((day) => {
          const dayDate = parsedDate ? computeDayDate(parsedDate, day.dayNumber) : null;
          const linkedHotel = hotels.find((h) => day.dayNumber >= h.checkInDay && day.dayNumber <= h.checkOutDay);
          const linkedFlight = flights.find((f) => f.dayNumber === day.dayNumber);

          return (
            <div key={day.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              {day.imageUrl ? <img src={day.imageUrl} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" /> : null}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">
                  Day {day.dayNumber}
                  {dayDate ? <span className="ml-2 font-medium text-slate-500">{formatDayDate(dayDate)}</span> : null}
                </p>
                {day.location ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} /> {day.location}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-1 font-display text-base text-navy-deep">{day.title}</h3>
              {day.description ? <p className="mt-1 text-sm text-slate-600">{day.description}</p> : null}

              {day.mealsIncluded && day.mealsIncluded.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {day.mealsIncluded.map((meal) => (
                    <span key={meal} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-slate-600">
                      {meal}
                    </span>
                  ))}
                </div>
              ) : null}

              {day.activities.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {day.activities.map((a) => (
                    <li key={a.id} className="flex items-start gap-2 text-sm text-slate-600">
                      {a.imageUrl ? <img src={a.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" /> : null}
                      <span>
                        {a.timeLabel ? <span className="font-semibold text-slate-800">{a.timeLabel} — </span> : null}
                        {a.name} {a.isOptional ? <span className="text-slate-400">(optional)</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {linkedHotel || linkedFlight ? (
                <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3 text-sm">
                  {linkedHotel ? (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Stay: </span>
                      {linkedHotel.cityName} {linkedHotel.roomType ? `· ${linkedHotel.roomType}` : ""} {linkedHotel.mealPlan ? `· ${linkedHotel.mealPlan}` : ""}
                    </p>
                  ) : null}
                  {linkedFlight ? (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Transfer: </span>
                      {linkedFlight.sector} {linkedFlight.carrierName ? `· ${linkedFlight.carrierName}` : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {day.notes ? <p className="mt-3 text-xs italic text-slate-400">{day.notes}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
