const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;
const {MongoDB_URI, serverSalt} = require('./config');
const cloudinary = require('cloudinary');
const DateOnly = require('mongoose-dateonly')(mongoose);

cloudinary.config({
    cloud_name: 'myshows',
    api_key: '333599112473193',
    api_secret: 'luyAnRH_n6Wu6AXWYP_VE7C7UYI'
});
mongoose.Promise = global.Promise;
mongoose.connect(MongoDB_URI);

mongoose.connection.on('connected', () => console.log('Connected to MongoDB successfully'));

const counterSchema = new Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counters', counterSchema);

const userSchema = new Schema({
    _id: {type: Number, default: 0},
    username: {
        type: String,
        validate: {
            validator: (link) => {
                return /^[-\w]{5,30}$/.test(link);
            },
            message: "Please, enter valid username!!!"
        },
        required: [true, 'Username is required field to fill!!!'],
        unique: true,
    },
    list: {
        type: Array
    },
    email: {
        type: String,
        validate: {
            validator: (link) => {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(link);
            },
            message: "Please, enter valid email!!!"
        },
        required: [true, 'Email is required field to fill!!!']
    },
    passwordHash: {
        type: String,
        minLength: 5,
        validate: {
            validator: (link) => {
                return /\w{4,}\d\w*/.test(link);
            },
            message: "Please, enter valid password!!!"
        },
        required: [true, "Passwords are required fields and must be equal!!!"]
    },
    role: {
        type: String,
        default: "user"
    }
},{ versionKey: false });
userSchema.pre('save', async function(next) {
    try {
    if (this.passwordHash) this.passwordHash = sha512(this.passwordHash, serverSalt).passwordHash;
    this._id = (await counter.findByIdAndUpdate({_id: 'users'}, {$inc: {seq: 1}}).exec()).seq;
    next();
    }catch (err) {
        console.log(err);
    }
});

const showSchema = new Schema({
    _id: {type: Number, default: 0},
    name: {
        type: String,
        validate: {
            validator: (link) => {
                return /^[A-Z][\s\S]+$/.test(link);
            },
            message: "Please, enter valid Name!!!"
        },
        required: [true, 'Name is required field to fill!!!'],
        unique: true,
    },
    genre: {
        type: String,
        required: [true, 'Genre is required field to fill!!!']
    },
    views: {
        type: Number,
        default: 0
    },
    country: {
        type: String,
        required: [true, 'Country is required field to fill!!!']
    },
    ratingIMDB: {
        type: Number,
        min: 0,
        max: 10,
        required: [true, 'RatingIMDB is required field to fill!!!']
    },
    duration: {
        type: Number,
        min: 1,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
        },
        required: [true, 'Duration is required field to fill!!!']
    },
    dateRelease: {
        type: DateOnly,
        required: [true, 'DateRelease is required field to fill!!!']
    },
    description: {
        type: String,
        // validate: {
        //     validator: (link) => {
        //         return /^[A-Za-z!?,.']+$/.test(link);
        //     },
        //     message: "Please, enter valid description!!!"
        // },
        required: [true, 'Description is required field to fill!!!']
    },
    image: {
        type: String,
        required: [true, 'Image is required field and must be .png | .jpg | . jpeg | .gif!!!']
    },
    video: {
        type: String,
        required: [true, 'Image is required field and must be']
    },
},{ versionKey: false });
showSchema.pre('save', async function(next) {
    this._id = (await counter.findByIdAndUpdate('shows', {$inc: {seq: 1}}).exec()).seq;
    this.image = await uploadImage(this.image, this._id);
    this.video = await uploadVideo(this.video, this._id);
    next();
});
showSchema.post('remove', async function (obj) {
    await cloudinary.v2.uploader.destroy(`shows/${obj._id}`);
    await cloudinary.v2.uploader.destroy(`videos/${obj._id}`);
});

async function uploadImage(imageStr, id) {
    return (await cloudinary.v2.uploader.upload(`data:image/jpg;base64,${imageStr}`, {
        public_id: `shows/${id}`,
        format: 'jpg',
    })).secure_url;
}

async function uploadVideo(videoStr, id) {
    return (await cloudinary.v2.uploader.upload(`data:video/mp4;base64,${videoStr}`, {
        public_id: `videos/${id}`,
        resource_type: "video",
        format: 'mp4',
    })).secure_url;
}

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const passwordHash = hash.digest('hex');
    return { salt, passwordHash }
}


module.exports = {
    User: mongoose.model('users', userSchema),
    Show: mongoose.model('shows', showSchema),
    uploadImage,
    uploadVideo,
    sha512
};