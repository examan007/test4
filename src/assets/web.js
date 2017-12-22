var express = require('express')
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
try {
    var fs = require('fs');
    fs.mkdir('data', function () {});
} catch (e) {}
try {
    var bodyParser = require('body-parser');
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(bodyParser.text());

    app.use(express.json({limit: '50mb'}));
    app.use(express.urlencoded({limit: '50mb'}));

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
} catch (e) {
    console.log('app=' + e.toString());
}
function success (res) {
    return (function () {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        var obj = {
            result: "true",
            message: "done OK!",
            status: "Success"
        }
        msg = JSON.stringify(obj);
        console.log('RESPONSE=[' + msg + ']');
        res.end(msg);
    });
}
function error (res) {
    return (function (err) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        var obj = {
            result: "false",
            message: err,
            status: "Error"
        }
        msg = JSON.stringify(obj);
        console.log('RESPONSE=[' + msg + ']');
        res.end(msg);
    });
}
function retrieve (res) {
    return (function () {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        msg = JSON.stringify(app.Contacts);
        console.log('RESPONSE=[' + msg + ']');
        res.end(msg);
    });
}
var arg = process.cwd();
console.log('arg=[' + arg + ']');
if (typeof(arg) === 'undefined') {
    app.CurrentDirectory = '/';
} else {
    app.CurrentDirectory = arg + '/';
}
console.log('app.CurrentDirectory=[' + app.CurrentDirectory + ']');
app.BasePath = 'data/';
app.loadContacts = function () {
    var text = '[]';
    var fs = require('fs');
    try {
        text = fs.readFileSync(app.BasePath + 'Contacts.json').toString('utf-8');
    } catch (e) {
        console.log('load=' + e.toString());
    }
    return (JSON.parse(text));
}
app.Contacts = app.loadContacts();
app.HashMap = []
app.Contacts.forEach( function (obj) {
    app.HashMap[obj.Key] = obj;
});
console.log('Contacts=' + JSON.stringify(app.Contacts));
app.saveContacts = function (obj, success, failure) {
    var fs = require('fs');
    console.log('save=' + JSON.stringify(obj));
    try {
        var contacts = app.loadContacts();
        fs.writeFileSync(app.BasePath + 'Contacts.' + (new Date()).getTime() + '.json',
            JSON.stringify(contacts).toString('utf-8'));
        fs.writeFileSync(app.BasePath + 'Contacts.json',
            JSON.stringify(obj).toString('utf-8'));
        success();
    } catch (e) {
        console.log('save=' + e.toString());
        failure(e.toString());
    }
}
app.saveImage = function (filename, contents, success, failure) {
    var fs = require('fs');
    console.log('filename=' + filename);
    try {
        for (var i = 0; i < contents.length; i++) {
            var image = Buffer(contents[i], 'base64');
            fs.appendFileSync(filename, image);
        }
        success();
    } catch (e) {
        console.log('save=' + e.toString());
        failure(e.toString());
    }
}
app.addContact = function (obj, success, failure) {
    if (typeof(obj.Key) === 'undefined') {
        failure('Error; unable to add contact; undefined key!');
    } else
    if (typeof(app.HashMap[obj.Key]) === 'undefined') {
        app.HashMap[obj.Key] = JSON.parse(JSON.stringify(obj));
        app.Contacts.unshift(obj);
        app.saveContacts(app.Contacts, success, failure);
    } else {
        failure('Error; unable to add contact; already exists!');
    }
}
app.updateContact = function (obj, success, failure) {
    if (typeof(obj.Key) === 'undefined') {
        failure('Error; unable to save contact; undefined key!');
    } else
    if (typeof(app.HashMap[obj.Key]) === 'undefined') {
        failure('Error; unable to save contact; does not exist!');
    } else {
        app.HashMap[obj.Key] = JSON.parse(JSON.stringify(obj));
        for (var i = 0; i < app.Contacts.length; i++) {
            if (app.Contacts[i].Key === obj.Key) {
                app.Contacts[i] = obj;
                break;
            }
        }
        app.saveContacts(app.Contacts, success, failure);
    }
}
app.removeContact = function (obj, success, failure) {
    if (typeof(obj.Key) === 'undefined') {
        failure('Error; unable to remove contact; undefined key!');
    } else
    if (typeof(app.HashMap[obj.Key]) === 'undefined') {
        failure('Error; unable to remove contact; already removed!');
    } else {
        for (var i = 0; i < app.Contacts.length; i++) {
            if (app.Contacts[i].Key === obj.Key) {
                try {
                    delete (app.HashMap[obj.Key]);
                } catch (e) {}
                app.Contacts.splice(i, 1);
                break;
            }
        }
        app.saveContacts(app.Contacts, success, failure);
    }
}
app.get('*',function(req,res) {
  app.showRequest(req);
  var filename = 'index.html';
  var end;
  if (req.url === '/') {} else
  if ((end = req.url.indexOf('?')) < 0) {
    filename = req.url;      
  } else {
    filename = req.url.substr(0, end);
  }
  res.sendFile(app.CurrentDirectory + filename);
});
app.showRequest = function (req) {
    console.log('url=' + JSON.stringify(req.url));
    console.log('headers=' + JSON.stringify(req.headers));
    console.log('body=' + JSON.stringify(req.body));
}
app.post('/images', function (req, res){
    console.log('url=' + JSON.stringify(req.url));
    //app.showRequest(req);
    var filename = req.body.filename;
    var idx = 0;
    if ((idx = filename.lastIndexOf('/')) >= 0) {
        filename = app.BasePath + filename.substr(idx + 1);
    }
    app.saveImage(filename, req.body.contents, success(res), error(res));
});
app.post('/private', function (req, res){
    //app.showRequest(req);
    app.showRequest(req);
    function getBody(body) {
        var entry = new Object();
        for(var key in body) {
            console.log('key=' + key);
            entry = eval('[' + key + ']');
            console.log('getbody' + JSON.stringify(entry));
        }
        return (entry[0]);
    }
    var entry = getBody(req.body);
    var moment = require('moment');
    entry.create = moment().utc();
    if (typeof(entry['operation']) === 'undefined') {
        error(res)('Error, undefined operation!');
    } else
    if (entry.operation === 'create') {
        app.addContact(entry, success(res), error(res));
    } else
    if (entry.operation === 'retrieve') {
        retrieve(res)();
    } else 
    if (entry.operation === 'update') {
        app.updateContact(entry, success(res), error(res));
    } else
    if (entry.operation === 'delete') {
        app.removeContact(entry, success(res), error(res));
    } else {
        error(res)('Error, operation not implemented!');
    }
});
app.ListenPort = 3333;
app.listen(parseInt(app.ListenPort), function () {
  console.log('Started on PORT ' + app.ListenPort);
});

function init() {
    app.use(function(req, res, next) {
        app.showRequest(req);
        console.log('url=' + JSON.stringify(req.url));
        console.log('headers=' + JSON.stringify(req.headers));
        });
}
var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors());
