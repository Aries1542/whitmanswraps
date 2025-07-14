import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authorizenet from 'authorizenet';
const { APIContracts, APIControllers } = authorizenet;

const API_LOGIN_ID = process.env.API_LOGIN_ID;
const TRANSACTION_KEY = process.env.TRANSACTION_KEY;

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

function getAnAcceptPaymentPage(lineItems, shipTo, shipping, callback) {

	var merchantAuthentication = new APIContracts.MerchantAuthenticationType();
	merchantAuthentication.setName(API_LOGIN_ID);
	merchantAuthentication.setTransactionKey(TRANSACTION_KEY);

	let amount = 0;
	for (let item of lineItems.getLineItem()) {
		amount += item.getUnitPrice() * item.getQuantity();
	}
	amount += shipping.getAmount();
	
	var transactionRequest = new APIContracts.TransactionRequestType();
	transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequest.setAmount(amount);
	transactionRequest.setLineItems(lineItems);
	transactionRequest.setShipping(shipping);
	transactionRequest.setBillTo(shipTo); 
	transactionRequest.setShipTo(shipTo);

	var hostedPaymentButtonOptions = new APIContracts.SettingType();
	hostedPaymentButtonOptions.setSettingName('hostedPaymentButtonOptions');
	hostedPaymentButtonOptions.setSettingValue(JSON.stringify({
		text: "Pay",
	}));

	var hostedPaymentShippingAddressOptions = new APIContracts.SettingType();
	hostedPaymentShippingAddressOptions.setSettingName('hostedPaymentShippingAddressOptions');
	hostedPaymentShippingAddressOptions.setSettingValue(JSON.stringify({
		show: false,
		required: true,
	}));

	var hostedPaymentReturnOptions = new APIContracts.SettingType();
	hostedPaymentReturnOptions.setSettingName('hostedPaymentReturnOptions');
	hostedPaymentReturnOptions.setSettingValue(JSON.stringify({
		showReceipt: true,
		url: "https://aries1542.github.io/whitmanswraps/",
		urlText: "Continue",
		cancelUrl: "https://aries1542.github.io/whitmanswraps/",
		cancelUrlText: "Cancel",
	}));

	var settings = new APIContracts.ArrayOfSetting();
	settings.setSetting([
		hostedPaymentButtonOptions,
		hostedPaymentShippingAddressOptions,
		hostedPaymentReturnOptions
	]);

	var getRequest = new APIContracts.GetHostedPaymentPageRequest();
	getRequest.setMerchantAuthentication(merchantAuthentication);
	getRequest.setTransactionRequest(transactionRequest);
	getRequest.setHostedPaymentSettings(settings);

	var ctrl = new APIControllers.GetHostedPaymentPageController(getRequest.getJSON());
    // Uncomment for PRODUCTION use
    // ctrl.setEnvironment(SDKConstants.endpoint.production);

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

		if(response != null) 
		{
			if(!(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK))
			{
				console.error('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.error('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			var apiError = ctrl.getError();
			console.error(apiError);
			console.error('Null response received');
		}

		callback(response);
	});
}

app.post('/checkout', async (req, res) => {
	let inputLineItems = req.body.lineItems ?? [];
	if (inputLineItems.length === 0) {
		return res.status(400).json({ error: 'No line items provided' });
	} else if (inputLineItems.length === 1 && inputLineItems[0].itemId === "exp-ship") {
		return res.status(400).json({ error: 'No product selected' });
	}

	let shipTo = req.body.shipTo ?? {};
	if (!shipTo.firstName || !shipTo.lastName || !shipTo.address || !shipTo.city || !shipTo.state || !shipTo.zip) {
		console.error('Incomplete shipping information:', shipTo);
		return res.status(400).json({ error: 'Incomplete shipping information' });
	}

	let shippingMethod = req.body.shipping;
	if (!shippingMethod || shippingOptions[shippingMethod] == undefined) {
		return res.status(400).json({ error: 'Invalid shipping method' });
	}
	let shipping = new APIContracts.ExtendedAmountType();
	shipping.setAmount(shippingOptions[shippingMethod]);
	shipping.setName(shippingMethod);

	let lineItemslist = [];
	for (let item of inputLineItems) {
		if (!item.itemId || !item.quantity || !items[item.itemId]) {
			return res.status(400).json({ error: 'Invalid line item format' });
		}
		lineItemslist.push(new APIContracts.LineItemType({
			quantity: item.quantity,
			...items[item.itemId],
		}));
	}

	shipTo = new APIContracts.NameAndAddressType(shipTo);

	let lineItems = new APIContracts.ArrayOfLineItem();
	lineItems.setLineItem(lineItemslist);
    getAnAcceptPaymentPage(lineItems, shipTo, shipping, (response) => {
        if (response != null) {
            res.json({ token: response.getToken() });
        } else {
            res.status(500).json({ error: 'Failed to retrieve token' });
        }
    });
});

app.post('/webhook', async (req, res) => {
	console.log('Webhook received:', req.body);
	res.sendStatus(200);
});

app.listen(8080, () => {
    console.log(`Server is running on port 8080`);
});