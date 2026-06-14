const Wallet = require('../models/wallet');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const paystackService = require('../services/payStackService');


class WalletController {
  async getWallet(req, res) {
    try {
      const wallet = await Wallet.findOne({
        userId: req.user._id,
      });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wallet',
      });
    }
  }

  async getTransactions(req, res) {
    try {
      const transactions = await Transaction.find({
        userId: req.user._id,
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
      });
    }
  }

  async fundWallet(req, res) {
    try {
      const { amount, redirectUrl } = req.body;

      if (!amount || amount < 100) {
        return res.status(400).json({
          success: false,
          message: 'Minimum funding amount is ₦100',
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const reference =
        paystackService.generateReference();

      const callbackUrl =
        `${process.env.BACKEND_URL}/api/wallet/verify/${reference}`;

      const payment =
        await paystackService.initializeTransaction({
          email: user.email,
          amount,
          reference,
          callback_url: callbackUrl,
          metadata: {
            userId: user._id.toString(),
            amount,
            redirectUrl,
            type: 'wallet_funding',
          },
        });

      if (!payment.success) {
        return res.status(400).json({
          success: false,
          message: payment.message,
        });
      }

      return res.status(200).json({
        success: true,
        authorization_url:
          payment.data.data.authorization_url,
        reference,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Failed to initialize funding',
      });
    }
  }
  async verifyWalletFunding(req, res) {
    try {
      const { reference } = req.params;

      const verification =
        await paystackService.verifyTransaction(
          reference
        );

      if (
        !verification.success ||
        verification.data?.data?.status !== 'success'
      ) {
        const redirectUrl =
          verification?.data?.data?.metadata
            ?.redirectUrl || '/';

        return res.redirect(
          `${redirectUrl}?status=failed`
        );
      }

      const metadata =
        verification.data.data.metadata;

      const {
        userId,
        amount,
        redirectUrl,
      } = metadata;

      /**
       * Prevent double crediting
       */
      const existingTransaction =
        await Transaction.findOne({
          reference,
        });

      if (existingTransaction) {
        return res.redirect(
          `${redirectUrl}?status=success&reference=${reference}`
        );
      }

      let wallet = await Wallet.findOne({
        userId,
      });

      if (!wallet) {
        wallet = await Wallet.create({
          userId,
          userType: 'student',
        });
      }

      const previousBalance = wallet.balance;

      wallet.credit(Number(amount));

      await wallet.save();

      const transaction =
        await Transaction.create({
          walletId: wallet._id,
          userId,

          transactionType:
            'wallet_funding',

          amount: Number(amount),

          status: 'completed',

          currency: 'NGN',

          description:
            'Wallet funding via Paystack',

          reference,

          balanceSnapshot: {
            previous: previousBalance,
            new: wallet.balance,
          },

          processedAt: new Date(),
        });

      wallet.transactions.push(
        transaction._id
      );

      wallet.totalTransactions += 1;

      await wallet.save();

      return res.redirect(
        `${redirectUrl}?status=success&amount=${amount}&reference=${reference}`
      );
    } catch (error) {
      console.error(
        'verifyWalletFunding:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Verification failed',
      });
    }
  }
}

module.exports = new WalletController();