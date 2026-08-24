"use strict";

const bookingDb = window.standbookSupabase;


/* =========================================
   HENT OFFENTLIGT ARRANGEMENT
========================================= */

async function getPublicEvent(slug) {

  const cleanSlug =
    String(slug || "")
      .trim()
      .toLowerCase();


  if (!cleanSlug) {
    throw new Error(
      "Arrangementet blev ikke fundet."
    );
  }


  const { data, error } =
    await bookingDb
      .from("events")
      .select(`
        id,
        title,
        description,
        slug,
        status,
        shift_minutes
      `)
      .eq("slug", cleanSlug)
      .single();


  if (error) {
    throw error;
  }


  /*
    Senere bruger vi status til at styre,
    om linket er åbent.

    Under udviklingen accepterer vi draft,
    så vores testarrangement kan bruges.
  */

  if (
    data.status !== "draft" &&
    data.status !== "open"
  ) {
    throw new Error(
      "Dette arrangement er ikke længere åbent."
    );
  }


  return data;
}


/* =========================================
   HENT STANDE
========================================= */

async function getPublicStands(eventId) {

  const { data, error } =
    await bookingDb
      .from("stands")
      .select(`
        id,
        name,
        address,
        sort_order
      `)
      .eq("event_id", eventId)
      .order(
        "sort_order",
        { ascending: true }
      );


  if (error) {
    throw error;
  }


  return data || [];
}


/* =========================================
   HENT ÅBNINGSDAGE
========================================= */

async function getPublicEventDays(eventId) {

  const { data, error } =
    await bookingDb
      .from("event_days")
      .select(`
        id,
        stand_id,
        event_date,
        opens_at,
        closes_at
      `)
      .eq("event_id", eventId)
      .order(
        "event_date",
        { ascending: true }
      )
      .order(
        "opens_at",
        { ascending: true }
      );


  if (error) {
    throw error;
  }


  return data || [];
}


/* =========================================
   HENT VAGTER
========================================= */

async function getPublicShifts(eventId) {

  const { data, error } =
    await bookingDb
      .from("shifts")
      .select(`
        id,
        stand_id,
        event_day_id,
        start_time,
        end_time,
        capacity,
        is_closed
      `)
      .eq("event_id", eventId)
      .order(
        "event_day_id",
        { ascending: true }
      )
      .order(
        "start_time",
        { ascending: true }
      );


  if (error) {
    throw error;
  }


  return data || [];
}


/* =========================================
   HENT OFFENTLIGE BOOKINGER
========================================= */

async function getPublicBookings(eventId) {

  /*
    Vi henter kun de felter, som
    deltager-siden har brug for.

    Navnene skal være synlige, fordi vi
    tidligere besluttede, at deltagerne
    skal kunne se, hvem der allerede står
    på vagten.
  */

  const { data, error } =
    await bookingDb
      .from("bookings")
      .select(`
        id,
        shift_id,
        name,
        shifts!inner (
          event_id
        )
      `)
      .eq(
        "shifts.event_id",
        eventId
      );


  if (error) {
    throw error;
  }


  return data || [];
}


/* =========================================
   KORTLINK
========================================= */

function createMapUrl(address) {

  return (
    "https://www.google.com/maps/search/?api=1&query="
    + encodeURIComponent(
        String(address || "").trim()
      )
  );
}


/* =========================================
   KONFLIKTKONTROL
========================================= */

async function checkConflict(
  shiftId,
  name
) {

  const { data, error } =
    await bookingDb
      .rpc(
        "check_booking_conflict",
        {
          selected_shift_id:
            shiftId,

          person_name:
            name
        }
      );


  if (error) {
    throw error;
  }


  return data;
}


/* =========================================
   BOOK VAGT
========================================= */

async function bookShift({
  shiftId,
  firstName,
  secondName = null,
  bookBoth = false
}) {

  const { data, error } =
    await bookingDb
      .rpc(
        "book_shift",
        {
          target_shift_id:
            shiftId,

          first_name:
            firstName,

          second_name:
            secondName,

          book_both:
            bookBoth
        }
      );


  if (error) {
    throw error;
  }


  return data;
}


/* =========================================
   EXPORT
========================================= */

window.StandBookBooking = {

  getPublicEvent,
  getPublicStands,
  getPublicEventDays,
  getPublicShifts,
  getPublicBookings,

  createMapUrl,

  checkConflict,
  bookShift

};
