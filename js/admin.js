"use strict";

const db = window.standbookSupabase;


/* =========================================
   HJÆLPEFUNKTIONER
========================================= */

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function createMapUrl(address) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(address.trim())
  );
}


/* =========================================
   ARRANGEMENTER
========================================= */

async function createEvent({
  title,
  description,
  slug,
  shiftMinutes,
  userId
}) {

  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  const cleanSlug = slug.trim();

  if (!cleanTitle) {
    throw new Error(
      "Arrangementet skal have et navn."
    );
  }

  if (!cleanSlug) {
    throw new Error(
      "Arrangementet skal have et URL-navn."
    );
  }

  if (
    !Number.isInteger(shiftMinutes) ||
    shiftMinutes < 15 ||
    shiftMinutes > 480
  ) {
    throw new Error(
      "Vagtlængden er ugyldig."
    );
  }


  const { data, error } = await db
    .from("events")
    .insert({
      title: cleanTitle,
      description: cleanDescription || null,
      slug: cleanSlug,
      status: "draft",
      shift_minutes: shiftMinutes,
      created_by: userId
    })
    .select()
    .single();


  if (error) {

    if (error.code === "23505") {
      throw new Error(
        "URL-navnet bruges allerede af et andet arrangement."
      );
    }

    throw error;
  }

  return data;
}


async function getEvents() {

  const { data, error } = await db
    .from("events")
    .select(`
      id,
      title,
      description,
      slug,
      status,
      shift_minutes,
      created_at
    `)
    .order(
      "created_at",
      { ascending: false }
    );


  if (error) {
    throw error;
  }

  return data || [];
}


async function getEvent(eventId) {

  const { data, error } = await db
    .from("events")
    .select(`
      id,
      title,
      description,
      slug,
      status,
      shift_minutes,
      created_at
    `)
    .eq("id", eventId)
    .single();


  if (error) {
    throw error;
  }

  return data;
}


/* =========================================
   STANDE
========================================= */

async function getStands(eventId) {

  const { data, error } = await db
    .from("stands")
    .select(`
      id,
      event_id,
      name,
      address,
      sort_order
    `)
    .eq("event_id", eventId)
    .order(
      "sort_order",
      { ascending: true }
    )
    .order(
      "id",
      { ascending: true }
    );


  if (error) {
    throw error;
  }

  return data || [];
}


async function createStand({
  eventId,
  name,
  address
}) {

  const cleanName = name.trim();
  const cleanAddress = address.trim();


  if (!cleanName) {
    throw new Error(
      "Standen skal have et navn."
    );
  }

  if (!cleanAddress) {
    throw new Error(
      "Standen skal have en adresse."
    );
  }


  const existingStands =
    await getStands(eventId);


  const { data, error } = await db
    .from("stands")
    .insert({
      event_id: eventId,
      name: cleanName,
      address: cleanAddress,
      sort_order: existingStands.length
    })
    .select()
    .single();


  if (error) {
    throw error;
  }

  return data;
}


/* =========================================
   ÅBNINGSDAGE
========================================= */

async function getEventDays(eventId) {

  const { data, error } = await db
    .from("event_days")
    .select(`
      id,
      event_id,
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


async function addStandDay({
  eventId,
  standId,
  eventDate,
  opensAt,
  closesAt
}) {

  if (!eventDate) {
    throw new Error(
      "Vælg en dato."
    );
  }

  if (!opensAt || !closesAt) {
    throw new Error(
      "Vælg både start- og sluttid."
    );
  }

  if (closesAt <= opensAt) {
    throw new Error(
      "Sluttiden skal være senere end starttiden."
    );
  }


  const { data, error } = await db
    .from("event_days")
    .insert({
      event_id: eventId,
      stand_id: standId,
      event_date: eventDate,
      opens_at: opensAt,
      closes_at: closesAt
    })
    .select()
    .single();


  if (error) {

    if (error.code === "23505") {
      throw new Error(
        "Denne stand har allerede åbningstider på den valgte dato."
      );
    }

    throw error;
  }

  return data;
}


/* =========================================
   EXPORT
========================================= */

window.StandBookAdmin = {

  createSlug,
  createMapUrl,

  createEvent,
  getEvents,
  getEvent,

  getStands,
  createStand,

  getEventDays,
  addStandDay

};
