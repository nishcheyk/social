import { Schema, model, Document, Types } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;      // Mongoose ObjectId type
  username: string;
  passwordHash: string;
  refreshToken?: string | null;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  refreshToken: { type: String, default: null },
}, {
  timestamps: true,  
});

export const UserModel = model<IUser>('User', userSchema);
