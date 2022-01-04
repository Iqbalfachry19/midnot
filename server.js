const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const midtransClient = require("midtrans-client");

const bodyParser = require("body-parser");

const { v4: uuidV4, validate } = require("uuid");
app.use(bodyParser.json()).use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/notification", (req, res) => {
  // Create Core API / Snap instance (both have shared `transactions` methods)
  let apiClient = new midtransClient.Snap({
    isProduction: false,
    serverKey: NEXT_PUBLIC_MIDTRANS_SERVER_KEY,
    clientKey: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  });
  let notificationJson = req.body;
  apiClient.transaction
    .notification(notificationJson)
    .then((statusResponse) => {
      let orderId = statusResponse.order_id;
      let transactionStatus = statusResponse.transaction_status;
      let fraudStatus = statusResponse.fraud_status;

      console.log(
        `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
      );

      // Sample transactionStatus handling logic

      if (transactionStatus == "capture") {
        // capture only applies to card transaction, which you need to check for the fraudStatus
        if (fraudStatus == "challenge") {
          // TODO set transaction status on your databaase to 'challenge'
        } else if (fraudStatus == "accept") {
          // TODO set transaction status on your databaase to 'success'
        }
      } else if (transactionStatus == "settlement") {
        // TODO set transaction status on your databaase to 'success'
      } else if (transactionStatus == "deny") {
        // TODO you can ignore 'deny', because most of the time it allows payment retries
        // and later can become success
      } else if (
        transactionStatus == "cancel" ||
        transactionStatus == "expire"
      ) {
        // TODO set transaction status on your databaase to 'failure'
      } else if (transactionStatus == "pending") {
        // TODO set transaction status on your databaase to 'pending' / waiting payment
      }
    });
});
app.listen(process.env.PORT || 3030);
