var express = require('express');
var mysql = require('mysql');
var geo = require('geolib');

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'teste123',
    database: 'guideme'
});

connection.connect(function (err) {
    if(err) {
        console.log("Unable to connect to database " + err);
    }
});

exports.addPOI = function(req, res) {
    console.log(req.body);

    var poi = {
        name: req.body.name,
        address: req.body.address,
        latt: req.body.latt,
        logt: req.body.logt,
        description: req.body.description,
        image: req.body.image,
        type: req.body.type
    };

    var query = connection.query('INSERT INTO poi SET ?', poi, function (err, result, fields) {
        if(err) {
            res.send({status: "ERR", message: err.message +  "SQL = " + query.sql});
        } else {
            res.send({status: "OK", lastId: result.insertId});
        }
    });
};

exports.listAllPOI = function(req, res) {
    var query = connection.query('SELECT id, name, address, latt, logt FROM poi', function (err, rows) {
        if(err) {
            res.send({status:"ERR", message: err.message + 'SQL = ' + query.sql});
            throw err;
        } else {
            res.send({status:"OK", poi: rows});
        }
    });
};

exports.getPOI = function(req, res) {
    var id = req.params.id;

    var query = connection.query('SELECT * FROM poi WHERE id = ' + id, function (err, rows) {
        if(err) {
            res.send({status: "ERR", message: err.message + 'SQL = ' + query.sql});
        } else {
            res.send({status: "OK", poi: rows});
        }
    });
};

exports.getPOIByDistance = function(req, res) {
    var distance = req.params.distance;
    var lat = req.params.latt;
    var lgt = req.params.logt;

    console.log("Distance = " + distance);
    console.log("Latitude = " + lat);
    console.log("Longitude = " + lgt);

    var result = [];
    var query = connection.query('SELECT * FROM poi', function (err, rows) {
        if(err) {
            res.send({status: "ERR", message: err.message + 'SQL = ' + query.sql});
            throw err;
        } else {
            for(var i in rows) {
                if(geo.getDistance({latitude: lat, longitude: lgt}, {latitude: rows[i].latt, longitude: rows[i].logt}) <= distance) {
                    result.push({"id": rows[i].id, "name": rows[i].name, "address": rows[i].address, "latt": rows[i].latt, "logt": rows[i].logt});
                }
            }
            res.send({status:"OK", poi: result});
        }
    });
};

exports.getPOIByDistanceAndByType = function(req, res) {
    var distance = req.params.distance;
    var type = req.params.type;
    var lat = req.params.latt;
    var lgt = req.params.logt;

    var result = [];
    var query = connection.query('SELECT * FROM poi WHERE type = ' + type, function (err, rows) {
        if(err) {
            res.send({status: "ERR", message: err.message + 'SQL = ' + query.sql});
            throw err;
        } else {
            for(var i in rows) {
                if(geo.getDistance({latitude: lat, longitude: lgt}, {latitude: rows[i].latt, longitude: rows[i].logt}) <= distance) {
                    result.push({"id": rows[i].id, "name": rows[i].name, "address": rows[i].address, "latt": rows[i].latt, "logt": rows[i].logt});
                }
            }
            res.send({status:"OK", poi: result});
        }
    });
};
