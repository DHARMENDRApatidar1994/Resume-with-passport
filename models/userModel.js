const mongooose = require("mongoose");


const plm = require("passport-local-mongoose")

const userSchema = new mongooose.Schema({
    username: String,
    password: String,
    contact: String,
    email: String,

    avatar: {
        type: String,
        default: "default.png",
    },
    links: {
        type: Object,
        default:{
            linkedin: "",
            github: "",
            behance: "",
        },
    },

    education: {
        type: Array,
        default: [],
    },
    skill: {
        type: Array,
        default: [],
    },
    project: {
        type: Array,
        default: [],
    },
    experience: {
        type: Array,
        default: [],
    },
    interest: {
        type: Array,
        default: [],
    },


},
{ timestamps: true
}
);

userSchema.plugin(plm);

const user = mongooose.model("user", userSchema);
module.exports = user;