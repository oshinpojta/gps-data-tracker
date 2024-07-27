const express = require("express");
const cors = require("cors");
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const database = require("./database-services/database");
// const morgan = require("morgan");

const app = express();

// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname,"access.log"),
//     {flags : "a"}
// );


app.use(cors());
// app.use(morgan("combined", { stream : accessLogStream}));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'text/plain' }));
app.use(express.json());

// Setup Multer for file uploads (if needed)
const upload = multer({ dest: 'Uploads/' });

const folderName = path.join(__dirname, "SavedFiles");
if(!fs.existsSync(folderName)){
    fs.mkdirSync(folderName,{recursive : true});
}

function fetchFields(data){
    try {
        let obj = {
            IMEI : "",
            LATITUDE : "",
            LONGTITUDE : "",
            DEVICE_TIME : "",
            CURRENT_TIME : "",
            SITE_ID : "",
            DEVICE_ID : "",
            ALTITUDE : "",
            SPEED : "",
            EXC1_ID : "",
            EXC1_DISTANCE : "",
            EXC2_ID : "",
            EXC2_DISTANCE : "",
            TRACK_STATE : "",
            IGNITION_CHANGE : "",
            IO_INDEX : "",
            CURRENT_MEMORY_POINTER : "",
            ODOMETER : "",
            CHECK_SUM_FOR_64BYTES : ""
        }


        let indexArray = [15, 9, 10, 10, 12, 2, 3, 5, 3, 3, 5, 3, 5, 2, 1, 3, 8, 8, 5, 4]
        let keys = Object.keys(obj);
        
        let currentIndex = 0;
        let j=0;
        for(let i=0;i<keys.length && data.length>=currentIndex+indexArray[j];i++){
            obj[keys[i]] = data.substr(currentIndex, indexArray[j]);
            currentIndex = currentIndex+indexArray[j];
            j++;
        }
        
        return obj;

    } catch (error) {
        console.log(error);
        return null;
    }
}

function createString(obj){
    try {
        if(!obj) return "";

        let keys = Object.keys(obj);
        let str = "";
        for(let i=0;i<keys.length;i++){
            str += keys[i] +"="+obj[keys[i]]
            str += i == keys.length-1 ? "\n" : ", ";
        }

        return str;

    } catch (error) {
        console.log(error)
        return ""
    }
}


app.get("/",(req, res, next)=>{
    console.log("GET-Api Called Successfully!");
    res.json({success : true, msg : "GET-Api Called Successfully!"});
})

app.post("/", upload.single('file'), async (req, res, next)=>{
    try {
        let payload = req.body.a;
        // let queryPayload = req.query.a;
        // if(queryPayload){
        //     payload = queryPayload;
        // }
        console.log("Post Request - Recieved GPS Data : ", new Date(), req.body.a);
        // if(!payload){
        //     res.status(401).json({success: false, msg: "No Data Received!"});
        //     return;
        // }

        let dataArray = payload.split(",");
        // let finalString = ;

        // for(let i=0;i<dataArray.length-1;i++){
        //     let dataObj = fetchFields(dataArray[i]);
        //     finalString += createString(dataObj);
        // }
        // finalString += "CHECKSUM=" + dataArray[dataArray.length-1];
        // console.log(finalString.trim());

        // let writeData = finalString.trim();
        const checksum = dataArray[dataArray.length-1].length <= 4 ? dataArray[dataArray.length-1] : "";
        if(checksum) dataArray = dataArray.splice(0, dataArray.length-1);
        let writeData = dataArray.join("\n");
        if(checksum) writeData = writeData + "," + checksum;
        // if(checksum) writeData = writeData + "," + checksum + "\n";

        const date = new Date();
        const dateString = date.toISOString().split(":").join("-")
        const filename = "File_"+dateString+".txt";
        const filepath = path.join(folderName, filename)

        fs.writeFile(filepath, writeData,(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("File Saved Successfully!", filename);
            }
        });

        res.json({success : true, msg : "POST-Api Called Successfully!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, msg: "Internal Server Error!"});
    }
    
})

const PORT = 4000;
app.listen(PORT,async ()=>{
    console.log("Server Started @ "+PORT)
    const results = await database.sendQuery("SELECT * FROM minematics.excavatorhistory LIMIT 10;")
    console.log('Query results:', results);

})