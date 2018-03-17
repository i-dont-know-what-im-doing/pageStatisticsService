const AWS = require( 'aws-sdk' );
const DB = require( 'promised-dynamo' );

const s3 = new AWS.S3();
const db = new DB( {
    db: new AWS.DynamoDB()
}, [ {
    name: "idkwid-site-data",
    alias: "siteData"
} ] );

function processEvent( event ) {
    if ( !event.forResource ) {
        return Promise.reject( 'No resource specified' );
    }

    return db.siteData.getItem( 'resourceStatistics', event.forResource );
}


exports.handler = function( event, context, callback ) {
    
    processEvent( event )
        .then( function( result ) {
            if( result ) {
                callback( null, result );
            } else {
                callback( JSON.stringify( {
                    errorType: "NotFoundError",
                    httpStatus: 404,
                    requestId: context.awsRequestId
                } ) );
            }
        } )
        .catch( function( e ) {
            callback( JSON.stringify( {
                errorType: "InternalServerError",
                httpStatus: 500,
                requestId: context.awsRequestId
            } ) );
        } );
    
};