import { createBookingNoticeEmail, Email, getCustomerTitle } from "../email";
import { env } from "../env";
import { TServiceBooking } from "../proxy";

// reject booking: notice to consumer
function rejectedByAdminExternal(booking: TServiceBooking): Email {
  return createBookingNoticeEmail({
    booking,
    receiver: booking.user!,
    title: `[Booking Rejected] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We regret to inform you that your appointment below has been rejected:
`,
    additional_paragraph: /* html */ `
We apologize for any inconvenience this may have caused and appreciate your understanding.

${
  booking.paid_deposit_time || booking.paid_fully_time
    ? /* html */ `
We noticed that you have already paid a deposit for the appointment.
Please be assured that we will process a full refund for the deposit amount.
The refund will be credited back to your original payment method within the next 5-7 business days.
If you do not receive the refund within this period, please do not hesitate to contact our customer support team for assistance.
`
    : ``
}

We value your patronage and would like to offer our assistance if you have any questions.
You may reach out to us via phone at ${env.COMPANY_PHONE} or email at ${
      env.EMAIL_ADDRESS
    } to arrange a new appointment at a time that is convenient for you.

Once again, we apologize for the inconvenience and look forward to serving you in the near future.
If you have any questions or concerns, please feel free to contact us.

Thank you for your understanding and support.
`,
  });
}

function rejectedInternal(booking: TServiceBooking): Email {
  let customerTitle = getCustomerTitle(booking);

  return createBookingNoticeEmail({
    booking,
    receiver: booking.provider!,
    title: `[${customerTitle} Booking Rejected] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We regret to inform you that the ${customerTitle} appointment below has been rejected:
`,
    additional_paragraph: /* html */ `
We apologize for any inconvenience this may have caused and appreciate your understanding.

If you have any questions or concerns, please feel free to contact us.

Thank you for your understanding and support.
We look forward to next successful appointment.
`,
  });
}

export function createRejectedBookingEmails(booking: TServiceBooking): Email[] {
  return [rejectedByAdminExternal(booking), rejectedInternal(booking)];
}
