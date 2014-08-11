/**
 * Created by twatson on 6/25/2014.
 */

var getEvent = function(arr) {
    var obj = {};
    var chunks = [];

    var chunk = arr.split("\n")

    for(var i=0;i<chunk.length;i++) {
        var line = (chunk[i] || "").trim();
        if (line == "") {
            continue;
        }
        chunks.push(line);
        if (line.indexOf("data:") == 0) {
            obj = processItem(chunks);
            chunks = [];
        }
    }
    return obj;
};

var processItem = function(arr) {
    var obj = {};

    for(var i=0;i<arr.length;i++) {
        var line = arr[i];

        if (line.indexOf("event:") == 0) {
            obj.name = line.replace("event:", "").trim();
        }
        else if (line.indexOf("data:") == 0) {
            line = line.replace("data:", "");
            obj.data = line;
        }
    }

    return obj;
};

var setHeader = function(response) {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
}
var sendEvent = function(response, event) {
    response.write("event:" + event.name + "\n");
    response.write("data: " + event.data + "\n\n");  // You have to have both new lines for the client to recognize
}
//
// Exported modules
module.exports.getEvent = getEvent;
module.exports.processItem = processItem;
module.exports.sendEvent = sendEvent;
module.exports.setHeader = setHeader;
