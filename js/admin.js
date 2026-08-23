<!DOCTYPE html>
<html lang="da">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Administration – StandBook
  </title>

</head>


<body>

  <main id="page" hidden>

    <h1>
      StandBook
    </h1>

    <h2>
      Administration
    </h2>

    <p>
      Navn:
      <strong id="admin-name"></strong>
    </p>

    <p>
      Rolle:
      <strong id="admin-role"></strong>
    </p>

    <button
      id="logout-button"
      type="button"
    >
      Log ud
    </button>

  </main>


  <p id="loading">
    Kontrollerer adgang...
  </p>


  <!-- SUPABASE -->

  <script
    src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">
  </script>


  <!-- STANDBOOK -->

  <script src="js/config.js"></script>

  <script src="js/supabase.js"></script>

  <!--
    v=2 sørger for, at browseren ikke
    bruger en gammel cached auth.js
  -->

  <script src="js/auth.js?v=2"></script>


  <script>

    async function startAdmin() {

      const loading =
        document.querySelector("#loading");

      const page =
        document.querySelector("#page");


      try {

        const profile =
          await window
            .StandBookAuth
            .requireAdmin();


        /*
          Hvis requireAdmin har sendt
          brugeren til login.html,
          stopper vi her.
        */

        if (!profile) {
          return;
        }


        document.querySelector(
          "#admin-name"
        ).textContent =
          profile.full_name;


        document.querySelector(
          "#admin-role"
        ).textContent =
          profile.role;


        loading.hidden = true;

        page.hidden = false;


      } catch (error) {

        console.error(
          "Admin initialization error:",
          error
        );


        /*
          Ved enhver uventet fejl
          sender vi sikkert tilbage
          til login.
        */

        window.location.replace(
          "login.html"
        );
      }
    }


    document
      .querySelector("#logout-button")
      .addEventListener(
        "click",
        async () => {

          await window
            .StandBookAuth
            .logout();

        }
      );


    startAdmin();

  </script>

</body>

</html>
