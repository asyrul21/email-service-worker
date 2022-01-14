const dotenv = require("dotenv");
dotenv.config();

// nodemailer
const nodemailer = require("nodemailer");
var MailTransporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    // user: process.env.MAILTRAP_USER,
    // pass: process.env.MAILTRAP_PASS,
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

// rabbitmq
const amqp = require("amqplib/callback_api");
const cloudRabbitMQConnURL = process.env.CLOUD_RABBIT_MQ_URL;
const QUENAME = "xendit-trial-notifs";

amqp.connect(cloudRabbitMQConnURL, function (err, conn) {
  conn.createChannel(function (err, channel) {
    channel.consume(
      QUENAME,
      async function (msg) {
        console.log("WORKER");
        console.log("Data:");
        const data = JSON.parse(msg.content.toString());
        console.log(data);

        const { sender, recipient, subject, message } = data;
        const emailInfo = await MailTransporter.sendMail({
          from: sender,
          to: recipient,
          subject: subject,
          html: message,
        });

        // update Triggered Event here
      },
      { noAck: true }
    );
  });
});
