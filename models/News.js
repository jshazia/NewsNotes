var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NewsSchema = new Schema ({

    title: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    },

    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }

});

var News = mongoose.model("News", NewsSchema);
module.exports = News;