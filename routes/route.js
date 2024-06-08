const express = require("express");
const router = express.Router();

const reader = require("xlsx");

const logger = require('../logger')

const cron = require('node-cron');
 
const resFormat = require('../services/helper')

const conn    = require("../services/connection");
const { restart, reset } = require("nodemon");
require('dotenv').config()

 

router.post( "/retail_dashboard", ( req, res ) => { 
    const child = logger.child ( {service: 'RETAIL DASHBOARD' })

    conn.getConnection((err, connection) =>  {
        if (err) { child.error(err, 'Unable to connect to database !') }

        const { 
                retail_id
              } =  req.body

        let sql = `CALL DASHBOARD( ${retail_id});`
        console.log( sql );
       
        connection.query(sql, (err, rs, fields) => {
        connection.release();
            let data = "";
            if ( err ) { 
                if (err) { child.error({err}, '') }
                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
            }
            if ( !err ) { 
                const dataLength = rs[0].length
                let result = rs[0] 
                if ( dataLength == 0 ) { 
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("01", "No data", "", result)
                }
                if ( dataLength > 0 ) { 
                    
                    data = resFormat ("00", "Success", "", result )
                } 
            }  
        child.info( {}, 'Success' )
        res.json( data )   
        }); 
    });
})
router.post( "/retail_product_update", ( req, res ) => { 
    const child = logger.child ( {service: 'RETAIL PRODUCT UPDATE' })

    conn.getConnection((err, connection) =>  { 
        if (err) { child.error(err, 'Unable to connect to database !') }

        const {  
                pro_id ,
                price  ,
                promo_code
              } =  req.body

        let sql = `CALL INSERT_TO_UPDATE( ${pro_id}, ${price}, ${promo_code});`

        console.log( sql);
       
        connection.query(sql, (err, rs, fields) => {
            connection.release();
                let data = "";
                if ( err ) { 
                    if (err) { child.error({err}, '') }
                    // resCode, resMessage, resError, rs 
                    data = resFormat ("02", err.sqlMessage, err.code )
                }
                if ( !err ) { 
                    const inserted_row = rs.affectedRows
                    let result = rs[0] 
                    if ( inserted_row == 0 ) { 
                        //resCode, resMessage, resError, rs 
                        data = resFormat ("01", "No data", "", result)
                    }
                    if ( inserted_row > 0 ) { 
                        //resCode, resMessage, resError, rs 
                        data = resFormat ("00", "Success", "", result )
                    } 
                }  
            child.info( {}, 'Success' )
            res.json( data )   
        }); 
    });
})

router.post( "/retail_insert_product", ( req, res ) => { 
    console.log( "receive requeset ! " );

    conn.getConnection((err, connection) =>  {
        if (err) { child.error(err, 'Unable to connect to database !') }


        const { retail_id, 
                pro_id,
                sp_cate_type,
                promo_code,
                quantity,
                weight,
                unit,
                sub_type,
                sub_type_des,
                price,
                name,
                pro_des
        } =  req.body

        let sql = `CALL INSERT_PRODUCT( ${retail_id}, ${pro_id}, ${sp_cate_type}, ${promo_code}, ${quantity}, ${weight}, ${unit}, ${sub_type}, ${sub_type_des}, ${price}, '${name}', '${pro_des}');`
       
        connection.query(sql, (err, rs, fields) => {
        connection.release();

            let data = "";
            if ( err ) { 
                if (err) { child.error({err}, ) }

                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
            }

            if ( !err ) { 
                const inserted_row = rs.affectedRows
                const result = rs[0]

                if ( inserted_row == 0 ) { 
                    if (err) { child.error({}, 'No data') }

                    //resCode, resMessage, resError, rs 
                    data = resFormat ("01", "No data", "", result)
                }
                
                if ( inserted_row > 0 ) { 
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("00", "Success", "", result)
                }
            }
        res.json( data )


        });
    });
})

router.get( "/get_product", ( req, res ) => { 
    const child = logger.child ( {service: 'GET PRODUCT'})

    conn.getConnection((err, connection) =>  {
        if (err) { child.error(err, 'Unable to connect to database !') }
        connection.query('call GET_PRODUCT();  ', (err, rs, fields) => {
            connection.release();

            let data = "";
            if ( err ) { 
                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
            }
            if ( !err ) { 
                const dataLength = rs[0].length
                let result = rs[0] 
                if ( dataLength == 0 ) { 
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("01", "No data", "", result)
                }
                if ( dataLength > 0 ) { 
                    let groups = nestGroupsBy(result, ['sp_cate_des', 'sp_cate_des2', 'sp_cate_des3']);
                    let format_group = format(groups)

                    data = resFormat ("00", "Success", "", format_group )
                } 
            }  
            child.info( {}, 'Success' )
            res.json( data )   
        }); 
    }); 
}) 
 
