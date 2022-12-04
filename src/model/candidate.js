const mongoose = require("mongoose");

const candidateSchema = mongoose.Schema({
    candidate_id:{
        type:mongoose.Schema.Types.ObjectId,
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
    }
});

const CandidateModel = mongoose.model("candidate",candidateSchema);

module.exports = CandidateModel;