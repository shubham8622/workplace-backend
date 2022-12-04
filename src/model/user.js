const mongoose = require("mongoose");
const {Schema} = mongoose;

const userschema = new Schema({
    fName:{
        type:String,
        default:null,
    },
    lName:{
        type:String,
        default:null,
    },
    who:{
        type:String,
        default:null,
    },
    gender:{
        type:String,
        default:null,
    },
    eMail:{
        type:String,
    },
    password:{
        type:String,
    },
    image:{
        type:String
    },
    current_company:{
        type:String
    },
    primary_role:{
        type:String
    },
    total_experience:{
        type:String
    },
    current_CTC:{
        type:String
    },
    resume:{
        type:String
    },
    company:{
        type:String
    },
    phone_number:{
        type:String
    },
    company_size:{
        type:String
    },
    industry:{
        type:String
    },
    token:{
        type:String,
    }
});

const user = mongoose.model("User",userschema);

module.exports = user;