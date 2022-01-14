const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const http = require("http");

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
const EventsService = require("./API/triggeredEventService");
const cloudRabbitMQConnURL = process.env.CLOUD_RABBIT_MQ_URL;
const QUENAME = "xendit-trial-notifs";

amqp.connect(cloudRabbitMQConnURL, function (err, conn) {
  conn.createChannel(function (err, channel) {
    console.log("Worker Up and Running");
    channel.consume(
      QUENAME,
      async function (msg) {
        const data = JSON.parse(msg.content.toString());
        console.log("DATA:");
        console.log(data);
        const { sender, recipient, subject, message, eventId } = data;
        const emailInfo = await MailTransporter.sendMail({
          from: sender,
          to: recipient,
          subject: subject,
          html: message,
        });

        if (eventId) {
          // update Triggered Event here
          await EventsService.updateStatus(eventId, "delivered");
        }
      },
      { noAck: true }
    );
  });
});

app.get("/api/", (req, res) => {
  res.status(200).send("Notification Worker API is running");
});

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
module.exports = server.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
