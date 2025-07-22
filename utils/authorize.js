import authorizenet from 'authorizenet';
const { APIContracts, APIControllers } = authorizenet;

const config = {};
const initAuthNet = () => {
    config.merchantAuth = new APIContracts.MerchantAuthenticationType();
	config.merchantAuth.setName(process.env.API_LOGIN_ID);
	config.merchantAuth.setTransactionKey(process.env.TRANSACTION_KEY);
};

const createPaymentPage = (lineItems, shipTo, shippingMethod, callback) => {
    if (!config.merchantAuth) {
        console.error('Authorize.Net not initialized. Call initAuthNet() first.');
        return;
    }

	const lineItems2 = new APIContracts.ArrayOfLineItem();
	lineItems2.setLineItem(lineItems.map(item => new APIContracts.LineItemType(item)));

	const shipTo2 = new APIContracts.NameAndAddressType(shipTo);

	const shipping = new APIContracts.ExtendedAmountType();
	shipping.setAmount(shippingMethod.amount);
	shipping.setName(shippingMethod.name);

	let amount = 0;
	for (let item of lineItems) {
		amount += item.unitPrice * item.quantity;
	}
	amount += shipping.getAmount();
	
	var transactionRequest = new APIContracts.TransactionRequestType();
	transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequest.setAmount(amount);
	transactionRequest.setLineItems(lineItems2);
	transactionRequest.setShipping(shipping);
	transactionRequest.setBillTo(shipTo2); 
	transactionRequest.setShipTo(shipTo2);

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
		url: "https://whitmans-wraps.onrender.com/",
		urlText: "Continue",
		cancelUrl: "https://whitmans-wraps.onrender.com/",
		cancelUrlText: "Cancel",
	}));

	var settings = new APIContracts.ArrayOfSetting();
	settings.setSetting([
		hostedPaymentButtonOptions,
		hostedPaymentShippingAddressOptions,
		hostedPaymentReturnOptions
	]);

	var getRequest = new APIContracts.GetHostedPaymentPageRequest();
	getRequest.setMerchantAuthentication(config.merchantAuth);
	getRequest.setTransactionRequest(transactionRequest);
	getRequest.setHostedPaymentSettings(settings);

	var ctrl = new APIControllers.GetHostedPaymentPageController(getRequest.getJSON());
    // Uncomment for PRODUCTION use
    // ctrl.setEnvironment(SDKConstants.endpoint.production);

	ctrl.execute(() => {

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

		if(response != null) {
			if(!(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK)) {
				console.error('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.error('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			var apiError = ctrl.getError();
			console.error(apiError);
			console.error('Null response received');
		}

		callback(response);
	});
}

const getTransactionDetails = (transactionId, callback) => {
	var getRequest = new APIContracts.GetTransactionDetailsRequest();
	getRequest.setMerchantAuthentication(config.merchantAuth);
	getRequest.setTransId(transactionId);

	console.log(JSON.stringify(getRequest.getJSON(), null, 2));
		
	var ctrl = new APIControllers.GetTransactionDetailsController(getRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		if (apiResponse != null) var response = new APIContracts.GetTransactionDetailsResponse(apiResponse);

		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK){
				console.log('Transaction Id : ' + response.getTransaction().getTransId());
				console.log('Transaction Type : ' + response.getTransaction().getTransactionType());
				console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
				console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
			}
			else{
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else{
			var apiError = ctrl.getError();
			console.log(apiError);
			console.log('Null Response.');
		}
		
		callback(response);
	});
};

export { initAuthNet, createPaymentPage, getTransactionDetails };