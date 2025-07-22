import fs from 'fs';

const storeShippingLabel = (transactionId, shipTo) => {
    transactionId = transactionId.replace(",", "");
    for (let key in shipTo) {
        shipTo[key] = shipTo[key].replace(",", "");
    }
    if (!(shipTo.firstName && shipTo.lastName && shipTo.address && shipTo.city && shipTo.state && shipTo.zip)) {
        console.error('Incomplete shipping information:', shipTo);
        return;
    }
    const shippingLabel = `${transactionId},${shipTo.firstName} ${shipTo.lastName},${shipTo.address},${shipTo.address2 ?? ""},${shipTo.city},${shipTo.state},${shipTo.zip}\n`;
    fs.appendFileSync("db/shippingLabels.csv", shippingLabel);
}

const initShippingLabels = () => {
    fs.writeFileSync("db/shippingLabels.csv", "transactionID,Name,Address,Address Line 2,City,State,Zipcode\n");
}

const exportLabels = () => {
    return fs.readFileSync("db/shippingLabels.csv", "utf8");
}

export { storeShippingLabel, initShippingLabels, exportLabels };