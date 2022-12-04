const mongoose = require('mongoose');

mongoose.connect(process.env.DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log("Connected");
}).catch((error)=>{
    console.log(error)
    process.exit(1);
})