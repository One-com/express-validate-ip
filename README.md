# express-validate-ip

## installation

```
$ npm install express-validate-ip
```

## Usage

```js

const express = require('express');
const expressValidateIp = require('express-validate-ip');

const allowList = [
    '127.0.0.1',
    '10.0.0.0/16'
];

const app = express();

app.use(expressValidateIp(allowList));

// ...
```
