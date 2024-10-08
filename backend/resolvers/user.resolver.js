import bcrypt from 'bcryptjs'
import Transaction from '../models/transactionModel.js'
import User from '../models/userModels.js'
const userResolver = {
   Query:{
      authUser:async(_,__,context)=>{
         try {
            const user = await context.getUser()
            return user
         } catch (error) {
            console.log(error,'error in auth user')
         }
      },
      user: async (_, { userId }) => {
			try {
				const user = await User.findById(userId);
				return user;
			} catch (err) {
				console.error("Error in user query:", err);
				throw new Error(err.message || "Error getting user");
			}
		},
   },
   Mutation:{
      signUp: async(_,{input},context)=>{
         try {
				const { username, name, password, gender } = input;

				if (!username || !name || !password || !gender) {
					throw new Error("All fields are required");
				}
				const existingUser = await User.findOne({ username });
				if (existingUser) {
					throw new Error("User already exists");
				}

				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(password, salt);

				// https://avatar-placeholder.iran.liara.run/
				const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
				const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

				const newUser = new User({
					username,
					name,
					password: hashedPassword,
					gender,
					profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
				});

				await newUser.save();
				await context.login(newUser);
				return newUser;
			}  catch (error) {
            console.log(error,'error in sign up')
         }
      },
      login: async(_,{input},context)=>{
         try {
            const {username,password} = input
            const {user} = await context.authenticate('graphql-local',{username,password})
            await context.login(user)
            return user;
         } catch (error) {
            console.log(error,'error in login')
         }
      },
      logout: async (_, __, context) => {
         try {
           await context.logout();   
           if (context.req && context.req.session) {
             context.req.session.destroy((err) => {
               if (err) {
                 throw new Error('Error in session destruction');
               }
             });
             context.res.clearCookie('connect.sid');
           }
           return { message: 'Successfully logged out' };
         } catch (error) {
           console.error('Error in logout:', error);
           throw new Error('Logout failed');
         }
       }
   },

   User: {
		transactions: async (parent) => {
			try {
				const transactions = await Transaction.find({ userId: parent._id });
				return transactions;
			} catch (err) {
				console.log("Error in user.transactions resolver: ", err);
				throw new Error(err.message || "Internal server error");
			}
		},
	},
   }
   
   export default userResolver