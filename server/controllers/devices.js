import responseObjectClass from '../helpers/responseObjectClass';
import device from '../models/devices';
import user from '../models/user';
import catchAsync from '../helpers/catchAsync';
import AppError from '../helpers/AppError';
import mongoose from 'mongoose';
import redis from 'redis';
import config from '../../config/env';
import {promisify} from 'util';


const newResponseObject = new responseObjectClass();

const client = redis.createClient({
    host: config.redisHost,
    port: config.redisPort
})

const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.setex).bind(client);

const registerDevice = catchAsync(async(req,res,next)=>{
    let{
        body:{
            deviceId,
            name,
            deviceType,
            currentState
        },
        user:{_id:userID}
    }= req;

    // const userID = '60bf4d668a0b5d453873db8c'; // for testing use any _id of user in DB
    
    if (!mongoose.Types.ObjectId.isValid(userID)) return next(new AppError('Invalid user', 404));

    let deviceObj = {
        name,
        deviceType,
        currentState,
        userID
    };

    if(deviceId){
        if (!mongoose.Types.ObjectId.isValid(deviceId)) return next(new AppError('Invalid DeviceId', 429));
        let foundDevice = await device.findById({_id:deviceId});
        if(!foundDevice) return next(new AppError('Update failed - Device not found', 404));
        const updateDevice = await device.findByIdAndUpdate({ _id: deviceId }, { $set: deviceObj });
        if (!updateDevice) return next(new AppError('Update failed', 500));
        
        const returnObj = newResponseObject.create({
            code: 200,
            success: true,
            message: 'Updated successfully',
            data: updateDevice._id,
        });
        res.send(returnObj);
    }

    const saveObj = await new device({ ...deviceObj }).save();
    if (!saveObj)
        return res.send(newResponseObject.create({ code: 409, message: 'Failed to register device' }));
    await user.findByIdAndUpdate({_id:userID ,devicesId:{ $nin: [saveObj._id] }},{ $push: { devicesId: saveObj._id } })
    const returnObj = newResponseObject.create({
        code: 200,
        success: true,
        message: 'Device registered successfully',
        data: saveObj._id,
    });
    res.send(returnObj);
});


const deviceDetails = catchAsync(async (req, res, next) => {
    let {
        query: { deviceId }
    } = req;

    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) return next(new AppError('Invalid Data', 409));

    const reply = await GET_ASYNC(deviceId);
    // console.log(reply)
    if(reply && Object.keys(reply).length !== 0){
        console.log('from cache');
        return res.send(JSON.parse(reply))
    }

    const deviceData = await device.findById({ _id: deviceId }).lean();

    const returnObj = newResponseObject.create({
        code: 200,
        success: true,
        message: 'Device details found',
        data: deviceData,
    });

    const saveResult = await SET_ASYNC(deviceId,60,JSON.stringify(deviceData));
    console.log('data savein cache',saveResult)

    return res.send(returnObj);

});

const deviceDelete = catchAsync(async (req,res,next)=>{
    let {
        query: { deviceId },
        user:{_id:userID}
    } = req;

    // const userID = '60bf4d668a0b5d453873db8c'; // for testing use any _id of user in DB

    if (!mongoose.Types.ObjectId.isValid(deviceId)) return next(new AppError('Invalid Data', 409));
    const delDevice = await device.findByIdAndDelete({ _id: deviceId }).lean();

    await user.findByIdAndUpdate({_id:userID ,devicesId:{ $in: [deviceId] }},{ $pull: { devicesId: deviceId } })

    const returnObj = newResponseObject.create({
        code: 200,
        success: true,
        message: 'Device deleted',
        data: {},
    });
    return res.send(returnObj);

});

const deviceShare = catchAsync(async(req,res,next)=>{
    let{
        body:{
            email,
            deviceId
        },
    }= req;
    
    if (!mongoose.Types.ObjectId.isValid(deviceId)) return next(new AppError('Invalid device', 404));


    let findUser = await user.findOne({'contactDetails.email':email}).lean();
    if(!findUser) return next(new AppError('Need to register this user first',409));

    let updateDevice = await device.findOneAndUpdate({_id:deviceId,userID:{$nin:[findUser._id]}},{$push:{userID:findUser._id}})
    let updateUser = await user.findOneAndUpdate({_id:findUser._id,devicesId:{ $nin: [deviceId] }},{ $push: { devicesId: deviceId } })
    if(!updateDevice || !updateUser) return next(new AppError('Sharing failed',500));

    const returnObj = newResponseObject.create({
        code: 200,
        success: true,
        message: 'Device Shared Successfully',
        data: {},
    });
    return res.send(returnObj);
    });

const changeState = catchAsync(async(req,res,next)=>{
    let{ changeStateValue,deviceId} = req.body;

    if (!mongoose.Types.ObjectId.isValid(deviceId)) return next(new AppError('Invalid device', 404));

    let updateDeviceState = await device.findByIdAndUpdate({_id:deviceId},{$set:{currentState:changeStateValue}})
    if(!updateDeviceState) return next(new AppError('changeState failed',500));

    const returnObj = newResponseObject.create({
        code: 200,
        success: true,
        message: 'Device stateChange Successfully',
        data: {},
    });
    return res.send(returnObj);
})

export default{
    registerDevice,
    deviceDetails,
    deviceDelete,
    deviceShare,
    changeState
}