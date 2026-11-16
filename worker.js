/************************************************************
 * NAKSHATRA PUBLISHERS
 * PUBLIC ORDER TRACKING WORKER
 * VERSION: 2.0.0
 *
 * Authentication: Order ID only
 * Backend: Google Apps Script
 ************************************************************/

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    /*
     * PUBLIC TRACKING API
     */

    if (url.pathname === "/api/track") {

      if (request.method !== "POST") {

        return Response.json(
          {
            success: false,
            message: "Method not allowed."
          },
          {
            status: 405,
            headers: {
              "Allow": "POST",
              "Cache-Control": "no-store"
            }
          }
        );

      }

      try {

        if (!env.APPS_SCRIPT_URL) {

          return Response.json(
            {
              success: false,
              message: "Tracking service is not configured."
            },
            {
              status: 503,
              headers: {
                "Cache-Control": "no-store"
              }
            }
          );

        }

        const body = await request.json();

        const order_id = String(
          body.order_id || ""
        ).trim();

        if (
          !order_id ||
          order_id.length > 50
        ) {

          return Response.json(
            {
              success: false,
              message: "A valid Order ID is required."
            },
            {
              status: 400,
              headers: {
                "Cache-Control": "no-store"
              }
            }
          );

        }

        /*
         * SEND ORDER ID ONLY TO APPS SCRIPT
         */

        const upstream = await fetch(
          env.APPS_SCRIPT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({

              action: "track",

              order_id: order_id

            }),

            redirect: "follow"

          }
        );

        if (!upstream.ok) {

          return Response.json(
            {
              success: false,
              message: "Tracking service is temporarily unavailable."
            },
            {
              status: 502,
              headers: {
                "Cache-Control": "no-store"
              }
            }
          );

        }

        const result = await upstream.json();

        return Response.json(
          result,
          {
            status: 200,
            headers: {
              "Cache-Control": "no-store"
            }
          }
        );

      } catch (error) {

        console.error(
          "Nakshatra Tracking Error:",
          error
        );

        return Response.json(
          {
            success: false,
            message: "Unable to retrieve tracking information."
          },
          {
            status: 502,
            headers: {
              "Cache-Control": "no-store"
            }
          }
        );

      }

    }

    /*
     * STATIC WEBSITE DELIVERY
     */

    if (env.ASSETS) {

      return env.ASSETS.fetch(request);

    }

    return new Response(
      "Nakshatra Order Tracking Portal",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );

  }

};
