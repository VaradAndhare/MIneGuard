import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    source: String,
    similarity: Number,
    sourceType: String,
    matchedText: String,
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
    },

    fileName: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    similarity: {
      type: Number,
      default: 0,
    },

    originality: {
      type: Number,
      default: 100,
    },

    simhash: {
      type: String,
      default: "",
    },

    fingerprints: {
      type: [Number],
      default: [],
    },

    matches: {
      type: [MatchSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Document",
  DocumentSchema
);