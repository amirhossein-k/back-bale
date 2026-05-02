// app/api/webhook/bale/route.js
export async function POST(request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] Webhook started at ${new Date().toISOString()}`);

  try {
    // بررسی signature (اگر بله ارسال کند)
    const signature = request.headers.get("x-bale-signature");
    console.log(`[${requestId}] Signature: ${signature}`);

    const body = await request.json();
    console.log(`[${requestId}] Event type: ${body.event_type || "unknown"}`);

    // پردازش بر اساس نوع event
    switch (body.event_type) {
      case "invoice_paid":
        console.log(`[${requestId}] Invoice paid: ${body.invoice_id}`);
        break;
      case "message":
        console.log(`[${requestId}] Message from: ${body.from?.id}`);
        break;
      default:
        console.log(`[${requestId}] Unknown event: ${JSON.stringify(body)}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Webhook processed in ${processingTime}ms`);

    return Response.json({
      status: "ok",
      request_id: requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] ERROR: ${error.message}`);
    console.error(`[${requestId}] Stack: ${error.stack}`);

    return Response.json(
      {
        error: "Processing failed",
        request_id: requestId,
      },
      { status: 500 },
    );
  }
}
