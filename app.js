var express = require('express')
    , http = require('http')
    , path = require('path')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , logger = require('morgan')
    , errorHandler = require('errorhandler')
    , events = require('events');

var app = express();
// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "x-requested-with,x-requested-by,Content-Type");
  next();
});

app.use(express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

require('./routes/index')(app);


http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
