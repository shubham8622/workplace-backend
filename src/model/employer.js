const mongoose = require("mongoose");

const employerSchema = mongoose.Schema({
    employer_id:{
        type:String
    },
    image:{
        type:String
    },
    company_name:{
        type:String
    },
    
});

const EmployerModel = mongoose.model("employer",employerSchema);

module.exports = EmployerModel;