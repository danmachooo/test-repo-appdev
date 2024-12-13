// services/emailService.js
const transporter = require('../config/email');

exports.sendVoucherEmail = async (recipientEmail, voucher) => {
  const mailOptions = {
    from: '"Mindoro State University Clinic - Calapan Campus" mindorostateuniveristyclinic@gmail.com',
    to: recipientEmail,
    subject: 'Your Admin Voucher',
    text: `Hello, here is your admin voucher: ${voucher}`,
    html: `<p>Hello,</p><p>Here is your admin voucher: <strong>${voucher}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Voucher sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending voucher email:', error);
    throw new Error('Could not send voucher email.');
  }
};
