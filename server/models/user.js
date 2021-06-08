const mongoose = require("mongoose");
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
let md5 = require('js-md5');

const securityKey = 'Smitch-task';

md5 = (text) => crypto.createHash('md5').update(text).digest();

const Schema = mongoose.Schema;

const userSchema = new Schema({
    createdOn: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    fName: { type: String, default: '' },
    lName: { type: String, default: '' },
    contactDetails: {
        email: { type: String, required: true },
        emailVerified: { type: Boolean, default: false },
        mobile: {
            callingCode: { type: String, default: '91', required: true },
            number: { type: String, required: true },
            isVerified: { type: Boolean, default: false },
        },
    },
    password: { type: String, required: true, select: false },
    devicesId:[{type: mongoose.Schema.Types.ObjectId, ref: 'device'}]
},
    { timestamps: { createdAt: 'createdOn', updatedAt: 'lastModified' } }
);

/**
 * converts the String value of the password to some hashed value
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// eslint-disable-next-line
userSchema.pre('save', function userSchemaPre(next) {
    const user = this;

    if (this.isModified('password') || this.isNew) {
        // eslint-disable-next-line

        const encrypt = (text, secretKey) => {
            secretKey = md5(secretKey);
            secretKey = Buffer.concat([secretKey, secretKey.slice(0, 8)]);
            const cipher = crypto.createCipheriv('des-ede3', secretKey, '');
            const encrypted = cipher.update(text, 'utf8', 'base64');
            return encrypted + cipher.final('base64');
        };
        user.password = encrypt(user.password, securityKey);
        next();
    } else {
        return next();
    }
});

/**
 * comapare the stored hashed value of the password with the given value of the password
 * @param pw - password whose value has to be compare
 * @param cb - callback function
 */
userSchema.methods.comparePassword = function comparePassword(pw, cb) {
    const user = this;
    // eslint-disable-next-line
    // pw is the incoming password
    // user.password is the old password
    let isMatch;
    const encrypt = (text, secretKey) => {
        secretKey = md5(secretKey);
        secretKey = Buffer.concat([secretKey, secretKey.slice(0, 8)]);
        const cipher = crypto.createCipheriv('des-ede3', secretKey, '');
        const encrypted = cipher.update(text, 'utf8', 'base64');
        return encrypted + cipher.final('base64');
    };
    const encrypted = encrypt(pw, securityKey);
    isMatch = encrypted === user.password;
    cb(null, isMatch);
};

userSchema.index({
    'contactDetails.mobile.number': 1,
    'contactDetails.email': 1,
});

module.exports = mongoose.model('user', userSchema);
