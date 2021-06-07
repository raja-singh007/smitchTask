const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    createdOn: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    name: { type: String, default: '' },
    deviceType:{
        type: String,
        enum: ['AA', 'AB', 'AC', 'BA', 'BB', 'BC'],
        default: 'AA',
        required: true
    },
    currentState:{type: Boolean, default: false },
    userID:{type:mongoose.Schema.Types.ObjectId, ref: 'user'}
},
{ timestamps: { createdAt: 'createdOn', updatedAt: 'lastModified' }}
)