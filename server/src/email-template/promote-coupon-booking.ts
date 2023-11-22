import { env } from "../env";
import { TCoupon } from "../proxy";
import { Email } from "../email";

export function createPromoteCouponCodeBookingEmails(input: {
  coupon: TCoupon;
  email: string;
}): Email[] {
  let subject = `[Promote Coupon] ${input.coupon.coupon_code}`;
  let html = `
We hope this email finds you well. 

We wanted to remind you that we have a special promotion going on right now.

Please find the details of the promote coupon code below:

xxxxxxxx TODO when expire how much discount


Kindly update you to use coupon code "${input.coupon.coupon_code}" at checkout to receive a special discount on your purchase.

If you have any questions or concerns related to this promotion, please feel free to reach out to us.
You can contact us via phone at ${env.COMPANY_PHONE} or email at ${env.EMAIL_ADDRESS}.
We are always available to provide any necessary support and assistance.

Thank you for choosing ${env.COMPANY_NAME}. 

We appreciate your business and look forward to serving you again soon.
`;

  return [
    {
      to_email: input.email,
      subject,
      html,
    },
  ];
}
