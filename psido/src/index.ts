export default {

  // ── Handle website visits (HTTP requests) ──
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Redirect all traffic to the main domain
    return Response.redirect("https://psido.in" + url.pathname + url.search, 301);
  },

  // ── Handle email routing ──
  async email(message: any, env: any, ctx: any) {
    // Forward enquiry@psido.in emails to Gmail
    if (message.to === "enquiry@psido.in") {
      await message.forward("psidocompany@gmail.com");
    } else {
      message.setReject("Address not allowed");
    }
  }

};

