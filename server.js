const express = require('express')
const jsdom = require('jsdom');
const axios = require('axios');
const PORT = process.env.PORT || 5000
const app = express();
var Url = require('url-parse');
const { JSDOM } = jsdom;

app.get('/dom', async(req,res)=>{

    try{

        let url =req.query.url;//'https://usepastel.com/?mode=edit&force_run=yes';
        let urltoappend = "http://localhost:5000/dom?url=";

        let parsedURl = new Url(url);
        let origin = parsedURl.origin;

        let response = await axios.get(url);
        const dom = new JSDOM(response['data']);

        if(response.headers['content-type'].indexOf('text/html')>-1){
        

            dom.window.document.querySelectorAll('img').forEach(elm => {
                let source= elm.src;
                let parseSource = new Url(source);

                if(parseSource.href!=''){
                
                    if(parseSource.origin=='null'){
                        //relative url
                    
                        source =  urltoappend+origin+parseSource.href;
                        elm.src = source;
                    
                    }else if(parseSource.origin==origin){
                        //links
                        source = urltoappend+parseSource.href;
                        elm.src = source;
                    }

                    

                }
                
            });

            dom.window.document.querySelectorAll('link').forEach(elm => {
                let source= elm.href;
                let parseSource = new Url(source);

                if(parseSource.href!=''){
                    if(parseSource.origin=='null'){
                        //relative url
                        source =  urltoappend+origin+parseSource.href;
                        elm.href = source;
                    }else if(parseSource.origin==origin){
                        //links
                        source = urltoappend+parseSource.href;
                        elm.href = source;

                    }
                }

            
            });

            dom.window.document.querySelectorAll('script').forEach(elm => {
                let source= elm.src;
                let parseSource = new Url(source);

                if(parseSource.href!=''){
                    if(parseSource.origin=='null'){
                        //relative url
                        source =  urltoappend+origin+parseSource.href;
                        elm.src = source;
                    }else if(parseSource.origin==origin){
                        //links
                        source = urltoappend+parseSource.href;
                        elm.src = source;
                    }
                }

            
            });

            res.status(200).send( dom.serialize() );

        }else  if(response.headers['content-type'].indexOf('javascript')>-1 || response.headers['content-type'].indexOf('css')>-1){
           
            res.setHeader('Content-Type', response.headers['content-type']);
            res.status(200).send(response['data']);
        }
        else{

                let imageres = await axios.get(url,{responseType:'arraybuffer'});
                let base64data = Buffer.from( imageres.data,'binary').toString('base64');
            
                res.setHeader('Content-Type', imageres.headers['content-type']);
                res.status(200).send(base64data);
        
        }

    }catch(err){

        res.status(500).send('Some error occured');

    }

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

