var config = {};

config.keysize = 2048;

config.CSR_commonName = 'opensdrm.org';
config.CSR_countryName = 'PT';
config.CSR_stateName = 'Lisboa';
config.CSR_localityName = 'Lisboa';
config.CSR_organizationName = 'OpenDAACnP';
config.CSR_organizationUnitName = 'LicensingSrv';

config.AuthSrv_IpAddress = '127.0.0.1';
config.AuthSrv_IpPort = 3000;


config.commonName = 'LicensingSrv';
config.location = 'http://10.211.55.10:3000';
config.description = 'This is the asset license server, the service that is responsible for governing the access to an asset.';

module.exports = config;