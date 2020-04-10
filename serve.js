const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('./dist/chat-dist-frontend'));

app.use(express.static(__dirname+'/dist/chat-dist-frontend'));
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/dist/chat-dist-frontend/index.html'));
});
app.listen(process.env.PORT || 8080);