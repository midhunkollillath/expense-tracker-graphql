import Transaction from "../models/transactionModel.js";
import User from '../models/userModels.js'

const TransactionResolver ={
    Query:{
        transactions:async(_,__,context)=>{
            try {
                if( !context.getUser()){
                     throw new Error ('Unauthorized');
                }
                const userId = await context.getUser()._id
                const transactions = await Transaction.find({userId:userId})
                return transactions
            } catch (error) {
               throw new Error (error)
            }
        },
        transaction :async(_,{transactionId},)=>{
            try {

                const transaction = await Transaction.findById(transactionId)
                return transaction
            } catch (error) {
               console.log(error,'error in transaction') 
            }
        },
        categoryStatistics :async(_,__,context)=>{
            if( !context.getUser()){
                throw new Error('Unauthorized')
            }
            const userId = context.getUser()._id
            const transactions = await Transaction.find({userId})
            const categoryMap={}
            transactions.forEach((transaction) => {
				if (!categoryMap[transaction.category]) {
					categoryMap[transaction.category] = 0;
				}
				categoryMap[transaction.category] += transaction.amount;
			});
            return Object.entries(categoryMap).map(([category, totalAmount]) => ({ category, totalAmount }));

        }
    },
    Mutation:{
        createTransaction:async(_,{input},context)=>{
            try {

            const newTransaction = new Transaction({
                ...input,
                userId: context.getUser()._id, // Ensure userId is fetched correctly
            });

            // Save the transaction
            await newTransaction.save();

            // Return the newly created transaction
            return newTransaction;

            } catch (error) {
                console.log(error)
            }
          
        },
        updateTransaction:async(_,{input},context)=>{
            try {
                console.log(input,'--------------%%%')
                const updatedTransaction = await Transaction.findByIdAndUpdate(input.transactionId,input,{new:true})
                return updatedTransaction
            } catch (error) {
                console.log(error,'error in updating transaction')
            }
        
        },
        deleteTransaction:async(_,{transactionId})=>{
            try {
                const deleteTransaction = await Transaction.findByIdAndDelete(transactionId)
                return deleteTransaction
            } catch (error) {
                console.log(error,'error in deleting transaction')
            }
        },
    },
    Transaction: {
		user: async (parent) => {
			const userId = parent.userId;
			try {
				const user = await User.findById(userId);
				return user;
			} catch (err) {
				console.error("Error getting user:", err);
				throw new Error("Error getting user");
			}
		},
	},
   }
   
   
   export default TransactionResolver