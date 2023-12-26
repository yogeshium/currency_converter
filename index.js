import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import {dirname} from "path";
import {fileURLToPath} from "url";

const app= express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const apiKey = "dc46b976c4e4a26b95164814";
const apiURL = `https://v6.exchangerate-api.com/v6/${apiKey}`;

var currency = {
	"result":"success",
	"documentation":"https://www.exchangerate-api.com/docs",
	"terms_of_use":"https://www.exchangerate-api.com/terms",
	"supported_codes":[
		["AED","UAE Dirham"],
		["AFN","Afghan Afghani"],
	]
};


// home route
app.get("/",async(req,res)=>{
    try{
        const result = await axios.get(apiURL+"/codes");
        currency = result.data;
        const initialCurrency=[
            {
                "name": "Indian Rupee",
                "code": "INR"
            },
            {
                "name": "UAE Dirham",
                "code": "AED"
            }
        ];
        res.render("index.ejs",{currency:currency.supported_codes, initialCurrency: initialCurrency});
    }
    catch(error)
    {
        console.error(error.message);
    }
});



app.post("/convert",async(req,res)=>{

    const fromCurr = req.body["fromCurr"].split(",");
    const toCurr = req.body["toCurr"].split(",");
    const initialCurrency=[
        {
            "name": fromCurr[1],
            "code": fromCurr[0],
        },
        {
            "name": toCurr[1],
            "code": toCurr[0],
        },
    ];
    if(fromCurr[0]===toCurr[0])
    {
        const fromAmount = parseFloat(req.body['fromAmount']);
        const toAmount = fromAmount;
        
        res.render("index.ejs",{currency:currency.supported_codes, initialCurrency: initialCurrency});
    }
    else
    {
        try{
            const result = await axios.get(apiURL+`/pair/${fromCurr[0]}/${toCurr[0]}`);
            const fromAmount = parseFloat(req.body['fromAmount']);
            const toAmount = fromAmount*result.data.conversion_rate;
            res.render("index.ejs",{currency:currency.supported_codes, initialCurrency: initialCurrency, amount:[fromAmount, toAmount]})
        }
        catch(error)
        {
            console.log(error.message);
        }
    }
    
});


app.listen(port,()=>{
    console.log(`Listening to the port ${port}`);
});