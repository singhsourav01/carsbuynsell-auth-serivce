const fs = require("fs");
var pem2jwk = require("pem-jwk").pem2jwk;

const privateKey = fs.readFileSync("./certs/private.pem");

const jwk = pem2jwk(privateKey, { use: "sig" }, "public");

console.log(jwk);
