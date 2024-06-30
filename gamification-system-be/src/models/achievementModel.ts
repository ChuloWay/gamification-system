import mongoose, { Document, Schema } from "mongoose";

export interface IAchievement extends Document {
  name: string;
  description: string;
  points: number;
}

const achievementSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
});

export default mongoose.model<IAchievement>("Achievement", achievementSchema);
