import {
  createBookingNoticeEmail,
  Email,
  findAdmins,
  getCustomerTitle,
  getEmailTemplate,
} from "../email";
import { env } from "../env";
import { TServiceBooking } from "../proxy";

//DEMO submit booking: notice to consumer
function pendingExternal(booking: TServiceBooking): Email {
  return createBookingNoticeEmail({
    booking,
    receiver: booking.user!,
    title: `[Booking Received] ${booking.service?.name}`,
    opening_paragraph: getEmailTemplate(
      "(1) submit booking opening paragraph (notice to consumer)",
      {}
    ),
    additional_paragraph: getEmailTemplate(
      "(1) submit booking additional paragraph (notice to consumer)",
      {
        COMPANY_PHONE: env.COMPANY_PHONE,
        EMAIL_ADDRESS: env.EMAIL_ADDRESS,
      }
    ),
  });
}

function pendingInternal(booking: TServiceBooking): Email {
  let customerTitle = getCustomerTitle(booking);

  return createBookingNoticeEmail({
    booking,
    receiver: findAdmins(),
    cc_email: booking.provider?.email,
    title: `[${customerTitle} Booking Received] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We hope this email finds you well.
We are pleased to inform you that a customer's appointment has been received.
It is now awaiting approval.

Kindly review the details of the request and provide your decision at the earliest convenience.

Appointment Request Details:
`,
    additional_paragraph: /* html */ `
To approve or decline this appointment request, please log in to our appointment management system and navigate to the pending appointments section.
Your prompt attention to this matter is appreciated, as it will help us provide the best possible service to our valued customers.

If you have any questions or concerns regarding this appointment request, please feel free to contact us at phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS}.

Thank you for your cooperation and commitment to our customers.
`,
  });
}

export function createSubmitBookingEmails(booking: TServiceBooking): Email[] {
  return [pendingInternal(booking), pendingExternal(booking)];
}
