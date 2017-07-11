var express = require('express'),
    bodyParser = require('body-parser'),
    user = require('./user.js'),
    component = require('./component.js')
;

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.post('/user/register', user.registerNewUser);
app.post('/component/register', component.registerNewComponent);
/*app.get('/poi', poi.listAllPOI);
app.get('/poi/:id', poi.getPOI);
app.get('/poi/range/:latt/:logt/:distance', poi.getPOIByDistance);
app.get('/poi/range/:latt/:logt/:distance/:type', poi.getPOIByDistanceAndByType);
*/

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at http://%s:%s", host, port);
});
