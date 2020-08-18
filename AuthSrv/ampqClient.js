var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Usage: rpc_client.js messageType");
    process.exit(1);
}

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            var corr = generateUuid();
            var msgType = args[0];
            var message = {
                type: msgType,
                name: "NAME"
            };

            console.log(' [x] Requesting %s', JSON.stringify(message));

            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == corr) {
                    console.log(' [.] Got %s', msg.content);
                    setTimeout(function() { conn.close(); process.exit(0) }, 500);
                }
            }, {noAck: true});

            ch.sendToQueue('authsrv_queue',
                new Buffer.from(JSON.stringify(message)),
                { correlationId: corr, replyTo: q.queue });
        });
    });
});

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}