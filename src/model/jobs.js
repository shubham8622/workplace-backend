const { default: mongoose } = require("mongoose");
const mpongoose = require("mongoose");

const jobsSchema = mongoose.Schema({
    employer_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    role:{
        type:String
    },
    experience:{
        type:String
    },
    company:{
        type:String
    },
    location:{
        type:String
    },
    package:{
        type:String
    },
    job_type:{
        type:String
    },
    description:{
        type:String
    }
});

const JobModel = mongoose.model("Job",jobsSchema);
module.exports = JobModel;