router.post( "/login", ( req, res ) => { 
    const child = logger.child ( {service: 'LOG IN'})

    const { 
            user_id_or_email,
            pw
          } = req.body

    conn.getConnection((err, connection) =>  {
        if (err) { child.error(err, 'Unable to connect to database !') }

        connection.query(`call LOGIN( ${user_id_or_email}, ${pw});  `, (err, rs) => {
            connection.release();

            let data = "";
            if ( err ) { 
                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
            }
            if ( !err ) { 
                const dataLength = rs[0].length
                let result = rs[0] 
                if ( dataLength == 0 ) { 
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("01", "No data", "", result)
                }
                if ( dataLength > 0 ) { 
                    data = resFormat ("00", "Success", "", result )
                } 
            }  
            child.info( {}, 'Success' )
            res.json( data )   
        }); 
    }); 
})

const delete_product = async ( ) => { 
    return new Promise ( (resolve, reject) =>{ 
        conn.getConnection((err, connection) =>  {
            if (err) throw err; // not connected!

            let sql = `delete from  opti_price_temp;`

            connection.query(sql, (err, rs, fields) => {
                connection.release();
                    if ( err ) { 
                    console.log( "OPTIMIZE DELETE ~ FAIL ",  err.sqlMessage  );
                    reject(err)
                }
                if ( !err ) { 
                    console.log( "OPTIMIZE DELETE ~ SUCCESS " );
                    resolve()
                }
            });
        }); 
    });
    
}

const insert_opti_product = async ( data) => { 
    
    // return new Promise ( (resolve, reject) =>{ 
        
        var rand = Math.floor(Math.random() * 100) + 1;

        for ( i = 0; i < data.length; i++ ) { 
            let item = data[i]

            const { pro_id,
                    qty
            } = item  

            conn.getConnection((err, connection) =>  {
                if (err) throw err; // not connected!
 
                let sql = `CALL INSERT_OPTI( ${rand}, ${pro_id}, ${qty});`

                connection.query(sql, (err, rs, fields) => {
                connection.release();

                if ( err ) { 
                // console.log( "FAIL ", "err_msg : ", err.sqlMessage, "data",  JSON.stringify(item) );
                console.log( "OPTIMIZE INSERT ~ FAIL ",  err.sqlMessage  );
                // reject(err)
                }
                if ( !err ) { 
                // console.log( "SUCCESS ~ ", JSON.stringify(item) );
                // console.log( "OPTIMIZE INSERT ITEM ** ", JSON.stringify(item) ); 

                 
                } 
                });
            });
            
        } 
        console.log( "OPTIMIZE INSERT ~ SUCCESS " );
        // resolve()
    // });

    console.log( "Optimizing price .... ");
    return new Promise ( (resolve, reject) =>{ 
        setTimeout(() => {
            // console.log("Delayed for 1 second.");
            resolve()
          }, "10000");
    })
} 

const price_optimization = async () => { 
    const child = logger.child ( {service: 'OPTICMIZE'})

    return new Promise ( (resolve, reject) =>{ 

        conn.getConnection((err, connection) =>  {
        if (err) throw err; // not connected!

            let sql = `CALL PRICE_OPTI();`

            connection.query(sql, (err, rs, fields) => {
                connection.release();

                let data = "";
                if ( err ) { 
                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
                }
                if ( !err ) { 
                    const dataLength = rs[0].length
                    let result = rs
                    if ( dataLength == 0 ) { 
                    data = result
                    }
                    if ( dataLength > 0 ) { 
                    data = result
                    } 
                }  
                child.info( {}, 'Success' )
                resolve( data )
            }); 
        });
    });
}

