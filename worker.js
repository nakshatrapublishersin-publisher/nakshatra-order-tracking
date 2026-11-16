export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Public order tracking API
    if (url.pathname === "/api/track") {
      if (request.method !== "POST") {
        return Response.json(
          { success: false, message: "Method not allowed." },
          { status: 405 }
        );
      }

      try {
        if (!env.APPS_SCRIPT_URL) {
          return Response.json(
            { success: false, message: "Tracking service is not configured." },
            { status: 503 }
          );
        }

        const body = await request.json();

        const order_id = String(body.order_id || "").trim();
        const token = String(body.token || "").trim();

        if (!order_id || !token) {
          return Response.json(
            { success: false, message: "Order ID and tracking token are required." },
            { status: 400 }
          );
        }

        const upstream = await fetch(env.APPS_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ order_id, token })
        });

        const result = await upstream.json();

        return Response.json(result, {
          headers: { "Cache-Control": "no-store" }
        });

      } catch (error) {
        return Response.json(
          { success: false, message: "Unable to retrieve tracking information." },
          { status: 502 }
        );
      }
    }

    // Serve the existing static website
    return env.ASSETS.fetch(request);
  }
};
