import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  // NEW: The Tag
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User model
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String, 
    default: null 
  }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;