# ooyala-request-api
A request formatter for the Ooyala Backlot API

## Installation
```
  npm install ingenious/ooyala-request-api

```

```
 var ooyala = require('ooyala-request-api');
```

##API SUMAMRY

```
 ooyala.init({
  
           api_key: 'Rjsgjsdyuzxjhjss53453.xzgkS',
           secret_key: 'uysiIYYIkjnkkSb80e-3DfKhjdfs7iB',
           baseUrl: 'http://api.ooyala.com',
           include: ['labels']
 
   });
   
   //  NB: keys above are fake examples. Use your own keys
```
   
   
###MAKE REQUEST
```
var request={
     'term'  : 'Serena Williams',  //optional
    'label'  : 'Sport', // optional
    'created_at_start' : '1 day',  // or 1436292157000 (optional)
    'created_at_end'   :  '3 hours', // or 1436292157000 (optional)
    'updated_at_start'  : '2 years', // or 1436292157000 (optional)
    'updated_at_end'   :  '1 years'  // or 1436292157000 (optional)
};
                ooyala.apiRequest(request)
                        .then(function(body) {
                            api.response_status = 200;

                            //  handle returned body

                           
                        }).catch(function(err) {
                        
                        
                          // handle error   
                           
                        });
```
