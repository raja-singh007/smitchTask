import Joi from 'joi';

export default {

    //post route for singn-up
    createUser: {
        body: {
            password: Joi.string().min(6).required(),
            fName: Joi.string().required().allow(''),
            lName: Joi.string().required(),
            email: Joi.string().email().required(),

            mobile: Joi.string()
                .min(7)
                .max(15)
                .required()
                .regex(/^[0-9]*$/),
        }
    },
    // POST /api/auth/login
    login: {
        body: {
            password: Joi.string().required(),
            username: Joi.string().required(),
        },
    },
    registerDevice:{
        body:{
            name: Joi.string().required(),
            deviceType: Joi.string().required(),
            currentState: Joi.boolean().required()
        }
    },
    getDeviceDetail: {
        query: {
            deviceId: Joi.string().required(),
        }
    },
    deleteDevice: {
        query: {
            deviceId: Joi.string().required(),
        }
    },
    shareDevice:{
        body:{
            email:Joi.string().email().required(),
            deviceId : Joi.string().required()
        }
    },

}