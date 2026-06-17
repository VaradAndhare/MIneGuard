import mongoose from "mongoose";
const ImageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false,
    },
    fileName: {
        type: String,
        required: true,
    },
    imageHash: {
        type: String,
        required: true,
    },
    similarity: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Image", ImageSchema);
