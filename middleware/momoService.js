
const https = require('https');
var uuid = require('uuid-random');
const NodeRSA = require('node-rsa');

//parameters send to MoMo get get payUrl
var endpoint = "https://test-payment.momo.vn/gw_payment/transactionProcessor"
var hostname = "https://test-payment.momo.vn"
var path = "/gw_payment/transactionProcessor"
var partnerCode = "MOMODJRT20200622"
var accessKey = "ACLD9DInAVL0TmsZ"
var serectkey = "64skdzYiuS1v08vQtQS1FFxIBrtRvLUd"
var notifyurl = "https://f2l-client.herokuapp.com/handleIPNMoMo"

// var orderId = uuidv1.v1()
// var requestId = uuidv1.v1()
const pubKey = '-----BEGIN PUBLIC KEY-----' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA6yFnbg8ZwTlBaX/trMLnFCeUo/xluMQCIyCcNu6XAj0Cls0VuIxdWrDgakveaaDoTdlyzAmp9S0Y1uL+wERkvaNM0CItVDubUZsCyI4nqdQtl1EaP+cjDcNJnEm9jXVpYQE5ZSZMecC6zAsbQBAnLHKgEaR5iJKvA5xza9MLRudwavipuZgVZLkqfb3AFsOIMY7MDZpQk4if0GBfcsmDrrAGwtJcJpqo4tcalILq3GjLEeixpH2LrJwZF8ZoDr2MRtud5Y/pnNYUgi6Lf3Zm2rm9K3wSfYK2oitqvXddMk1lcyeLaeg6Kg9zv2QJN+6ve5der+wwSGsDSqG32R1Lhs38LifSkw4vR9Ywf5NxtPOnQTpUVQ3O/qm3I9cW+OljH0BKzSmg0dGzQL5UHTb8Pb4KUvqB2EhrwdK+FZrLhJ7sBCer7Sylwd8wSVC3IwO6uLn4G3bFRKb9ok6SRqH7PM0sQPQ6MP6Hx14C73OmdYJzkcbXLbl1iIzO3nvEGvv8L0vDF4Q9EfhKR9ymGgjDNnpvJG8Ev+xX1XL2elEyMO7WhhSAxFnP4FwgGtvDW7JuNYwihfEZq/C1ccWavKCn/6GecdNeBDkHtvHhdb8kX7lM3QG23UJ7/w4V05I88tytFWDgbFG7vzmXb21pl6HO+nBpVCn5jemSMKGT7IbTJmMCAwEAAQ==' +
    '-----END PUBLIC KEY-----';
const key = new NodeRSA(pubKey, { encryptionScheme: 'pkcs1' });

var requestType = "captureMoMoWallet"
var extraData = "merchantName=PaymentF2L";
// var returnUrl = `https://test-payment.momo.vn/gw_payment/qr?&partnerCode=${partnerCode}&accessKey=${accessKey}
// &requestId=${requestId}&amount=${amount}&orderId=${orderId}
// &requestType=${requestType}&signature=${signature}`
var returnUrl = "https://f2l-client.herokuapp.com/handleMoMoIPN";
//pass empty value if your merchant does not have stores else merchantName=[storeName]; merchantId=[storeId] to identify a transaction map with a physical store
//before sign HMAC SHA256 with format
//partnerCode=$partnerCode&accessKey=$accessKey&requestId=$requestId&amount=$amount&orderId=$oderId&orderInfo=$orderInfo&returnUrl=$returnUrl&notifyUrl=$notifyUrl&extraData=$extraData
//json object send to MoMo endpoint


createSignature = (data) => {
    var rawSignature =
        "partnerCode=" + partnerCode +
        "&accessKey=" + accessKey +
        "&requestId=" + data.requestId +
        "&amount=" + data.amount +
        "&orderId=" + data.orderId +
        "&orderInfo=" + data.orderInfo +
        "&returnUrl=" + returnUrl +
        "&notifyUrl=" + notifyurl +
        "&extraData=" + extraData
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)

    //signature
    const crypto = require('crypto');
    return crypto.createHmac('SHA256', serectkey)
        .update(rawSignature)
        .digest('hex');
},

    module.exports = {
        createSignature: (data) => {
            var rawSignature =
                "partnerCode=" + partnerCode +
                "&accessKey=" + accessKey +
                "&requestId=" + data.requestId +
                "&amount=" + data.amount.toString() +
                "&orderId=" + data.orderId +
                "&orderInfo=" + data.orderInfo +
                "&returnUrl=" + returnUrl +
                "&notifyUrl=" + notifyurl +
                "&extraData=" + extraData
            //puts raw signature
            console.log("--------------------RAW SIGNATURE----------------")
            console.log(rawSignature)

            //signature
            const crypto = require('crypto');
            return crypto.createHmac('SHA256', serectkey)
                .update(rawSignature)
                .digest('hex');
        },
        transferMoneyMomoToF2L: async (data) => {
            // Send the request and get the response
            data.orderId = `${data.id_applicant}-F2L` + Date.now();
            // console.log('orderId:', orderId)
            data.requestId = uuid();
            // console.log('requestId:', requestId);
            data.orderInfo = `${data.id_applicant} pay with F2L`;
            var signature = createSignature(data);

            var body = JSON.stringify({
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: data.requestId,
                amount: data.amount.toString(),
                orderId: data.orderId,
                orderInfo: data.orderInfo,
                returnUrl: returnUrl,
                notifyUrl: notifyurl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                // bankCode: 'VCB'
            })
            //Create the HTTPS objects
            var options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/gw_payment/transactionProcessor',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };
            console.log("Sending....")
            return { options, body };
            var req = await https.request(options, (res) => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Headers: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                res.on('data', (body) => {
                    console.log('Body');
                    console.log(body);
                    console.log('payURL');
                    console.log(JSON.parse(body).payUrl);
                    return JSON.parse(body).payUrl

                });
                res.on('end', () => {
                    console.log('No more data in response.');
                });
            });

            req.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
            });

            // write data to request body
            req.write(body);
            req.end();
            // return req;
            // router.get('/', function (req, res, next) {
            //     req = https.request(options, (res) => {
            //         console.log(`Status: ${res.statusCode}`);
            //         console.log(`Headers: ${JSON.stringify(res.headers)}`);
            //         res.setEncoding('utf8');
            //         res.on('data', (body) => {
            //             console.log('Body');
            //             console.log(body);
            //             console.log('payURL');
            //             console.log(JSON.parse(body).payUrl);
            //             return JSON.parse(body).payUrl

            //         });
            //         res.on('end', () => {
            //             console.log('No more data in response.');
            //             return '';
            //         });
            //     });

            //     req.on('error', (e) => {
            //         console.log(`problem with request: ${e.message}`);
            //         return '';

            //     });

            //     // write data to request body
            //     req.write(body);
            //     res.json(body);
            //     req.end();
            // });
        },
        refundMoneyFromF2LToMoMo:  (data) => {
            console.log('data:', data)
            const jsonData = {
                "partnerCode": partnerCode,
                "partnerRefId": data.orderId,
                "amount": data.amount * (data.refundPercentage/100),
                "momoTransId": data.transId
            };
            console.log('jsonData:', jsonData)
            const encrypted = key.encrypt(JSON.stringify(jsonData), 'base64');
            console.log('encrypted:', encrypted)
            var body = JSON.stringify({
                partnerCode: partnerCode,
                requestId: data.requestId,
                hash: encrypted,
                version: 2.0
                // bankCode: 'VCB'
            })
            var options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/pay/refund',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };
            return {options,body}
        }


    }
