import {
  createBookingNoticeEmail,
  Email,
  findAdmins,
  getCustomerTitle,
} from "../email";
import { TServiceBooking } from "../proxy";
import { env } from "../env";

//reschedule booking: notice to consumer
function rescheduledByAdminExternal(booking: TServiceBooking): Email {
  return createBookingNoticeEmail({
    booking,
    receiver: booking.user!,
    title: `[Booking Rescheduled] ${booking.service?.name}`,
    opening_paragraph: getEmailTemplate(
      "(3) rescheduled booking opening paragraph (notice to consumer)",
      {}
    ),
    additional_paragraph: getEmailTemplate(
      "(3) rescheduled booking additional paragraph (notice to consumer)",
      {
        COMPANY_PHONE: env.COMPANY_PHONE,
        EMAIL_ADDRESS: env.EMAIL_ADDRESS,
      }
    ),
  });
}

function rescheduledByAdminInternal(booking: TServiceBooking): Email {
  let customerTitle = getCustomerTitle(booking);

  return createBookingNoticeEmail({
    booking,
    receiver: booking.provider!,
    cc_email: booking.provider?.email,
    title: `[${customerTitle} Booking Rescheduled] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We hope this email finds you well.
We are writing to inform you that customer appointment originally scheduled has been rescheduled due to unforeseen circumstances.

Please be advised that your new appointment is now scheduled as follows:
`,
    additional_paragraph: /* html */ `
Please make a note of this change in your schedule.

If you have any questions or concerns regarding this appointment request, please feel free to contact us at phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS}.

Thank you for your cooperation and commitment to our customers.
`,
  });
}

function rescheduledByUserExternal(booking: TServiceBooking): Email {
  return createBookingNoticeEmail({
    booking,
    receiver: booking.user!,
    title: `[Booking Rescheduled] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We hope this email finds you well.
We are writing to let you know that we have received your request to reschedule your appointment.

Your new appointment is now scheduled as follows:
`,
    additional_paragraph: /* html */ `
If you have any issues with the new appointment time or need to make further changes, please don't hesitate to contact us at your earliest convenience.

You can reach us via phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS} to discuss any concerns or alternative arrangements.

Thank you for choosing ${env.COMPANY_NAME} for your needs.
We appreciate your understanding and cooperation, and we look forward to serving you at your rescheduled appointment.
`,
  });
}

function rescheduledByUserInternal(booking: TServiceBooking): Email {
  let customerTitle = getCustomerTitle(booking);

  return createBookingNoticeEmail({
    booking,
    receiver: findAdmins(),
    cc_email: booking.provider?.email,
    title: `[${customerTitle} Booking Rescheduled] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We hope this email finds you well.
We are writing to let you know that we have received customer request to reschedule appointment.

The new appointment is now scheduled as follows:
`,
    additional_paragraph: /* html */ `
Please make a note of this change in your schedule.
If you have any issues with the new appointment time or need to make further changes, please don't hesitate to contact us at your earliest convenience.

You can reach us via phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS} to discuss any concerns or alternative arrangements.

Thank you for choosing ${env.COMPANY_NAME} for your needs.
We appreciate your understanding and cooperation, and we look forward to serving you at your rescheduled appointment.
`,
  });
}

export function createRescheduledBookingByAdminEmails(
  booking: TServiceBooking
): Email[] {
  return [
    rescheduledByAdminExternal(booking),
    rescheduledByAdminInternal(booking),
  ];
}

export function createRescheduledBookingByUserEmails(
  booking: TServiceBooking
): Email[] {
  return [
    rescheduledByUserExternal(booking),
    rescheduledByUserInternal(booking),
  ];
}
function getEmailTemplate(arg0: string, arg1: {}): string {
  throw new Error("Function not implemented.");
}
