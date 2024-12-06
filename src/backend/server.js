const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail", // You can use any mail provider
  auth: {
    user: "spearfishingtun@gmail.com", // Replace with your email
    pass: "hdmcxlbzjxthdqfu",  // Replace with your email password or use an app password
  },
  tls: {
    rejectUnauthorized: false, // Disable rejecting unauthorized certificates
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error: ", error);
  } else {
    console.log("Connection successful:", success);
  }
});

app.post('/send-email', async (req, res) => {
  const { email, orderId, total, cartItems, paymentDetails } = req.body;

  // Format cart details for email
  const cartDetails = cartItems
    .map(item => `- ${item.productName}: ${item.quantity}`)
    .join('\n');
    console.log(cartDetails)

  const emailContent = `
    Order Confirmation
    ------------------
    Order ID: ${orderId}
    Total Amount: ${total}DT

    Cart Items:
    ${cartDetails}

    Payment Details:
    - Card Number: ${paymentDetails.cardNumber.replace(/\d{0,13}(\d{3})/, '***************$1')}
    
    Thank you for your purchase!
  `;

  // Define the email options
  const mailOptions = {
    from: "spearfishingtun@gmail.com", // Sender email
    to: email, // Recipient email
    subject: `Order Confirmation - ${orderId}`,
    text: emailContent, // Email content in plain text
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

app.post('/send-confirmation-email', async (req, res) => {
  const { to, firstName, orderId, totalAmount, cartItems, address, city, postalCode } = req.body;

  // Format cart items for the email body
  const formattedItems = cartItems
    .map(item => `${item.productName} (x${item.quantity})`)
    .join('\n');

  const emailContent = `
    Dear ${firstName},

    Thank you for your order! Your Order ID is ${orderId}.
    The total amount is ${totalAmount.toFixed(2)}.DT

    Items:
    ${formattedItems}

    Delivery Address:
    ${address}, ${city}, ${postalCode}

    Regards,
    Yallashop
  `;

  const mailOptions = {
    from: "spearfishingtun@gmail.com", // Sender email
    to, // Recipient email
    subject: "Order Confirmation",
    text: emailContent, // Email content in plain text
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Order confirmation email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send order confirmation email." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
