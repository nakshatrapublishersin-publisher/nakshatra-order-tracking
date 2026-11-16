export async function onRequestPost({ request, env }) {
  try {
    if (!env.APPS_SCRIPT_URL) {
      return Response.json(
        { success: false, message: "Tracking service is not configured." },
        { status: 503 }
      );
    }

    const payload = await request.json();

    const order_id = String(payload.order_id || "").trim();
    const token = String(payload.token || "").trim();

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
      body: JSON.stringify({
        order_id,
        token
      }),
      redirect: "follow"
    });

    const responseText = await upstream.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("Invalid response from tracking service.");
    }

    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Unable to retrieve tracking information."
      },
      { status: 502 }
    );
  }
}
