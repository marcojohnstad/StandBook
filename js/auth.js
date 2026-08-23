"use strict";

const sb = window.standbookSupabase;


/* -----------------------------
   LOGIN
----------------------------- */

async function login(email, password) {

  const { data, error } =
    await sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

  if (error) {
    throw error;
  }

  return data;
}


/* -----------------------------
   LOGOUT
----------------------------- */

async function logout() {

  try {

    await sb.auth.signOut();

  } catch (error) {

    console.warn(
      "Logout gav en fejl:",
      error
    );

  }

  window.location.replace("login.html");
}


/* -----------------------------
   AKTUEL BRUGER
----------------------------- */

async function getCurrentUser() {

  const {
    data,
    error
  } = await sb.auth.getSession();


  if (error) {

    console.warn(
      "Kunne ikke læse session:",
      error
    );

    return null;
  }


  if (
    !data ||
    !data.session ||
    !data.session.user
  ) {
    return null;
  }


  return data.session.user;
}


/* -----------------------------
   AKTUEL STANDBOOK-PROFIL
----------------------------- */

async function getCurrentProfile() {

  const user =
    await getCurrentUser();


  if (!user) {
    return null;
  }


  const {
    data,
    error
  } = await sb
    .from("profiles")
    .select(
      "id, full_name, role"
    )
    .eq("id", user.id)
    .maybeSingle();


  if (error) {

    console.error(
      "Fejl ved hentning af profil:",
      error
    );

    throw error;
  }


  return data || null;
}


/* -----------------------------
   BESKYT ADMIN-SIDE
----------------------------- */

async function requireAdmin() {

  const user =
    await getCurrentUser();


  // Ingen aktiv session
  if (!user) {

    window.location.replace(
      "login.html"
    );

    return null;
  }


  const profile =
    await getCurrentProfile();


  // Logget ind, men ikke StandBook-admin
  if (
    !profile ||
    !["owner", "admin"].includes(
      profile.role
    )
  ) {

    try {
      await sb.auth.signOut();
    } catch (error) {
      console.warn(error);
    }

    window.location.replace(
      "login.html"
    );

    return null;
  }


  return profile;
}


/* -----------------------------
   EXPORT
----------------------------- */

window.StandBookAuth = {
  login,
  logout,
  getCurrentUser,
  getCurrentProfile,
  requireAdmin
};
