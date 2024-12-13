// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port:587,
  secure:false,
  auth: {
    user: "mindorostateuniveristyclinic@gmail.com", 
    pass: "rpwo rtfu rpcj owfk", 
  },

});

module.exports = transporter;
