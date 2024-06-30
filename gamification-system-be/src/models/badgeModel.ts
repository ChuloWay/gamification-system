import mongoose, { Document, Schema } from "mongoose";

export interface IBadge extends Document {
  name: string;
  description: string;
  minPoints: number;
  maxPoints: number;
}

const badgeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  minPoints: { type: Number, required: true },
  maxPoints: { type: Number, required: true },
});

export default mongoose.model<IBadge>("Badge", badgeSchema);
