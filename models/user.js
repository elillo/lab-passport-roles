const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/* Como vamos a crear un modelo, necesitamos requerir estos paquetes */


const userSchema = new Schema({
    username: String,
    password: String,
    role: { type: String, enum: ["Boss", "Developer", "TA"] }
}, {

    timeStamps: { createdAt: "created_at", updatedAt: "updated_at" }

});


// En este modelo, especificamos los roles ya que vamos a confirurar para que el jefe 
// tenga prioridad de acceso

const User = mongoose.model("User", userSchema);

module.exports = User;