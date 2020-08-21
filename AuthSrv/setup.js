var forge = require("node-forge");
var fs = require("fs");
var config = require("./config");

var pki = forge.pki;

// generate a new keypair and create an X.509v3 certificate
var keys = pki.rsa.generateKeyPair(config.keysize);
var cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
// this is the AuthSrv certificate, so lets extend its validity => 10 YEARS :-)
cert.validity.notAfter.setFullYear(
  cert.validity.notBefore.getFullYear() + config.owncert_years
);
var attrs = [
  {
    name: "commonName",
    value: config.CommonName,
  },
  {
    name: "countryName",
    value: config.CountryName,
  },
  {
    shortName: "ST",
    value: config.State,
  },
  {
    name: "localityName",
    value: config.LocalityName,
  },
  {
    name: "organizationName",
    value: config.OrganizationName,
  },
  {
    shortName: "OU",
    value: config.OrganizationUnit,
  },
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  {
    name: "basicConstraints",
    cA: true,
  },
  {
    name: "keyUsage",
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true,
  },
  {
    name: "extKeyUsage",
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true,
  },
  {
    name: "nsCertType",
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true,
  },
  {
    name: "subjectAltName",
    altNames: [
      {
        type: 6, // URI
        value: "http://example.org/webid#me",
      },
      {
        type: 7, // IP
        ip: "127.0.0.1",
      },
    ],
  },
  {
    name: "subjectKeyIdentifier",
  },
]);
// self-sign certificate
cert.sign(keys.privateKey);

var pem = pki.certificateToPem(cert);

console.log(pem);

//write the keypair to file
var privateKey = pki.privateKeyToPem(keys.privateKey);
//write the private key to the file
fs.writeFile("./keys/authSrvPrivateKey.pem", privateKey, function (err) {
  if (err) {
    return console.log("Error writing private key file!");
  } else {
    console.log("Private key file created!");
  }
});
console.log(privateKey);

//write the certificate to the file
fs.writeFile("./certs/authSrvCert.pem", pem, function (err) {
  if (err) {
    return console.log("Error writing certificate file!");
  } else {
    console.log("Certificate file created!");
  }
});
