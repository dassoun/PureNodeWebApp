var http = require("http");
var qs = require("querystring");
var StringBuilder = require("stringbuilder");

var port = 9000;

function getHome(req, resp) {
    resp.writeHead(200, { "Content-Type": "text/html" });
    resp.write("<html><head><title>Home</title></head><body>Want to do some calculations? Click <a href='/calc'>here</a></body></html>");
    resp.end();
}

function get404(req, resp) {
    resp.writeHead(404, "Resource not found", { "Content-Type": "text/html" });
    resp.write("<html><head><title>404</title></head><body>404: Resource not found. Go to <a href='/'>home</a></body></html>");
    resp.end();
}

function get405(req, resp) {
    resp.writeHead(405, "Method not supported", { "Content-Type": "text/html" });
    resp.write("<html><head><title>405</title></head><body>405: Method not supported. Go to <a href='/'>home</a></body></html>");
    resp.end();
}

function getCalcHtml(req, resp, data) {
    var sb = new StringBuilder({ newline: "\r\n" });

    sb.appendLine("<html>");
    sb.appendLine("<body>");
    sb.appendLine(" <form method='post'>");
    sb.appendLine("     <table>");
    sb.appendLine("         <tr>");
    sb.appendLine("             <td>Enter first No:</td>");

    //sb.appendLine("             <td><input type='text' id='txtFirstNo' name='txtFirstNo' value=''/></td>");
    if (data && data.txtFirstNo) {
        sb.appendLine("             <td><input type='text' id='txtFirstNo' name='txtFirstNo' value='{0}'/></td>", data.txtFirstNo);
    } else {
        sb.appendLine("             <td><input type='text' id='txtFirstNo' name='txtFirstNo' value=''/></td>");
    }

    sb.appendLine("         </tr>");
    sb.appendLine("         <tr>");
    sb.appendLine("             <td>Enter second No:</td>");

    //sb.appendLine("             <td><input type='text' id='txtSecondNo' name='txtSecondNo' value=''/></td>");
    if (data && data.txtSecondNo) {
        sb.appendLine("             <td><input type='text' id='txtSecondNo' name='txtSecondNo' value='{0}'/></td>", data.txtSecondNo);
    } else {
        sb.appendLine("             <td><input type='text' id='txtSecondNo' name='txtSecondNo' value=''/></td>");
    }
    
    sb.appendLine("         </tr>");
    sb.appendLine("         <tr>");
    sb.appendLine("             <td><input type='submit' value='Calculate'/></td>");
    sb.appendLine("         </tr>");

    if (data && data.txtFirstNo && data.txtSecondNo) {
        var sum = parseInt(data.txtFirstNo) + parseInt(data.txtSecondNo);
        sb.appendLine("         <tr>");
        sb.appendLine("             <td>Sum = {0}</td>", sum);
        sb.appendLine("         </tr>");
    }
    
    sb.appendLine("     </table>");
    sb.appendLine(" </form>");
    sb.appendLine("</body>");
    sb.appendLine("</html>");

    sb.build(function(err, result) {
        //resp.writeHead(200, { "Content-Type": "text/html" });
        resp.write(result);
        resp.end();
    });
}


function getCalcForm(req, resp, formData) {
    resp.writeHead(200, { "Content-Type": "text/html" });
    getCalcHtml(req, resp, formData);
}


http.createServer(function(req, resp) {
    switch (req.method) {
        case "GET":
            if (req.url === "/") {
                getHome(req, resp);
            } else if (req.url === "/calc") {
                getCalcForm(req, resp);
            } else {
                get404(req, resp);
            }
            break;
        case "POST":
            if (req.url === "/calc") {
                var reqBody = '';
                req.on('data', function(data) {
                    reqBody += data;
                    if (reqBody.length > 1e7) { // 10MB
                        resp.writeHead(413, "Request entity too large", { "Content-Type": "text/html" });
                        resp.write("<html><head><title>413</title></head><body>413: Too much of information. Server cannot handle this.</body></html>");
                        resp.end();
                    }
                });

                req.on('end', function(data) {
                    var formData = qs.parse(reqBody);
                    getCalcForm(req, resp, formData);
                });
            } else {
                get404(req, resp);
            }
            break;
        default:
            get405(req, resp);
            break;
    }
    /*resp.writeHead(200, { "Content-Type": "text/html" });
    resp.write("<html><body>Hello <strong><i>World!</i></strong></body></html>");*/
    //resp.end();
}).listen(port);

console.log("Server listening on port 9000");