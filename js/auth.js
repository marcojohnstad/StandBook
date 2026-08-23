"use strict";

const sb = window.standbookSupabase;


/**
 * Log ind med e-mail og adgangskode.
 */
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


/**
 * Log den nuværende bruger ud.
 */
async function logout() {

  const { error } =
    await sb.auth.signOut();

  if (error) {
    console.error(
      "Fejl under logout:",
      error
    );
  }

  window.location.href = "login.html";
}


/**
 * Hent den nuværende bruger.
 *
 * Hvis der ikke findes en aktiv session,
 * returnerer funktionen null.
 */
async function getCurrentUser() {

  try {

    const {
      data: { user },
      error
    } = await sb.auth.getUser();

    if (error) {

      console.warn(
        "Ingen aktiv session:",
        error.message
      );

      return null;
    }

    return user || null;

  } catch (error) {

    console.warn(
      "Kunne ikke hente bruger:",
      error
    );

    return null;
  }
}


/**
 * Hent StandBook-profilen
 * for den bruger, der er logget ind.
 */
async function getCurrentProfile() {

  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }


  const { data, error } =
    await sb
      .from("profiles")
      .select(
        "id, full_name, role"
      )
      .eq("id", user.id)
      .maybeSingle();


  if (error) {
    throw error;
  }

  return data || null;
}


/**
 * Beskyt admin-sider.
 *
 * Kun brugere med rollen
 * "owner" eller "admin"
 * får adgang.
 */
async function requireAdmin() {

  const user =
    await getCurrentUser();


  // Ingen login
  if (!user) {

    window.location.replace(
      "login.html"
    );

    return null;
  }


  try {

    const profile =
      await getCurrentProfile();


    // Bruger findes, men har ikke
    // en gyldig StandBook admin-profil
    if (
      !profile ||
      !["owner", "admin"].includes(
        profile.role
      )
    ) {

      await sb.auth.signOut();

      window.location.replace(
        "login.html"
      );

      return null;
    }


    return profile;

  } catch (error) {

    console.error(
      "Kunne ikke kontrollere admin-adgang:",
      error
    );


    try {
      await sb.auth.signOut();
    } catch (logoutError) {
      console.error(
        "Kunne ikke logge ud:",
        logoutError
      );
    }


    window.location.replace(
      "login.html"
    );

    return null;
  }
}


/**
 * Gør funktionerne tilgængelige
 * for resten af StandBook.
 */
window.StandBookAuth = {
  login,
  logout,
  getCurrentUser,
  getCurrentProfile,
  requireAdmin
};
