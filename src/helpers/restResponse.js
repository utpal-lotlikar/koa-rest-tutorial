var uniqid = require('uniqid');

class RestResponse {
    constructor() {
        this.requestId = uniqid()
        this.timestamp = new Date().getTime();
        this.data = undefined;
        this.status = 200;
        this.message = "Success";
    }

    setData(result) {
        this.data = result;
    }

    setError(code, message) {
        this.status = code;
        this.message = message;
    }
}

module.exports = RestResponse;