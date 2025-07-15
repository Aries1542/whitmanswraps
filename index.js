import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

import { initAuthNet, createPaymentPage } from './utils/authorize.js';
initAuthNet();

const app = express();
app.use(cors())
app.use(express.static("public"));
app.use(express.json());

const SIGNATURE_KEY = process.env.SIGNATURE_KEY;
if (!SIGNATURE_KEY) {
	console.error('SIGNATURE_KEY environment variable is not set.');
	process.exit(1);
}

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
	
    createPaymentPage(lineItems, shipTo, shipping, (response) => {
        if (response != null) {
            res.json({ token: response.getToken() });
        } else {
            res.status(500).json({ error: 'Failed to retrieve token' });
        }
    });
});

const formatBody = (body) => {
	// Create a deep copy to avoid modifying the original
	const formattedBody = JSON.parse(JSON.stringify(body));
	
	// Make sure authAmount is a number value with exactly 2 decimal places
	if (formattedBody.payload && formattedBody.payload.authAmount !== undefined) {
		// Round to 2 decimal places and keep as a number
		formattedBody.payload.authAmount = parseFloat(parseFloat(formattedBody.payload.authAmount).toFixed(2));
	}
	
	// Create JSON string first
	let jsonString = JSON.stringify(formattedBody);
	
	// Use a regex to find the authAmount field and ensure it has exactly 2 decimal places
	// This regex looks for "authAmount":X where X is a number, and ensures it has .XX decimal format
	if (formattedBody.payload && formattedBody.payload.authAmount !== undefined) {
		const authAmountValue = formattedBody.payload.authAmount;
		const authAmountStr = `"authAmount":${authAmountValue}`;
		const authAmountFixed = `"authAmount":${authAmountValue.toFixed(2)}`;
		
		// Replace the raw value with the fixed decimal value
		jsonString = jsonString.replace(authAmountStr, authAmountFixed);
	}
	
	return jsonString;
}

app.post('/payout', async (req, res) => {
	console.log("Headers:", req.headers)
	console.log("Header:", req.headers["x-anet-signature"])
	
	const rawData = formatBody(req.body);
	console.log("Raw data:", rawData);
	const hash = "sha512=" + crypto.createHmac('sha512', SIGNATURE_KEY)
                   .update(rawData)
                   .digest('hex')
                   .toUpperCase();
	console.log("hash:", hash);
	if (hash !== req.headers["x-anet-signature"]) {
		console.error('Invalid signature. Possible fraudulent request.');
	}
	else console.log('Valid signature.');
	console.log('Payout received:', req.body);
	res.sendStatus(200);
});

app.listen(8080, () => {
    console.log(`Server is running on port 8080`);
});