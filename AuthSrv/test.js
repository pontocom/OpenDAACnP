var forge = require('node-forge');
var fs = require('fs');

var pki = forge.pki;

fs.exists("./certs/authSrvPrivateKey.pem", function(exists){
    if(exists){ // results true
        fs.readFile("./certs/authSrvPrivateKey.pem", {encoding: "utf8"}, function(err, data){
            if(err){
                console.log(err)
            } else {
                var privateKey = pki.privateKeyFromPem(data);
                console.log(JSON.stringify(privateKey));
                var publicKey  = pki.setRsaPublicKey(privateKey.n, privateKey.e);
                console.log(JSON.stringify(publicKey));
            }
        })
    }
});