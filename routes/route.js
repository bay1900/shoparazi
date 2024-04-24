const express = require("express");
const router = express.Router();

const resFormat = require('../services/helper')

const conn    = require("../services/connection");
const { restart } = require("nodemon");
require('dotenv').config()





router.post( "/insert_product", ( req, res ) => { 
    console.log( "receive requeset ! " );

    conn.getConnection((err, connection) =>  {
        if (err) throw err; // not connected!

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
        console.log( sql );
       
        connection.query(sql, (err, rs, fields) => {
        connection.release();

            let data = "";
            if ( err ) { 
                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
            }

            if ( !err ) { 
                const inserted_row = rs.affectedRows
                const result = rs[0]

                if ( inserted_row == 0 ) { 
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
    console.log( "receive requeset ! " );

    conn.getConnection((err, connection) =>  {
        if (err) throw err; // not connected!

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

                    const groups = nestGroupsBy(result, ['sp_cate_des', 'sp_cate_des2', 'sp_cate_des3']);
                    console.log(JSON.stringify(groups));
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("00", "Success", "", groups)
                }
            } 
        res.json( data )  
        }); 
    }); 
})


router.get( "/test", ( req, res ) => { 
    console.log( "receive requeset ! " );

    conn.getConnection((err, connection) =>  {
        if (err) throw err; // not connected!

        connection.query('call GET_ALL_EOI();  ', (err, rs, fields) => {
        connection.release();

            let data = "";
            if ( err ) { 
                // resCode, resMessage, resError, rs 
                data = resFormat ("02", err.sqlMessage, err.code )
            }

            if ( !err ) { 
                const dataLength = rs[0].length
                const result = rs[0]

                if ( dataLength == 0 ) { 
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("01", "No data", "", result)
                }
                
                if ( dataLength > 0 ) { 
                    //resCode, resMessage, resError, rs 
                    data = resFormat ("00", "Success", "", result)
                }
            }
        res.json( data )


        });
    });
})


function nestGroupsBy(arr, properties) {
    properties = Array.from(properties);
    // console.log( properties);
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

  function groupBy(conversions, property) {

    console.log( 'conversions : ', conversions   );
    return conversions.reduce((acc, obj) => {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

module.exports = router;   
   