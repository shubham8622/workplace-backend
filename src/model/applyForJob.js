const mongoose = require("mongoose");

const applyJobSchema = new mongoose.Schema({
    job_name:{
        type:String
    },
    employer_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    jobId:{
        type:mongoose.Schema.Types.ObjectId
    },
    fName:{
        type:String,
    },
    lName:{
        type:String,
    },
    eMail:{
        type:String,
        unique: false
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
    companyToApply:{
        type:String
    }
});

const ApplyJobModel = mongoose.model("appliedJob",applyJobSchema);

module.exports = ApplyJobModel;