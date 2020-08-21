var config = {};

/* information about the certification process */
config.keysize = 4096;
config.owncert_years = 10;
config.issuedcert_years = 1;

config.CommonName = "opensdrm.org";
config.CountryName = "PT";
config.State = "Lisboa";
config.LocalityName = "Lisboa";
config.OrganizationName = "OPENSDRM";
config.OrganizationUnit = "AuthSrv";

/* information about the database */
config.database = "mongodb://localhost:27017/AuthSrv";

module.exports = config;
