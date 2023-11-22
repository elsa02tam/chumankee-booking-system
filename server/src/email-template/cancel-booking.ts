import {
  createBookingNoticeEmail,
  Email,
  findAdminEmails,
  getCustomerTitle,
} from "../email";
import { TServiceBooking } from "../proxy";
import { env } from "../env";

// cancel booking: notice to consumer
function cancelByUserExternal(booking: TServiceBooking): Email {
  return createBookingNoticeEmail({
    booking,
    receiver: booking.user!,
    title: `[Booking Cancelled] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We are writing to confirm that we have received your request to cancel your appointment scheduled as follows:
`,
    additional_paragraph: /* html */ `
We understand that circumstances can change, and we appreciate your timely notification.

${
  booking.paid_deposit_time
    ? /* html */ `
As you have already paid a deposit for the appointment, we will process a full refund for the deposit amount.
The refund will be credited back to your original payment method within the next 5-7 business days.
If you do not receive the refund within this timeframe, please feel free to reach out to our customer support team for assistance.
`
    : ``
}

If you would like to schedule another appointment, we are more than happy to help.
You can contact us via phone at ${env.COMPANY_PHONE} or email at ${
      env.EMAIL_ADDRESS
    } to arrange a new appointment at a time that suits you best.

We apologize for any inconvenience the cancellation may have caused and hope to have the opportunity to serve you again in the near future.
If you have any questions or concerns, please do not hesitate to get in touch with us.

Thank you for your understanding and support.
`,
  });
}

function cancelInternal(booking: TServiceBooking): Email {
  let customerTitle = getCustomerTitle(booking);

  return createBookingNoticeEmail({
    booking,
    receiver: booking.provider!,
    cc_email: findAdminEmails(),
    title: `[${customerTitle} Booking Cancelled] ${booking.service?.name}`,
    opening_paragraph: /* html */ `
We hope this email finds you well. We would like to inform you that a customer has recently cancelled their appointment.

Please find the details of the cancelled appointment below:
`,
    additional_paragraph: /* html */ `
As the appointment has been cancelled, there is no need for any further action from your side.
However, we ask that you kindly update your schedules and records accordingly to avoid any confusion.

If there are any questions or concerns related to this cancellation, please feel free to reach out to us.
You can contact us via phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS}.
We are always available to provide any necessary support and assistance.

Thank you for your attention to this matter, and we appreciate your continued dedication to providing excellent service to our valued customers.
`,
  });
}

export function createCancelBookingEmails(booking: TServiceBooking): Email[] {
  return [cancelInternal(booking), cancelByUserExternal(booking)];
}
