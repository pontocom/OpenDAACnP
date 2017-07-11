var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'rpc_queue';

        ch.assertQueue(q, {durable: false});
        ch.prefetch(1);
        console.log(' [x] Awaiting RPC requests');
        ch.consume(q, function reply(msg) {
            var message = msg.content.toString();

            console.log(" [.] %s", message);

            var sm = JSON.parse(message);

            var answerType = "";

            switch(sm.type) {
                case "AUTH_USER": answerType = "AUTH_USER SUCCESS";
                    break;
                case "AUTH_COMPONENT": answerType = "AUTH_COMPONENT SUCCESS";
                    break;
                default: answerType = "WRONG MESSAGE";
            }

            var answer = {
                type: answerType
            };

            ch.sendToQueue(msg.properties.replyTo,
                new Buffer(JSON.stringify(answer)),
                {correlationId: msg.properties.correlationId});

            ch.ack(msg);
        });
    });
});