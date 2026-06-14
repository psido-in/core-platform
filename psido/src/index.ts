export default {
  async email(message, env, ctx) {
    // Check if the email is being sent to enquiry@psido.in
    if (message.to === "enquiry@psido.in") {
      // Forward the email to your Gmail address
      await message.forward("psidocompany@gmail.com");
    } else {
      // Reject emails sent to other addresses
      message.setReject("Address not allowed");
    }
  }
};