function sumArray(arr) { 
    let sum = 0; 
    arr.forEach(num => sum += num);
    return sum;
}
router.post( "/optimize", async (req, res) => { 
    let data_req = req.body


    await delete_product()
    await insert_opti_product( data_req )

    let price_result = await price_optimization ()
    let opti_result = price_result[0]

    let data = String
    if ( price_result.length == 0 ) { 
         data = resFormat("01", "No data", "", price_result[0])
    }

    if ( opti_result.length > 0 ) { 

        let total_price = [] 
        let total_saved = [] 
        for (let i = 0; i < opti_result.length; i++) {
            const item = opti_result[i];

            total_price.push( item.price_after_discount ) 
            total_saved.push( item.saved  )
        }

        let sum_price = sumArray(total_price)
        console.log( "sum price : ", sum_price  );
        let sum_saved = sumArray ( total_saved )
        console.log( "sum saved : ", sum_saved  );


        if ( sum_price < 20 ) { 
            delivery_price = 15
        }
        if ( sum_price > 20 && sum_price < 50 ) { 
            delivery_price = 10
        }
        if ( sum_price > 50  && sum_price < 100 ) { 
            delivery_price = 5
        }
        if ( sum_price > 100 ) { 
            delivery_price = 0
        }

        let opti_obj = { 
                        "product": opti_result, 
                        "receipt": { 
                        "total_price": sum_price, 
                        "total_saved": sum_saved,
                        "delivery_price": delivery_price,
                        "delivery_estimate": 30,
                      }
        } 
        data = resFormat("00", "Success", "", opti_obj )
    }
    res.json( data  )
})



 
router.get ( "/reset", (req, res) => { 

  console.log( "received request");

    // READ XLSX
    const file = reader.readFile('data.xlsx')

    let data = [] 
    const sheets = 'data'

    for(let i = 0; i < sheets.length; i++)  { 
        const temp = reader.utils.sheet_to_json( 
            file.Sheets[file.SheetNames[i]]) 
            temp.forEach((res) => { 
                data.push(res) 
            }) 
    } 
   
    let data_arr = JSON.parse( JSON.stringify(data))

        for ( i = 0; i < data_arr.length; i++ ) { 
            let item = data[i]

            const { retail_id, 
                    pro_id,
                    sp_cate_type,
                    sp_cate_type2,
                    sp_cate_type3,
                    promo_code,
                    quantity,
                    weight,
                    unit,
                    price,
                    name,
                    pro_des
                } = item

            conn.getConnection((err, connection) =>  {
                if (err) throw err; // not connected!

                let sql = `CALL INSERT_PRODUCT( ${retail_id}, ${pro_id}, ${sp_cate_type}, ${sp_cate_type2}, ${sp_cate_type3 || null }, ${promo_code || null } , ${quantity}, ${weight}, ${unit}, ${price}, '${name}', '${pro_des}');`

                connection.query(sql, (err, rs, fields) => {
                    connection.release();

                    if ( err ) { 
                    console.log( "FAIL ", "err_msg : ", err.sqlMessage, "data",  JSON.stringify(item) );
                    }
                    if ( !err ) { 
                    console.log( "SUCCESS ~ ", JSON.stringify(item) );
                    }
                });
            });
    }

} ) 

cron.schedule('*/30 * * * * *', () => {
    const child = logger.child ( {service: 'UPDATE PRODUCT JOB'})

    conn.getConnection((err, connection) =>  {
        if (err) {  child.error({err}, 'Unable to connect to database !')  }
            connection.query('call UPDATE_CHECKER();  ', (err, rs, fields) => {
                connection.release();

                if ( err ) { child.error({err}, err) }
                if ( !err ) { 
                    const dataLength = rs[0].length
                    let result = rs[0] 
                    if ( dataLength == 0 ) { 
                        child.info( {}, 'No data' )
                    }
                    if ( dataLength > 0 ) { 
                        let update = result[0].req_update 
                        if ( update == "Y" ) {  // UPDATE
                            product_update()    // UPDATE PRODUCT
                        }
                        if ( update == "N" ) {  // DONT UPDATE
                        child.info( {}, 'No product to update' )
                        }
                    } 
                }  
            }); 
    }); 
});

function nestGroupsBy(arr, properties) {
    properties = Array.from(properties);
    if (properties.length === 1) {
        return groupBy(arr, properties[0]);
    }

    const property = properties.shift();
    var grouped = groupBy(arr, property);
    for (let key in grouped) {   
        grouped[key] = nestGroupsBy(grouped[key], Array.from(properties));
    }
    return grouped;
}

function groupBy(arr, property) { 
    return arr.reduce((item, obj) => {
        let key = obj[property];
            if (!item[key]) {
                item[key] = [];
            }
            item[key].push(obj);
            return item;
    }, {});
}
  
function format (groups) { 
    let new_group = {}
                let lv2 = {} 
                let lv3 = {}
                for(let cat in groups){
                    for(let property in groups[cat]){
                        for (let property_2 in groups[cat][property] ) { 

                            let cat2 = groups[cat][property]

                            if ( property_2 == 'null' ) { 
                                lv3 = cat2[property_2]

                                console.log( "property_2 : ", property_2  )
                            }
                            if ( property_2 != 'null' ) { 
                                lv3[property_2] = cat2[property_2]
                                console.log( "property_2 : ", property_2  )
                            }
                        }
                        lv2[property] = lv3
                    } 
                    new_group[cat] = lv2
                    lv2 = {} 
                    lv3 = {}
                }
    return new_group
}

function product_update () {
    const child = logger.child ( {service: 'UPDATE PRODUCT JOB'})

    conn.getConnection((err, connection) =>  {
        connection.query('call UPDATE_PRODUCT();  ', (err, rs, fields) => {
            connection.release();

            if ( err ) { child.error(err, 'Unable to connect to database !');}
            if ( !err ) { 
                child.info( {}, 'Updated product' )
            }  
        }); 
    });
}


module.exports = router;   
         