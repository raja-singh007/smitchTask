import responseObjectClass from '../helpers/responseObjectClass';
import user from '../models/user';
import { generateJWT } from '../helpers/authentication';
import catchAsync from '../helpers/catchAsync';
import AppError from '../helpers/AppError';


const responseObject = new responseObjectClass();

const create = catchAsync(async (req, res, next) => {

    let {
        body: {
            fName,
            lName,
            password,
            email,
            callingCode = '91',
            mobile,
        },
        headers: {
            'x-custom-language': language = 'en',
            'x-custom-country': country = 'in',
        },
    } = req;

    let foundUser = await user.findOne({
        $or: [
            { 'contactDetails.email': email.toLowerCase() },
            { 'contactDetails.mobile.number': mobile },
        ],
    }).lean();

    if (foundUser) return next(new AppError('You are already registered. Please Login.', 204));

    let userObj = {
        fName,
        lName,
        password,
        contactDetails: {
            email: email.toLowerCase(),
            mobile: { callingCode, number: mobile },
        },
        locality: { country, language },
    };

    let savedUser = await user.create({ ...userObj });

    let updatedUser = await savedUser.save();


    const obj = {
        locality: updatedUser.locality,
        firstName: updatedUser.fName,
        lastName: updatedUser.lName,
        email: updatedUser.contactDetails.email,
        callingCode: updatedUser.contactDetails.mobilecallingCode,
        phone: updatedUser.contactDetails.mobile.number,
    };

    const returnObj = responseObject.create({
        code: 200,
        success: true,
        message: 'User Created Successfully',
        data: { user: obj },
    });
    return res.send(returnObj);


})

const login = catchAsync(async (req, res, next) => {
    let {
        body: { username, password }
    } = req;
    const foundUser = await user.findOne(
        {
            $or: [{ 'contactDetails.email': username }, { 'contactDetails.mobile.number': username }],

        },
        '+password'
    );
    if (!foundUser) return next(new AppError('Invalid Email/Phone No.', 404));

    foundUser.comparePassword(password, async (passwordError, isMatch) => {
        if (isMatch) {
            const token = await generateJWT(foundUser);

            const userObj = {
                locality: foundUser.locality,
                email: foundUser.contactDetails.email,
                phone: foundUser.contactDetails.mobilenumber,
                callingCode: foundUser.contactDetails.mobile.callingCode,
                firstName: foundUser.fName,
                lastName: foundUser.lName,
               };

            const returnObj = responseObject.create({
                code: 200,
                success: true,
                message: 'User successfully logged in',
                data: { jwtAccessToken: `JWT ${token}`, user: userObj },
            });
            return res.send(returnObj);
        } else {
            const returnObj = responseObject.create({
                code: 401,
                message: 'Incorrect Password',
            });
            return res.send(returnObj);
        }

    })



})

export default {
    create,
    login,
};