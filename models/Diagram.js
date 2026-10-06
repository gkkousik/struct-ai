const mongoose = require('mongoose');

const diagramSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    project: { type: String, required: true, trim: true },
    diagramType: { type: String, required: true },
    theme: { type: String, default: 'Default' },
    syntax: { type: String, required: true },
    // The rendered PNG is stored directly in MongoDB (Binary) so history
    // works the same way no matter where the app is deployed — no reliance
    // on local disk persistence.
    imageData: { type: Buffer, required: true },
    imageMimeType: { type: String, default: 'image/png' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

diagramSchema.index({ user: 1, createdAt: -1 });

diagramSchema.methods.toDict = function toDict(username) {
  return {
    id: this._id.toString(),
    username,
    project: this.project,
    diagram_type: this.diagramType,
    theme: this.theme,
    syntax: this.syntax,
    image_path: `/diagram/${this._id.toString()}/image`,
    created_at: this.createdAt.toISOString(),
  };
};

module.exports = mongoose.model('Diagram', diagramSchema);
