"use strict";

const sb = window.standbookSupabase;

/**
 * Log ind med email + adgangskode.
 */
async function login(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password
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
  const { error } = await sb.auth.signOut();

  if (error) {
    throw error;
  }

  window.location.href = "login.html";
}


/**
 * Hent nuværende login.
 */
async function getCurrentUser() {
  const {
    data: { user },
    error
  } = await sb.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}


/**
 * Hent brugerens StandBook-profil.
 */
async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/**
 * Beskyt en admin-side.
 *
 * Hvis personen ikke er logget ind,
 * sendes personen til login-siden.
 */
async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  try {
    const profile = await getCurrentProfile();

    if (
      !profile ||
      !["owner", "admin"].includes(profile.role)
    ) {
      await sb.auth.signOut();
      window.location.href = "login.html";
      return null;
    }

    return profile;

  } catch (error) {
    console.error("Kunne ikke hente admin-profil:", error);

    await sb.auth.signOut();
    window.location.href = "login.html";

    return null;
  }
}

window.StandBookAuth = {
  login,
  logout,
  getCurrentUser,
  getCurrentProfile,
  requireAdmin
};
