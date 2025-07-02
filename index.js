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
	},
	"exp-ship": {
		"itemId": "exp-ship",
		"name": "Express Shipping",
		"unitPrice": 9.00,
		"quantity": 1, // Guarantees shipping only charges once
	}
};

function getAnAcceptPaymentPage(lineItems, callback) {

	var merchantAuthentication = new APIContracts.MerchantAuthenticationType();
	merchantAuthentication.setName(API_LOGIN_ID);
	merchantAuthentication.setTransactionKey(TRANSACTION_KEY);

	let amount = 0;
	for (let item of lineItems.getLineItem()) {
		amount += item.getUnitPrice() * item.getQuantity();
	}
	
	var transactionRequest = new APIContracts.TransactionRequestType();
	transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequest.setAmount(amount);
	transactionRequest.setLineItems(lineItems);
	transactionRequest.setShipTo(new APIContracts.NameAndAddressType({}))

	var hostedPaymentButtonOptions = new APIContracts.SettingType();
	hostedPaymentButtonOptions.setSettingName('hostedPaymentButtonOptions');
	hostedPaymentButtonOptions.setSettingValue(JSON.stringify({
		text: "Pay",
	}));

	var hostedPaymentShippingAddressOptions = new APIContracts.SettingType();
	hostedPaymentShippingAddressOptions.setSettingName('hostedPaymentShippingAddressOptions');
	hostedPaymentShippingAddressOptions.setSettingValue(JSON.stringify({
		show: true,
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
	

	//console.log(JSON.stringify(getRequest.getJSON(), null, 2));

	var ctrl = new APIControllers.GetHostedPaymentPageController(getRequest.getJSON());
    // Uncomment for PRODUCTION use
    // ctrl.setEnvironment(SDKConstants.endpoint.production);

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK)
			{
				console.log('Hosted payment page token :');
				console.log(response.getToken());
			}
			else
			{
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			var apiError = ctrl.getError();
			console.log(apiError);
			console.log('Null response received');
		}

		callback(response);
	});
}

app.post('/checkout', async (req, res) => {
	let inputLineItems = req.body.lineItems ? req.body.lineItems : [];
	if (inputLineItems.length === 0) {
		return res.status(400).json({ error: 'No line items provided' });
	}

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

	let lineItems = new APIContracts.ArrayOfLineItem();
	lineItems.setLineItem(lineItemslist);
    getAnAcceptPaymentPage(lineItems, (response) => {
        if (response != null) {
            res.json({ token: response.getToken() });
        } else {
            res.status(500).json({ error: 'Failed to retrieve token' });
        }
    });
});


app.listen(8080, () => {
    console.log(`Server is running on port 8080`);
});