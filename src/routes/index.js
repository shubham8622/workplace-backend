require("dotenv").config()
require('../config/index');
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const User = require('../model/user');
const CandidateModel = require("../model/candidate");
const EmployerModel = require("../model/employer");
const JobModel = require("../model/jobs");
const ApplyJobModel = require("../model/applyForJob");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const multer  = require('multer')
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/uploads',express.static('uploads'));
const upload = multer({ dest: './uploads' })
// const cpUpload = upload.fields([{ name: 'image' }, { name: 'resume'}])
const cpUpload = multer({
    storage: multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads")
    },
    filename: async function(req, file, cb) {
        let id = req.body._id;
        const uniqueSuffix = Date.now()+"-"+file.originalname;
        if(file.fieldname === "image"){
            const updateUserInfo = await User.findByIdAndUpdate({_id:id},{image:uniqueSuffix});
            // console.log(updateUserInfo);
            cb(null, uniqueSuffix)
        }else if(file.fieldname === "resume"){
            const updateUserInfo = await User.findByIdAndUpdate({_id:id},{resume:uniqueSuffix});
            // console.log(updateUserInfo);
            cb(null, uniqueSuffix)
        }
    }
    })
}).fields([{ name: 'image' }, { name: 'resume'}])
const singleUpload = multer({
    storage: multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads")
    },
    filename: async function(req, file, cb) {
        let id = req.body._id;
        const uniqueSuffix = Date.now()+"-"+file.originalname;
        if(file.fieldname === "image"){
            const updateUserInfo = await User.findByIdAndUpdate({_id:id},{image:uniqueSuffix});
            cb(null, uniqueSuffix)
        }
    }
    })
}).single('image')
app.get("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Hello"
    })
})
app.post("/register", async (req,res)=>{
    
    const {fName,lName,who,gender,eMail,password} = req.body;

    try{
        if(fName && lName && who && gender && eMail && password){
            const checkEmailExists = await User.findOne({eMail});
            // check if user exists
            if(checkEmailExists){
                res.status(400).json({res:"Email already exists!!"});
            }else{
                // add user data into database
                const encryptedPassword = await bcrypt.hash(password,10);
                const saveData = await User.create({
                    fName,
                    lName,
                    who,
                    gender,
                    eMail,
                    password:encryptedPassword
                });

                const token = jwt.sign({
                    id:saveData._id,eMail
                },process.env.JWT_TOKEN,{expiresIn:process.env.EXPIRE_TIME});

                saveData.token = token
                saveData.password = undefined

                res.status(200).json(saveData);
            }
        }else{
            res.status(400).json({res:"All fields are required."});
        }
    }catch(e){
        console.log(e);
    }
});
app.post("/login", async (req,res)=>{
    const {email,password} = req.body;
    try{
        if(!(email && password)){
            res.status(400).json({res:"All fields are requied"});
        }else{
            const checkUserExists = await User.findOne({eMail:email});
            if(checkUserExists && (await bcrypt.compare(password,checkUserExists.password))){
                const token = jwt.sign({id:checkUserExists._id},process.env.JWT_TOKEN)
                let addTokenToUserRecord = await User.findByIdAndUpdate(checkUserExists._id,{token})
                let loginRes = {};
                loginRes.email = addTokenToUserRecord.eMail;
                loginRes.token = addTokenToUserRecord.token;
                loginRes.who = addTokenToUserRecord.who;
                // const options = {
                //     expires:new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                //     httpOnly:true,
                // }
                // res.cookie("token",token,options);
                res.status(200).json({
                    success:true,
                    loginRes
                })
            }else{
                res.status(400).json({success:false,"res":"Email and password is incorrect"});
            }
        }
    }catch(error){
        console.log(error);
    }
})
app.post("/verifyUserLogin",async (req,res)=>{
    // const {token} = req.body;
    try{
    let authHeader = JSON.parse(req.headers.authorization);
    let {email,token,who} = authHeader;
    const verifyingToken = await jwt.verify(token,process.env.JWT_TOKEN);
    if(verifyingToken === null || verifyingToken === "jwt expired"){    
            console.log(verifyingToken);
            res.status(401).json({auth:false,who:""});
        }else{
            const checkUserIsValid = await User.findOne({_id:verifyingToken.id});
            if((checkUserIsValid !== null) && (checkUserIsValid.eMail === email) && (checkUserIsValid.who == who)){
                res.status(200).json({auth:true,who}    );
            }else{
                res.status(200).json({auth:false});
            }
        }
    }catch(e){
        res.status(400).json({
            auth:false,
            message:e.message
        })
    }
});
app.post("/candidateDetail", cpUpload,async (req,res)=>{
    try{
            const {fName,
                lName,
                eMail,
                Who,current_company,
                primary_role,
                total_experience,
                current_CTC,gander} = req.body;
            const addUserInfo = await User.findOne({_id:req.body._id});
            if(addUserInfo !== null){
                const updateUserInfo = await User.findByIdAndUpdate({_id:req.body._id},{
                    fName,
                    lName,
                    eMail,
                    Who,current_company,
                    primary_role,
                    total_experience,
                    current_CTC,gander,
                },{new: true});
                // console.log(updateUserInfo);
                res.status(200).send({
                success:true,
                message:"Data Updated.",
                userInfo:updateUserInfo,
            })
            }
        // }
    }catch(e){
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
});
app.post("/candidateData", async (req,res)=>{
    try{
        const {id} = req.body;
        const verifyingToken = await jwt.verify(id,process.env.JWT_TOKEN);
        if(verifyingToken.id){
            // const userProfileData = await CandidateModel.aggregate([
            //     {
            //         $match:{
            //             current_company:"Live deftsoft"
            //         }
            //     },
            //     {
            //         $lookup:{
            //             from:"users",
            //             localField:"candidate_id",
            //             foreignField:"_id",
            //             // pipeline:[{_id:"6371b004a6319f77a45d013a"}],
            //             as:"userAllInfo"
            //         }
            //     },
            //     {
            //         $project:{
            //             userAllInfo:{
            //                 password:0
            //             }
            //         }
            //     }
            // ]);
                const userRegisterData = await User.findOne({_id:verifyingToken.id});
                userRegisterData.password = undefined;
                userRegisterData.token = undefined;  
                res.status(200).send({
                    success:true,
                    message:userRegisterData,
                })
            }else{
                res.status(400).send({
                    success:false,
                })
            }
    }catch(e){
        res.status(402).json({
            success:false,
            message:e.message
        });
    }
});
app.post("/employerDetail",singleUpload,async (req,res)=>{
    try{
            const {company,phone_number,industry,company_size} = req.body;
            const addUserInfo = await User.findOne({_id:req.body._id});
            if(addUserInfo !== null){
                const updateUserInfo = await User.findByIdAndUpdate({_id:req.body._id},{
                    company,phone_number,industry,company_size
                },{new:true});
                res.status(200).send({
                success:true,
                message:"Data saved.",
                userInfo:updateUserInfo,
            })
            }
    }catch(e){
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
});
app.post("/addjob", async (req,res)=>{
    try{
        const {id,role,experience,company,location,package,job_type,description} = req.body;
        if(!(id,role,experience,company,location,package,job_type,description)){
            res.status(400).json({
                success:false,
                message:"All fields are required."
            });    
        }else{
            const verifyToken = await jwt.verify(id,process.env.JWT_TOKEN)
            if(verifyToken.id){
                const addJob = await JobModel.create({employer_id:verifyToken.id,role,experience,company,location,package,job_type,description});
                    if(addJob){
                        res.status(200).json({
                            success:true,
                            message:"Job added",
                            job:addJob
                        });
                    }
            }
        }
    }catch(e){
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
})
app.post("/jobs", async (req,res)=>{
    try{
        const {id} = req.body;
        if(!(id)){
            res.status(400).json({
                success:false,
                message:"There is no job."
            });    
        }else{
            const verifyToken = await jwt.verify(id,process.env.JWT_TOKEN);
            if(verifyToken.id){
                const allJobs = await JobModel.find({employer_id:verifyToken.id});
                if(allJobs.length !== 0){
                    res.status(200).send({
                        success:true,
                        message:allJobs
                    });
                }else{
                    res.status(200).send({
                        success:false
                    });
                }
                
            }else{
                res.status(400).json({
                    success:false,
                    message:"There is no job."
                });    
            }
        }
    }catch(e){
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
})
app.get("/allJobs", async (req,res)=>{
    try{
        const allJobs = await JobModel.find();
        if(allJobs.length === 0){
            res.status(200).send({
                success:false,
                message:"There is Job right now."
            });
        }else{
            res.status(200).send({
                success:true,
                message:allJobs
            });
        }
    }catch(e){
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
})
app.post("/deleteJob", async (req,res)=>{
    try{
        const {id} = req.body;
        if(!(id)){
            res.status(400).json({
                success:false,
                message:"There is no job."
            });    
        }else{
                const deleteJobs = await JobModel.findByIdAndDelete({_id:id});
                const allJobs = await JobModel.find();
                res.status(200).send({
                    success:true,
                    message:allJobs
                });
            }
    }catch(e){
        res.status(400).json({
            success:false,
            message:e.message
        });
    }
})
app.post("/apply",async (req,res)=>{
    try{
        const {jobId,employerId,userId} = req.body;
        const verifyUser = await jwt.verify(userId,process.env.JWT_TOKEN);
        const findUserDetail = await User.findOne({_id:verifyUser.id});
        const jobName = await JobModel.findOne({_id:jobId});
        const checkUserHasApplied = await ApplyJobModel.findOne({ $and: [ { eMail:findUserDetail.eMail  }, { jobId:jobId  } ] });
        if(checkUserHasApplied === null){
        const addData = await ApplyJobModel({
            job_name:jobName.role,
            companyToApply:jobName.company,
            employer_id:employerId,
            jobId:jobId,
            fName:findUserDetail.fName,
            lName:findUserDetail.lName,
            eMail:findUserDetail.eMail,
            current_company:findUserDetail.current_company,
            primary_role:findUserDetail.primary_role,
            total_experience:findUserDetail.total_experience,
            current_CTC:findUserDetail.current_CTC,
            resume:findUserDetail.resume,
        });
        addData.save((err,resp)=>{
            console.log(err);
            if(!(err)){
                res.send({
                    success:true,
                    message:"Applied successfully."
                });
            }else{
                res.send({
                    success:false,
                    message:"Something went wrong."
                });
            }
        });
    }else{
        res.send({
            success:false,
            message:"You have alredy applied."
        });
    }
    }catch(e){
        res.send({
            success:false,
            message:e.message
        });
    }
})
app.get("/fetchAllapply",async (req,res)=>{
    try{
        const data = await ApplyJobModel.find();
        res.send({
            success:true,
            message:data
        }); 
    }catch(e){
        res.send({
            success:false,
            message:e.message
        });
    }
})
app.post("/sendEmail",async(req,res)=>{
    try{
        const {email,option,jobName,companyName} = req.body;
        console.log(email,option,jobName,companyName);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'shubhamchandel8777@gmail.com',
              pass: 'zhdyyfgszhftnarp'
            }
          });
          const mailOptions = {
            from: 'youremail@gmail.com',
            to: `developer@yopmail.com`,
            subject: `Sending Email regarding ${jobName} from ${companyName}`,
            text: (option === "accept")?"You are selected. We will contact you for interview":`You are not selected for the ${jobName} role`
          }
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              res.send({
                success:false,
                message:error.message
              })
            } else {
                res.send({
                    success:true,
                    message:"Email sent"
                });
            }
          });
    }catch(e){
        res.send({
            success:false,
            message:e.message
        })
    }
})
module.exports = app;



// https://dtillos.com/engineered-mesh-plants/