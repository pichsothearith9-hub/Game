const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_YOUR_SECRET_KEY"); // ប្ដូរ Secret Key
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

app.use(bodyParser.json());
app.use(express.static("public"));

// Setup NodeMailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "your.email@gmail.com", pass: "yourpassword" },
});

// Setup Twilio
const client = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"); // ប្ដូរ SID និង TOKEN

// Stripe Checkout session
app.post("/create-checkout-session", async (req, res) => {
  const { amount, email, phone } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Big Payment Transaction" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",
    });

    // Send email
    const mailOptions = {
      from: "your.email@gmail.com",
      to: email,
      subject: "Payment Confirmation",
      text: `ទទួលបានការទូទាត់ចំនួន $${amount / 100}. សូមអរគុណចំពោះការទូទាត់!`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
      else console.log("Email sent: " + info.response);
    });

    // Send SMS
    client.messages
      .create({
        body: `ទទួលបានការទូទាត់ $${amount / 100}។ សូមអរគុណ!`,
        from: "+1234567890", // Twilio phone number
        to: phone,
      })
      .then((message) => console.log("SMS sent: " + message.sid))
      .catch((err) => console.log(err));

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate QR Code
app.get("/generate-qr", async (req, res) => {
  const { amount } = req.query;
  const paymentUrl = `https://yourbank.com/pay?amount=${amount}`;
  try {
    const qr = await QRCode.toDataURL(paymentUrl);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log("Big Payment server running on http://localhost:3000"),
);
