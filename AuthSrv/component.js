var express = require('express');
var forge = require('node-forge');
var fs = require('fs');
var config = require('./config');
var mongoose = require('mongoose');

// we need to setup the database and the collections we need to have on the database -> Mongo!
var db = mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true });

const componentSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    location: String,
    description: String,
    csr: String,
    cert: String
});

const Component = mongoose.model('Component', componentSchema);

/**
 * Receives the different parameters to be registered!!!
 * We need to make user the following happens:
 * - we area receiving a CSR
 * - we are registering the component on the database
 * - we are getting the components from the CSR and creating a new certificate
 * - we write the certificate locally on the database
 * - return the certificate for the requesting entity
 */
exports.registerNewComponent = function(req, res) {
    console.log("COMPONENT Registration Request...");
    console.log(req.body);

    // read the CSR
    var csrPem = req.body.csr;
    var csr = forge.pki.certificationRequestFromPem(csrPem);

    // read AuthSrv cert and key
    var AuthSrvCertPem = fs.readFileSync('./certs/authSrvCert.pem', 'utf8');
    var AuthSrvCertKeyPem = fs.readFileSync('./keys/authSrvPrivateKey.pem', 'utf8');
    var AuthSrvCert = forge.pki.certificateFromPem(AuthSrvCertPem);
    var AuthSrvCertKey = forge.pki.privateKeyFromPem(AuthSrvCertKeyPem);

    if(csr.verify()) {
        console.log('CSR verified!!!');
    } else {
        res.send({status: 'NOK', message: 'CSR Signature not verified!!!'});
        throw new Error('Signature not verified!!!');
    }

    Component.countDocuments(function(err, count) {
        console.log('Creating certificate # => ' + (count+1));

        var snumber = count + 1;

        // start the process to create a new certificate
        var cert = forge.pki.createCertificate();

        // this needs to be changed afterwards
        cert.serialNumber = '' + snumber;

        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + config.issuedcert_years);

        // subject from CSR
        cert.setSubject(csr.subject.attributes);
        // issuer from CA
        cert.setIssuer(AuthSrvCert.subject.attributes);

        cert.setExtensions([{
            name: 'basicConstraints',
            cA: true
        }, {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        }, {
            name: 'subjectAltName',
            altNames: [{
                type: 6, // URI
                value: 'http://example.org/webid#me'
            }]
        }]);

        cert.publicKey = csr.publicKey;

        cert.sign(AuthSrvCertKey);
        console.log('Certificate created.');

        console.log('\nWriting Certificate');
        var finalCert = forge.pki.certificateToPem(cert);
        //fs.writeFileSync("./certs/test.pem", finalCert);

        var component = {
             uuid: req.body.uuid,
             name: req.body.name,
             location: req.body.location,
             description: req.body.description,
             csr: csrPem,
             cert: finalCert
        };

        var newComponent = new Component(component);

        newComponent.save(function (err, result) {
             if(err) {
                 res.send({status: 'NOK'});
                 throw err;
             }
             else {
                 console.log('All good!');
                 console.log(result);
                 res.send({status: 'OK', cert: finalCert});
             }
         });

    });

};
