const express = require('express');
const app = express();

const PORT = 3030;
const multer = require('multer');

const upload = multer();

app.use(express.json({ extend: false }));
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');

const AWS = require('aws-sdk');
const e = require('express');
const config = new AWS.Config({
    accessKeyId: 'AKIA6BCT43VPCLZ4ZBRX',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
})


AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'SanPham';

app.get('/', (req, res) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            res.send("Internal Server Error!");
            console.log(err)
        } else {
            console.log("data: ", data.Items)
            return res.render('index', { sanPhams: data.Items });
        }
    });
})

app.post('/', upload.fields([]), (req, res) => {
    const { ma_sp, ten_sp, so_luong } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            ma_sp,
            ten_sp,
            so_luong
        }
    }

    docClient.put(params, (err, data) => {
        if (err) {
            console.log("Error in Insert: ", err);
            res.send("Internal Server Error!");
        } else {
            console.log("Data Insert: ", data)
            return res.redirect('/');
        }
    })
});

app.post('/delete', upload.fields([]), (req, res) => {
    const { ma_sp } = req.body;
    const params = {
        TableName: tableName,
        Key: {
            ma_sp
        }
    }
    docClient.delete(params, (err, data) => {
        if (err) {
            console.log("Error in Delete: ", err);
            res.send("Internal Server Error!");
        } else {
            console.log("Data Delete: ", data)
            return res.redirect('/');
        }
    })

});

app.post('/update', upload.fields([]), (req, res) => {
    const { ma_sp, ten_sp, so_luong } = req.body;
    const params = {
        TableName: tableName,
        Key: {
            ma_sp
        },
        UpdateExpression: "set ten_sp =:t, so_luong =:s",
        ExpressionAttributeValues: {
            ":t": ten_sp,
            ":s": so_luong
        }
    };
    docClient.update(params, (err, data) => {
        if (err) console.log(err);
        else {
            console.log("Data Delete: ", data)
            return res.redirect('/');
        };
    });
});

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}!')
})