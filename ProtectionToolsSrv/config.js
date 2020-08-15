var config = {};

config.keysize = 2048;

config.CSR_commonName = 'opensdrm.org';
config.CSR_countryName = 'PT';
config.CSR_stateName = 'Lisboa';
config.CSR_localityName = 'Lisboa';
config.CSR_organizationName = 'OpenDAACnP';
config.CSR_organizationUnitName = 'ProtectionToolsSrv';

config.AuthSrv_IpAddress = '127.0.0.1';
config.AuthSrv_IpPort = 3000;


config.commonName = 'ProtectionToolsSrv';
config.location = 'http://10.211.55.10:3000';
config.description = 'This is the asset protection tools server, the service that is responsible for registering and delivering protection tools that are used to protected assets.';

module.exports = config;