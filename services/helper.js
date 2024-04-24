

const resFormat  =  ( resCode, resMessage, resError, rs ) => { 
    data = { 
        "ResposeCode": { 
            "code": resCode,
            "message": resMessage,
            "error": resError
        },
        "ResponseData": { 
            "data": rs || []
        }
    }

    return data;
}

module.exports = resFormat;  