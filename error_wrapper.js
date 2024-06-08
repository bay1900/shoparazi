const logger = require('./logger')

// PINO
const log_child = logger.child({ 
    service: 'FETCH URL'
})

// CUSTOM ERROR CLASS
class ResponseErrors extends Error { 
    constructor( message, res ) { 
        super( message )
        this.response = res 
    }
}


const params_message = { 
    param_msg_001 : 'NULL',
    param_msg_002 : 'UNDEFINED',
    param_msg_003 : 'CAN NOT BE EMPTY' 
}

/*
     SERVICE CODE 
     001  -  Body 'CANT NOT BE EMPTY'
*/



async function myFetch( ...options ) { 
    
    const { URL = '', METHOD = 'GET', BODY, SERVICE_CODE } = options[0] 

    const service = FUNC_CHECK_SERVICE_CODE( SERVICE_CODE, BODY ) // SERVICE AUTHENTICATION  *** optional ***

    if ( !service.status ) { 
         console.log( "stop here !" )
         return
    }


    const res = await fetch( URL, { 
        method: METHOD,
        headers: { 'Content-Type': 'application/json' }
    } ) 
    if( !res.ok ) { 
        log_child.error({ status: res.status, statusText: res.statusText }, 'FETCH FAIL')  // LOG
        throw new ResponseErrors( 'FETCH ERROR: ', res )
    }
    else{ 
        log_child.info({ status: res.status, statusText: res.statusText, res: res }, 'FETCH SUCCESS')  // LOG
        return res 
    }
}

function FUNC_CHECK_SERVICE_CODE ( SERVICE_CODE, BODY ) { 

    if( SERVICE_CODE === '001' && Object.keys(BODY).length >! 0 ) { 
        
         var service = { 
                service: SERVICE_CODE, 
                msg: "Body can not be empty",
                status: false
         }
         return service
    }
    else { 
        var service = { 
            service: SERVICE_CODE, 
            msg: "Success",
            status: true
     }
     return service
    }
}

module.exports = { myFetch }  

