import mongoose from "mongoose";


export const connectDB = async () =>{
    try {
       const connection =  await mongoose.connect(process.env.MONGO_URI)
       console.log(`Mongodb Connected in ${connection.connection.host}`)
        
    } catch (error) {
        console.log(`Error in ${error.message}`)
        process.exit(1)
    }

}