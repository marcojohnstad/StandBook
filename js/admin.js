"use strict";

const db = window.standbookSupabase;


/* =========================================
   HJÆLPEFUNKTIONER
========================================= */

function createSlug(text) {

  return text
    .toLowerCase()
    .trim()

    // Danske bogstaver
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")

    // Alt andet end bogstaver/tal bliver -
    .replace(/[^a-z0-9]+/g, "-")

    // Fjern - i starten/slutningen
    .replace(/^-+|-+$/g, "");
}


/* =========================================
   OPRET ARRANGEMENT
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


  const {
    data,
    error
  } = await db
    .from("events")
    .insert({
      title: cleanTitle,

      description:
        cleanDescription || null,

      slug: cleanSlug,

      status: "draft",

      shift_minutes: shiftMinutes,

      created_by: userId
    })
    .select()
    .single();


  if (error) {

    /*
      PostgreSQL-fejl 23505 betyder
      typisk duplicate/unique constraint.
    */

    if (error.code === "23505") {

      throw new Error(
        "URL-navnet bruges allerede af et andet arrangement."
      );

    }

    throw error;
  }


  return data;
}


/* =========================================
   HENT ARRANGEMENTER
========================================= */

async function getEvents() {

  const {
    data,
    error
  } = await db
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


/* =========================================
   EXPORT
========================================= */

window.StandBookAdmin = {
  createSlug,
  createEvent,
  getEvents
};
