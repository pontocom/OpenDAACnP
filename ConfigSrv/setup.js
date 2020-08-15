/**
 * This script is responsible for the initial setup of the ConfigSrv
 * It will:
 * - create a keypair and save the keys
 * - create a certicicate signing request (CSR)
 * - send the CSR to the AuthSrv
 * - receive the certificate
 * - save the final certificate.
 *
 * The final result of this script is the establishment of a new service ready to interact with the remaining OpenSDRM entities!
 */


var forge = require('node-forge');
var fs = require('fs');
var config = require('./config');
var uuid = require('uuid');
var Client = require('node-rest-client').Client;

var pki = forge.pki;

/* check if a keypair already exists */
fs.exists("./keys/configSrvPrivateKey.pem", function(exists){
    if(exists){ // the file already exists, so we don't need to create a new keypair
        fs.readFile("./keys/configSrvPrivateKey.pem", {encoding: "utf8"}, function(err, data){
            if(err){
                console.log(err)
            } else {
                var privateKey = pki.privateKeyFromPem(data);
                //console.log(JSON.stringify(privateKey));
                var publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);
                //console.log(JSON.stringify(publicKey));

                var CSR = generateCSR(publicKey, privateKey);
                writeCSR(CSR);
                sendCSR(CSR);
            }
        });
    } else { // ok, it doesn't exist... need to create a new one!
        /**
         * Generate a new keypair - by default 2048-bit keys are used!
         */
        console.log('Generating 2048-bit key-pair...');
        var keys = pki.rsa.generateKeyPair(config.keysize);
        publicKey = keys.publicKey;
        privateKey = keys.privateKey;
        console.log('Key-pair created.');

        writeNewKeyPair(keys.privateKey);

        var CSR = generateCSR(publicKey, privateKey);
        writeCSR(CSR);
        sendCSR(CSR);
    }
});

/**
 * Generate a new keypair - by default 2048-bit keys are used!
 */

function generateCSR(publicKey, privateKey) {
    //console.log('Generating 2048-bit key-pair...');
//var keys = pki.rsa.generateKeyPair(config.keysize);
//console.log('Key-pair created.');

    console.log('Creating certification request (CSR) ...');
    var csr = pki.createCertificationRequest();
//csr.publicKey = keys.publicKey;
    csr.publicKey = publicKey;

    csr.setSubject([{
        name: 'commonName',
        value: config.CSR_commonName
    }, {
        name: 'countryName',
        value: config.CSR_countryName
    }, {
        shortName: 'ST',
        value: config.CSR_stateName
    }, {
        name: 'localityName',
        value: config.CSR_localityName
    }, {
        name: 'organizationName',
        value: config.CSR_organizationName
    }, {
        shortName: 'OU',
        value: config.CSR_organizationUnitName
    }]);
// add optional attributes
    /*csr.setAttributes([{
     name: 'challengePassword',
     value: 'password'
     }, {
     name: 'unstructuredName',
     value: 'Registration Server'
     }]);*/

// self sign the certification request
//csr.sign(keys.privateKey);
    csr.sign(privateKey);

    console.log('Certification request (CSR) created.');

    var csrPem = pki.certificationRequestToPem(csr);

    /*
     console.log(JSON.stringify(csrPem));
     console.log(JSON.stringify(csr));
     */

    return csrPem;
}

function writeNewKeyPair(keyPair) {
    /* write the NEW keypair to disk */
    //write the keypair to file
    var privateKeyPem = pki.privateKeyToPem(keyPair);
    //write the private key to the file
    fs.writeFile("./keys/configSrvPrivateKey.pem", privateKeyPem, function (err) {
        if(err) {
            return console.log("Error writing private key file!");
        } else {
            console.log("Private key file created!");
        }
    });
}

function writeCSR(csr) {
    /* now we have to save the CSR to the filesystem to submit afterwards to the AuthSrv */
    fs.writeFile("./csr/csr.pem", csr, function (err) {
        if(err) {
            return console.log("Error writing CSR!");
        } else {
            console.log("CSR created and saved!");
        }
    });
}

function sendCSR(csr) {
    /* sends the registration request to the default AuthSrv */
    var client = new Client();

    var _UUID = uuid.v4();

    var args = {
        data: {
            uuid: _UUID,
            name: config.commonName,
            location : config.location,
            description: config.description,
            csr: csr
        },
        headers: { "Content-Type": "application/json" }
    };

    client.post("http://" + config.AuthSrv_IpAddress + ":" + config.AuthSrv_IpPort + "/component/register", args, function (data, response) {
        // parsed response body as js object
        console.log(data);
        // raw response
        // console.log(response);
        if (data.status === 'OK') {
            console.log("Setup concluded with success!");

            /* if the registration is concluded with success, the system must return the newly created certificate issued by the AuthSrv */
            /* and needs to be saved */
            fs.writeFile("./certs/cert.pem", data.cert, function (err) {
                if(err) {
                    return console.log("Error writing the CERTIFICATE!");
                } else {
                    console.log("CERTIFICATE created and saved!");
                }
            });

        } else {
            console.log("Some error occurred on the remote registration!");
        }
    });
}