import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import crypto from 'crypto';
import fs from 'fs';
import isEmail from 'validator/lib/isEmail.js';


import * as authorize from './utils/authorize.js';
authorize.initAuthNet();
import * as mailchimp from './utils/mailchimp.js'
mailchimp.initMailchimp();
import { storeShippingLabel, initShippingLabels, exportLabels } from "./utils/store.js";
import { initMailer, sendShippingLabels, sendErrorMessage } from "./utils/mailer.js";
initMailer();

const app = express();
app.use(cors())
app.use(express.static("public"));
app.use(express.json());

const items = {
	"wrp-blk": {
		"itemId": "wrp-blk",
		"name": "Black Wraps",
		"unitPrice": 59.00,
	},
	"wrp-tl": {
		"itemId": "wrp-tl",
		"name": "Teal Wraps",
		"unitPrice": 59.00,
	}
};

const shippingOptions = {
	"standard": 0.00,
	"express": 9.00,
};

const couponCodes = {
	"": {
		"discount": 0.00,
		"affiliate-phone": "",
	}
};

app.post('/checkout', async (req, res) => {
	let shipTo = req.body.shipTo ?? {};
	if (!shipTo.firstName || !shipTo.lastName || !shipTo.address || !shipTo.city || !shipTo.state || !shipTo.zip) {
		console.error('Incomplete shipping information:', shipTo);
		return res.status(400).json({ error: 'Incomplete shipping information' });
	}

	let shippingMethod = req.body.shipping;
	if (!shippingMethod || shippingOptions[shippingMethod] == undefined) {
		return res.status(400).json({ error: 'Invalid shipping method' });
	}
	const shipping = {
		"amount": shippingOptions[shippingMethod],
		"name": shippingMethod,
	};

	let lineItems = req.body.lineItems ?? [];
	if (lineItems.length === 0) {
		return res.status(400).json({ error: 'No line items provided' });
	} else if (lineItems.length === 1 && lineItems[0].itemId === "exp-ship") {
		return res.status(400).json({ error: 'No product selected' });
	}
	lineItems = lineItems.map(item => {
		if (!item.itemId || !item.quantity || !items[item.itemId]) {
			return res.status(400).json({ error: 'Invalid line item format' });
		}
		return {
			quantity: item.quantity,
			...items[item.itemId],
		}
	});

	authorize.createPaymentPage(lineItems, shipTo, shipping, (response) => {
		if (response != null) {
			res.json({ token: response.getToken() });
		} else {
			res.status(500).json({ error: 'Failed to retrieve token' });
		}
	});
});

app.post('/shipping-label', async (req, res) => {
	res.sendStatus(200);
	const transactionId = req.body.payload.id;
	authorize.getTransactionDetails(transactionId, (response) => {
		const shippingAddress = response.transaction.shipTo;
		storeShippingLabel(transactionId, shippingAddress);
	});
});

app.post('/subscriber', async (req, res) => {
	if (!req.body.email || !req.body.firstName) {
		return res.status(400).json({ error: 'Email and first name are required' });
	}
	if (!isEmail(req.body.email)) {
		return res.status(400).json({ error: 'Invalid email format' });
	}
	mailchimp.addSubscriber(req.body.email, req.body.firstName);
	res.sendStatus(201);
});

if (!fs.existsSync('db/shippingLabels.csv')) {
	initShippingLabels();
}

cron.schedule('0 17 * * *', async () => {
	console.log('exporting shipping labels');
	sendShippingLabels().then((success) => {
		if (success) {
			console.log('Shipping labels sent successfully');
			initShippingLabels();
		} else {
			console.error('Failed to send shipping labels');
			sendErrorMessage();
		}
	}).catch((error) => {
		console.error('Error during scheduled task:', error);
		sendErrorMessage();
	});
});

app.listen(8080, () => {
	console.log(`Server is running on port 8080`);
});