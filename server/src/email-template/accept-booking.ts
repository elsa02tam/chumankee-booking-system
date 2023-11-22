import { env } from "../env";
import { TServiceBooking } from "../proxy";
import { createBookingNoticeEmail, Email, getCustomerTitle } from "../email";

// accept booking: notice to consumer
function acceptedByAdminExternal(booking: TServiceBooking): Email {
  return createBookingNoticeEmail({
    booking,
    receiver: booking.user!,
    title: `[Booking Accepted] ${booking.service?.name}`,
    opening_paragraph: getEmailTemplate(
      "(2) accept booking opening paragraph (notice to consumer)",
      {}
    ),
    additional_paragraph: getEmailTemplate(
      "(2) accept booking additional paragraph (notice to consumer)",
      {}
    ),
  });
}

function acceptedInternal(booking: TServiceBooking): Email {
  let customerTitle = getCustomerTitle(booking);

  return createBookingNoticeEmail({
    booking,
    receiver: booking.provider!,
    title: `[${customerTitle} Booking Accepted] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We hope this email finds you well.
We are pleased to inform you that a customer's appointment has been successfully confirmed.

Please find the details of the accepted appointment below:
`,
    additional_paragraph: /* html */ `
Kindly make the necessary preparations and update your schedules accordingly to accommodate this appointment.
It is essential that we continue to provide our customers with the best possible service experience.

If you have any questions or concerns related to this appointment, please feel free to reach out to us.
You can contact us via phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS}.
We are always available to provide any necessary support and assistance.

Thank you for your commitment to delivering excellent service to our valued customers.
We look forward to a successful appointment.
`,
  });
}

export function createAcceptBookingEmails(booking: TServiceBooking): Email[] {
  return [acceptedByAdminExternal(booking), acceptedInternal(booking)];
}
function getEmailTemplate(arg0: string, arg1: {}): string {
  throw new Error("Function not implemented.");
}
